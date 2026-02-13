import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { NutritionSummary } from "@/components/nutrition-summary";
import { cardShadow, colors, radius, spacing } from "@/constants/theme";
import type { Meal } from "@/types";
import { calculateFoodNutrition, calculateMealTotals } from "@/utils/nutrition";
import { getMeals, saveMeals } from "@/utils/storage";

export default function MealDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [meal, setMeal] = useState<Meal | null>(null);

  const loadMeal = useCallback(async () => {
    const meals = await getMeals();
    const foundMeal = meals.find((m: Meal) => m.id === id);
    setMeal(foundMeal || null);
  }, [id]);

  useEffect(() => {
    loadMeal();
  }, [loadMeal]);

  const handleDeleteMeal = () => {
    Alert.alert(
      "Supprimer ce repas",
      "Êtes-vous sûr de vouloir supprimer ce repas ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            const meals = await getMeals();
            const updatedMeals = meals.filter((m: Meal) => m.id !== id);
            const success = await saveMeals(updatedMeals);
            if (success) {
              router.back();
            }
          },
        },
      ],
    );
  };

  if (!meal) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Repas introuvable</Text>
      </View>
    );
  }

  const totals = calculateMealTotals(meal);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.mealName}>{meal.name}</Text>
            <Text style={styles.mealDate}>{meal.date}</Text>
          </View>
          <Pressable style={styles.deleteIconButton} onPress={handleDeleteMeal}>
            <Ionicons name="trash-outline" size={24} color="#f44336" />
          </Pressable>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Apports nutritionnels</Text>
        <NutritionSummary
          totals={totals}
          valueColor={colors.primary}
          valueSize={20}
          dividerHeight={40}
        />
      </View>

      <View style={styles.foodsSection}>
        <Text style={styles.sectionTitle}>Aliments ({meal.foods.length})</Text>
        {meal.foods.map((food, index) => {
          const nutrition = calculateFoodNutrition(food);
          const quantity = food.quantity ?? 100;

          return (
            <View key={index} style={styles.foodCard}>
              {food.image_url ? (
                <Image
                  source={{ uri: food.image_url }}
                  style={styles.foodImage}
                />
              ) : (
                <View style={[styles.foodImage, styles.foodImagePlaceholder]}>
                  <Ionicons name="fast-food-outline" size={32} color="#999" />
                </View>
              )}
              <View style={styles.foodContent}>
                <View style={styles.foodHeader}>
                  <Text style={styles.foodName} numberOfLines={2}>
                    {food.name}
                  </Text>
                  {food.brand && (
                    <Text style={styles.foodBrand} numberOfLines={1}>
                      {food.brand}
                    </Text>
                  )}
                  <Text style={styles.foodQuantity}>{quantity} g</Text>
                </View>
                <View style={styles.foodNutrition}>
                  {food.calories !== undefined && (
                    <View style={styles.nutriItem}>
                      <Text style={styles.nutriValue}>
                        {Math.round(nutrition.calories)}
                      </Text>
                      <Text style={styles.nutriLabel}>kcal</Text>
                    </View>
                  )}
                  {food.proteins !== undefined && (
                    <View style={styles.nutriItem}>
                      <Text style={styles.nutriValue}>
                        {nutrition.proteins.toFixed(1)}g
                      </Text>
                      <Text style={styles.nutriLabel}>P</Text>
                    </View>
                  )}
                  {food.carbs !== undefined && (
                    <View style={styles.nutriItem}>
                      <Text style={styles.nutriValue}>
                        {nutrition.carbs.toFixed(1)}g
                      </Text>
                      <Text style={styles.nutriLabel}>G</Text>
                    </View>
                  )}
                  {food.fats !== undefined && (
                    <View style={styles.nutriItem}>
                      <Text style={styles.nutriValue}>
                        {nutrition.fats.toFixed(1)}g
                      </Text>
                      <Text style={styles.nutriLabel}>L</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 32,
  },
  header: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: radius.md,
    ...cardShadow,
    marginBottom: spacing.md,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  mealName: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  mealDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  deleteIconButton: {
    padding: 4,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 20,
    marginBottom: spacing.md,
    ...cardShadow,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.md,
  },
  foodsSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  foodCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 12,
    flexDirection: "row",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  foodImage: {
    width: 70,
    height: 70,
    borderRadius: radius.sm,
  },
  foodImagePlaceholder: {
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  foodContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  foodHeader: {
    marginBottom: spacing.sm,
  },
  foodName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  foodBrand: {
    fontSize: 13,
    color: colors.textMuted,
  },
  foodQuantity: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  foodNutrition: {
    flexDirection: "row",
    gap: 12,
  },
  nutriItem: {
    alignItems: "center",
  },
  nutriValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  nutriLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 32,
  },
});
