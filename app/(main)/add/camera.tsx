import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "@/constants/theme";
import type { Food } from "@/types";
import { getProductByBarcode } from "@/utils/api";

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Food | null>(null);

  const resetScan = () => {
    setScanned(false);
    setProduct(null);
    setError(null);
  };

  const handleRequestPermission = async () => {
    if (!permission?.canAskAgain) {
      if (Platform.OS === "ios") {
        Linking.openURL("app-settings:");
      } else {
        Linking.openSettings();
      }
      return;
    }
    await requestPermission();
  };

  const handleAddProduct = () => {
    if (product) {
      router.push({
        pathname: "/add",
        params: {
          product: JSON.stringify(product),
          timestamp: Date.now().toString(),
        },
      });
    }
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setLoading(true);
    setError(null);
    setProduct(null);

    try {
      const result = await getProductByBarcode(data);
      if (!result) {
        setError("Produit non trouvé dans la base.");
      } else {
        setProduct(result);
      }
    } catch (err) {
      setError("Impossible de récupérer le produit.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Demande de permission caméra…</Text>
      </View>
    );
  }
  if (!permission.granted) {
    const message = permission.canAskAgain
      ? "Pour scanner les codes-barres, nous avons besoin d'accéder à votre caméra"
      : "L'accès à la caméra est refusé. Veuillez l'activer dans les paramètres de votre appareil";

    const buttonText = permission.canAskAgain
      ? "Autoriser la caméra"
      : "Ouvrir les paramètres";

    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionContent}>
          <View style={styles.cameraIconContainer}>
            <Ionicons name="camera-outline" size={80} color="#ccc" />
          </View>
          <Text style={styles.permissionMessage}>{message}</Text>
          <Pressable
            style={styles.permissionButton}
            onPress={handleRequestPermission}
          >
            <Text style={styles.permissionButtonText}>{buttonText}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      <View style={styles.scanFrame} />

      <View style={styles.overlay}>
        {loading && <ActivityIndicator color="#fff" />}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.error}>{error}</Text>
          </View>
        )}
        {product && (
          <View style={styles.productCard}>
            {product.image_url && (
              <Image
                source={{ uri: product.image_url }}
                style={styles.productImage}
              />
            )}
            <Text style={styles.productName}>{product.name}</Text>
            {!!product.brand && (
              <Text style={styles.productMeta}>{product.brand}</Text>
            )}
            <Text style={styles.productMeta}>
              {product.calories} kcal / 100g · Nutri-Score{" "}
              {product.nutriscore || "?"}
            </Text>
          </View>
        )}
        {scanned && (
          <>
            <Pressable style={styles.button} onPress={handleAddProduct}>
              <Text style={styles.buttonText}>Ajouter ce produit</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={resetScan}>
              <Text style={styles.buttonText}>Scanner à nouveau</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    gap: 10,
  },
  productCard: {
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  productImage: {
    width: 160,
    height: 160,
    borderRadius: 8,
    marginBottom: 12,
    resizeMode: "contain",
  },
  productName: {
    color: "#fff",
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  productMeta: {
    color: "#cfd8dc",
    fontSize: 12,
  },
  errorContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  error: {
    color: "#f44336",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#666",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  scanFrame: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 300,
    height: 120,
    marginTop: -60,
    marginLeft: -150,
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  permissionContent: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  cameraIconContainer: {
    marginBottom: 24,
  },
  permissionMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
