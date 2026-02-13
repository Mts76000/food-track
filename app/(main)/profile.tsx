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

import { cardShadow, colors, radius, spacing } from "@/constants/theme";
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
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  avatarContainer: {
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...cardShadow,
  },
  infoCard: {
    backgroundColor: colors.card,
    width: "100%",
    padding: 20,
    borderRadius: radius.md,
    ...cardShadow,
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  email: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: 12,
  },
  goalInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.card,
  },
  goalUnit: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  goalButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: radius.sm,
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
    color: colors.primary,
    textAlign: "center",
    fontWeight: "600",
  },
});
