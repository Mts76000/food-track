import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { Food, Meal } from "@/types";
import { searchProducts } from "@/utils/api";
import { formatDateISO } from "@/utils/date";
import { calculateFoodNutrition } from "@/utils/nutrition";
import {
  clearCurrentMealFoods,
  getCurrentMealFoods,
  getMeals,
  saveCurrentMealFoods,
  saveMeals,
} from "@/utils/storage";

type MealType = "Petit-déjeuner" | "Déjeuner" | "Dîner" | "Snack";

const MEAL_TYPES: MealType[] = ["Petit-déjeuner", "Déjeuner", "Dîner", "Snack"];

export default function AddMealScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [mealType, setMealType] = useState<MealType | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFoods, setSelectedFoods] = useState<Food[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [pendingFood, setPendingFood] = useState<Food | null>(null);
  const [quantityInput, setQuantityInput] = useState("100");
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);
  const lastProcessedTimestamp = useRef<string | null>(null);

  const openQuantityModal = (food: Food) => {
    setPendingFood(food);
    setQuantityInput(String(food.quantity ?? 100));
    setShowQuantityModal(true);
  };

  const handleConfirmQuantity = () => {
    const parsed = Number(quantityInput.replace(",", "."));
    const quantity = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;

    if (!pendingFood || quantity <= 0) return;

    setSelectedFoods((prev) => [...prev, { ...pendingFood, quantity }]);
    setQuery("");
    setResults([]);
    setPendingFood(null);
    setShowQuantityModal(false);
    Keyboard.dismiss();
  };

  const showNotification = (
    type: "success" | "error" | "warning",
    message: string,
    duration = 2500,
  ) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), duration);
  };

  const debouncedQuery = useDebouncedValue(query, 450);

  useEffect(() => {
    const loadCurrentMeal = async () => {
      const foods = await getCurrentMealFoods();
      setSelectedFoods(
        foods.map((food: Food) => ({
          ...food,
          quantity: food.quantity ?? 100,
        })),
      );
      setIsLoaded(true);
    };
    loadCurrentMeal();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    saveCurrentMealFoods(selectedFoods);
  }, [selectedFoods, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    const timestamp = params?.timestamp as string;
    if (
      params?.product &&
      timestamp &&
      timestamp !== lastProcessedTimestamp.current
    ) {
      lastProcessedTimestamp.current = timestamp;
      try {
        const product = JSON.parse(params.product as string);
        const exists = selectedFoods.some((f) => f.id === product.id);
        if (exists) {
          showNotification("warning", "Produit déjà ajouté");
        } else {
          openQuantityModal({ ...product, quantity: product.quantity ?? 100 });
        }
      } catch (e) {
        console.error("Erreur parsing produit", e);
      }
    }
  }, [params?.timestamp, params?.product, isLoaded]);

  const handleValidateMeal = async () => {
    if (!mealType) {
      showNotification("error", "Veuillez sélectionner un type de repas");
      return;
    }
    if (selectedFoods.length === 0) {
      showNotification("error", "Ajoutez au moins un aliment");
      return;
    }

    try {
      const dateString = formatDateISO(selectedDate);
      const meals = await getMeals();

      const existingMeal = meals.find(
        (m: Meal) => m.date === dateString && m.name === mealType,
      );

      if (existingMeal) {
        showNotification(
          "error",
          `Vous avez déjà un ${mealType} ce jour-là`,
          4000,
        );
        return;
      }

      const meal: Meal = {
        id: Date.now().toString(),
        name: mealType,
        date: dateString,
        foods: selectedFoods,
      };

      meals.push(meal);
      await Promise.all([saveMeals(meals), clearCurrentMealFoods()]);

      setSelectedFoods([]);
      setMealType(null);
      setSelectedDate(new Date());

      showNotification("success", "Repas enregistré avec succès");
      setTimeout(() => router.push(`/(home)/${meal.id}`), 1000);
    } catch (e) {
      console.error("Erreur sauvegarde repas", e);
      showNotification("error", "Erreur lors de l'enregistrement");
    }
  };

  useEffect(() => {
    const runSearch = async () => {
      const trimmed = debouncedQuery.trim();
      if (!trimmed) {
        setResults([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const products = await searchProducts(trimmed);
        setResults(products);
      } catch (err) {
        setError("Impossible de récupérer les résultats.");
      } finally {
        setLoading(false);
      }
    };

    runSearch();
  }, [debouncedQuery]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.containerContent}
      keyboardShouldPersistTaps="handled"
    >
      {notification && (
        <View
          style={[
            styles.notification,
            notification.type === "success" && styles.notificationSuccess,
            notification.type === "error" && styles.notificationError,
            notification.type === "warning" && styles.notificationWarning,
          ]}
        >
          <Ionicons
            name={
              notification.type === "success"
                ? "checkmark-circle"
                : notification.type === "error"
                  ? "close-circle"
                  : "warning"
            }
            size={20}
            color="#fff"
            style={styles.notificationIcon}
          />
          <Text style={styles.notificationText}>{notification.message}</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Date du repas</Text>
      <Pressable
        style={styles.dateInput}
        onPress={() => setShowDatePicker(true)}
      >
        <Ionicons name="calendar-outline" size={20} color="#4caf50" />
        <Text style={styles.dateInputText}>
          {selectedDate.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Text>
      </Pressable>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={new Date()}
          onChange={(event, date) => {
            if (Platform.OS === "android") {
              setShowDatePicker(false);
            }
            if (date) {
              setSelectedDate(date);
            }
          }}
        />
      )}

      {showDatePicker && Platform.OS === "ios" && (
        <Pressable
          style={styles.datePickerCloseButton}
          onPress={() => setShowDatePicker(false)}
        >
          <Text style={styles.datePickerCloseButtonText}>Valider</Text>
        </Pressable>
      )}

      <Text style={styles.sectionTitle}>Type de repas</Text>
      <View style={styles.mealTypesRow}>
        {MEAL_TYPES.map((type) => {
          const active = type === mealType;
          return (
            <Pressable
              key={type}
              style={[styles.mealTypeChip, active && styles.mealTypeChipActive]}
              onPress={() => setMealType(type)}
            >
              <Text
                style={[
                  styles.mealTypeText,
                  active && styles.mealTypeTextActive,
                ]}
              >
                {type}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.searchRow}>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher un produit"
            style={styles.input}
            placeholderTextColor="#999"
          />
        </View>
        <Link href="/add/camera" asChild>
          <Pressable style={styles.qrButton}>
            <Ionicons name="barcode" size={24} color="#fff" />
          </Pressable>
        </Link>
      </View>

      {loading && <ActivityIndicator style={styles.loading} />}
      {error && <Text style={styles.error}>{error}</Text>}

      {results.length > 0 && (
        <View style={styles.resultsOverlay}>
          <View style={styles.resultsList}>
            {results.map((item) => (
              <Pressable
                key={item.id}
                style={styles.resultCard}
                onPress={() => {
                  openQuantityModal({
                    ...item,
                    quantity: item.quantity ?? 100,
                  });
                }}
              >
                {item.image_url ? (
                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.resultImage}
                  />
                ) : (
                  <View style={styles.resultImagePlaceholder} />
                )}
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName}>{item.name}</Text>
                  {!!item.brand && (
                    <Text style={styles.resultMeta}>{item.brand}</Text>
                  )}
                  <Text style={styles.resultMeta}>
                    {item.calories} kcal / 100g · Nutri-Score{" "}
                    {item.nutriscore || "?"}
                  </Text>
                </View>
                <Text style={styles.resultAction}>Ajouter</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {selectedFoods.length > 0 && (
        <View style={styles.selectedSection}>
          <Text style={styles.sectionTitle}>Aliments ajoutés</Text>
          {selectedFoods.map((food) => (
            <View key={food.id} style={styles.selectedFoodRow}>
              {food.image_url ? (
                <Image
                  source={{ uri: food.image_url }}
                  style={styles.selectedFoodImage}
                />
              ) : (
                <View style={styles.selectedFoodImagePlaceholder} />
              )}
              <View style={styles.selectedFoodInfo}>
                <Text style={styles.selectedFoodName}>{food.name}</Text>
                <Text style={styles.selectedFoodMeta}>
                  {Math.round(calculateFoodNutrition(food).calories)} kcal ·{" "}
                  {food.quantity ?? 100} g
                </Text>
              </View>
              <Pressable
                onPress={() =>
                  setSelectedFoods((prev) =>
                    prev.filter((f) => f.id !== food.id),
                  )
                }
              >
                <Ionicons name="trash" size={20} color="#d7263d" />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <Modal
        visible={showQuantityModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQuantityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Quantité</Text>
            <Text style={styles.modalSubtitle}>{pendingFood?.name}</Text>
            <View style={styles.modalInputRow}>
              <TextInput
                style={styles.modalInput}
                value={quantityInput}
                onChangeText={setQuantityInput}
                keyboardType="numeric"
                placeholder="100"
                placeholderTextColor="#999"
              />
              <Text style={styles.modalUnit}>g</Text>
            </View>
            <View style={styles.modalNutrition}>
              {(() => {
                if (!pendingFood) return null;
                const quantity = Number(quantityInput.replace(",", ".")) || 0;
                const nutrition = calculateFoodNutrition({
                  ...pendingFood,
                  quantity,
                });
                return (
                  <>
                    <Text style={styles.modalNutritionText}>
                      {Math.round(nutrition.calories)} kcal
                    </Text>
                    <Text style={styles.modalNutritionSub}>
                      P {nutrition.proteins.toFixed(1)}g · G{" "}
                      {nutrition.carbs.toFixed(1)}g · L{" "}
                      {nutrition.fats.toFixed(1)}g
                    </Text>
                  </>
                );
              })()}
            </View>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancel}
                onPress={() => setShowQuantityModal(false)}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </Pressable>
              <Pressable
                style={styles.modalConfirm}
                onPress={handleConfirmQuantity}
              >
                <Text style={styles.modalConfirmText}>Ajouter</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Pressable style={styles.validateButton} onPress={handleValidateMeal}>
        <Text style={styles.validateButtonText}>Valider le repas</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  containerContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  mealTypesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  mealTypeChip: {
    borderWidth: 1,
    borderColor: "#d6d6d6",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#fff",
  },
  mealTypeChipActive: {
    backgroundColor: "#4caf50",
    borderColor: "#4caf50",
  },
  mealTypeText: {
    fontWeight: "600",
    color: "#333",
  },
  mealTypeTextActive: {
    color: "#fff",
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d6d6d6",
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  qrButton: {
    backgroundColor: "#4caf50",
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  loading: {
    marginTop: 8,
  },
  error: {
    color: "#d7263d",
  },
  resultsList: {
    gap: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
  },
  resultsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    zIndex: 999,
    justifyContent: "flex-start",
    paddingTop: 325,
    pointerEvents: "box-none",
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
  },
  resultImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  resultImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
  },
  resultInfo: {
    flex: 1,
    gap: 2,
  },
  resultName: {
    fontWeight: "600",
  },
  resultMeta: {
    fontSize: 12,
    color: "#666",
  },
  resultAction: {
    color: "#4caf50",
    fontWeight: "600",
  },
  empty: {
    color: "#777",
    marginTop: 6,
  },
  validateButton: {
    backgroundColor: "#4caf50",
    paddingVertical: 14,
    borderRadius: 10,

    alignItems: "center",
    marginTop: 8,
  },
  validateButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  notification: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 10,
  },
  notificationSuccess: {
    backgroundColor: "#4caf50",
  },
  notificationError: {
    backgroundColor: "#f44336",
  },
  notificationWarning: {
    backgroundColor: "#ff9800",
  },
  notificationIcon: {
    marginRight: 4,
  },
  notificationText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    flex: 1,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  dateInputText: {
    fontSize: 16,
    color: "#333",
    textTransform: "capitalize",
  },
  datePickerCloseButton: {
    backgroundColor: "#4caf50",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  datePickerCloseButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  selectedSection: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 12,
  },
  selectedFoodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  selectedFoodImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  selectedFoodImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
  },
  selectedFoodInfo: {
    flex: 1,
  },
  selectedFoodName: {
    fontWeight: "600",
    fontSize: 14,
  },
  selectedFoodMeta: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  modalSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#666",
  },
  modalInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  modalInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#333",
  },
  modalUnit: {
    fontSize: 16,
    color: "#666",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  },
  modalNutrition: {
    marginTop: 16,
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  modalNutritionText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  modalNutritionSub: {
    marginTop: 6,
    fontSize: 12,
    color: "#666",
  },
  modalCancel: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  modalCancelText: {
    color: "#666",
    fontWeight: "600",
  },
  modalConfirm: {
    backgroundColor: "#4caf50",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalConfirmText: {
    color: "#fff",
    fontWeight: "600",
  },
});
