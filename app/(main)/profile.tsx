import { SignOutButton } from "@/components/sign-out-button";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { getCalorieGoal, saveCalorieGoal } from "@/utils/storage";

export default function ProfileScreen() {
  const { user } = useUser();
  const [goalInput, setGoalInput] = useState("");
  const [goalSavedMessage, setGoalSavedMessage] = useState(false);

  useEffect(() => {
    const loadGoal = async () => {
      const goal = await getCalorieGoal();
      setGoalInput(String(goal));
    };
    loadGoal();
  }, []);

  const handleSaveGoal = useCallback(async () => {
    const value = Number(goalInput.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) {
      return;
    }

    Keyboard.dismiss();
    const success = await saveCalorieGoal(value);

    if (success) {
      setGoalInput(String(Math.round(value)));
      setGoalSavedMessage(true);
      setTimeout(() => setGoalSavedMessage(false), 2000);
    }
  }, [goalInput]);

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color="#fff" />
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.email}>
          {user?.emailAddresses[0]?.emailAddress}
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Objectif calorique</Text>
        <View style={styles.goalRow}>
          <TextInput
            style={styles.goalInput}
            value={goalInput}
            onChangeText={setGoalInput}
            placeholder="Ex: 2000"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
          <Text style={styles.goalUnit}>kcal/jour</Text>
        </View>
        <Pressable style={styles.goalButton} onPress={handleSaveGoal}>
          <Text style={styles.goalButtonText}>Enregistrer</Text>
        </Pressable>
        {goalSavedMessage && (
          <Text style={styles.goalSavedText}>Objectif bien enregistré</Text>
        )}
      </View>

      <SignOutButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  avatarContainer: {
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#4caf50",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoCard: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 32,
  },
  label: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  email: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  goalInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fff",
  },
  goalUnit: {
    fontSize: 14,
    color: "#666",
  },
  goalButton: {
    backgroundColor: "#4caf50",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  goalButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  goalSavedText: {
    marginTop: 10,
    fontSize: 13,
    color: "#4caf50",
    textAlign: "center",
    fontWeight: "600",
  },
});
