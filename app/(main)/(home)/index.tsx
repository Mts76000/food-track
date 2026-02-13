import { Ionicons } from "@expo/vector-icons";
import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { NutritionSummary } from "@/components/nutrition-summary";
import { cardShadow, colors, radius, spacing } from "@/constants/theme";
import type { Meal } from "@/types";
import { formatDateDisplay, formatDateISO, isSameDay } from "@/utils/date";
import { calculateDailyTotals, calculateMealTotals } from "@/utils/nutrition";
import {
  DEFAULT_CALORIE_GOAL,
  getCalorieGoal,
  getMeals,
} from "@/utils/storage";

export default function HomeScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyGoal, setDailyGoal] = useState(DEFAULT_CALORIE_GOAL);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const [loadedMeals, loadedGoal] = await Promise.all([
          getMeals(),
          getCalorieGoal(),
        ]);
        setMeals(loadedMeals);
        setDailyGoal(loadedGoal);
      };
      loadData();
    }, []),
  );

  const filteredMeals = meals.filter(
    (meal) => meal.date === formatDateISO(selectedDate),
  );

  const totals = calculateDailyTotals(filteredMeals);
  const progress = Math.min(totals.calories / dailyGoal, 1);

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const isToday = isSameDay(selectedDate, new Date());

  return (
    <View style={styles.container}>
      <View style={styles.dateSelector}>
        <Pressable style={styles.dateArrow} onPress={() => changeDate(-1)}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </Pressable>

        <View style={styles.dateDisplay}>
          <Ionicons
            name="calendar-outline"
            size={18}
            color={colors.textSecondary}
          />
          <Text style={styles.dateText}>{formatDateDisplay(selectedDate)}</Text>
        </View>

        <Pressable
          style={[styles.dateArrow, isToday && styles.dateArrowDisabled]}
          onPress={() => changeDate(1)}
          disabled={isToday}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={isToday ? "#ccc" : colors.primary}
          />
        </Pressable>
      </View>

      {filteredMeals.length > 0 && (
        <View style={styles.summary}>
          <NutritionSummary totals={totals} />
        </View>
      )}

      {dailyGoal && (
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>Objectif du jour</Text>
            <Text style={styles.goalValue}>
              {Math.round(totals.calories)} / {Math.round(dailyGoal)} kcal
            </Text>
          </View>
          <View style={styles.goalBar}>
            <View
              style={[styles.goalProgress, { width: `${progress * 100}%` }]}
            />
          </View>
        </View>
      )}

      {filteredMeals.length === 0 ? (
        <View style={styles.middle}>
          <Ionicons name="restaurant-outline" size={80} color="#b4b4b4" />
          <Text style={styles.emptyTitle}>Aucun repas ce jour</Text>
          <Text style={styles.emptyText}>
            {isToday
              ? "Commence par ajouter un repas"
              : "Aucun repas enregistré pour cette date"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMeals}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const mealTotals = calculateMealTotals(item);
            return (
              <Link href={`/(home)/${item.id}`} asChild>
                <Pressable style={styles.mealCard}>
                  <View style={styles.mealHeader}>
                    <Text style={styles.mealName}>{item.name}</Text>
                  </View>
                  <Text style={styles.mealCalories}>
                    {Math.round(mealTotals.calories)} kcal · {item.foods.length}{" "}
                    aliment
                    {item.foods.length > 1 ? "s" : ""}
                  </Text>
                </Pressable>
              </Link>
            );
          }}
        />
      )}

      <Link href="/add" asChild>
        <Pressable style={styles.fab}>
          <Ionicons name="add" size={32} color="#fff" />
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dateArrow: {
    padding: spacing.sm,
  },
  dateArrowDisabled: {
    opacity: 0.3,
  },
  dateDisplay: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    textTransform: "capitalize",
  },
  summary: {
    backgroundColor: colors.card,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: radius.md,
    ...cardShadow,
  },
  goalCard: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    marginTop: 12,
    padding: spacing.md,
    borderRadius: radius.md,
    ...cardShadow,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  goalValue: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  goalBar: {
    height: 10,
    backgroundColor: colors.divider,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  goalProgress: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  middle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
  },
  emptyTitle: {
    fontWeight: "600",
    fontSize: 18,
    color: colors.text,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: "center",
  },
  list: {
    gap: 12,
    paddingBottom: 80,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  mealCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    ...cardShadow,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  mealName: {
    fontSize: 18,
    fontWeight: "600",
  },
  mealDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  mealCalories: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
