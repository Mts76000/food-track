import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { Meal } from "@/types";
import { calculateFoodNutrition, calculateMealTotals } from "@/utils/nutrition";
import { getMeals, saveMeals } from "@/utils/storage";

export default function MealDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [meal, setMeal] = useState<Meal | null>(null);

  useEffect(() => {
    loadMeal();
  }, [id]);

  const loadMeal = async () => {
    const meals = await getMeals();
    const foundMeal = meals.find((m: Meal) => m.id === id);
    setMeal(foundMeal || null);
  };

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
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {Math.round(totals.calories)}
            </Text>
            <Text style={styles.summaryLabel}>kcal</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {totals.proteins.toFixed(1)}g
            </Text>
            <Text style={styles.summaryLabel}>Protéines</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totals.carbs.toFixed(1)}g</Text>
            <Text style={styles.summaryLabel}>Glucides</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totals.fats.toFixed(1)}g</Text>
            <Text style={styles.summaryLabel}>Lipides</Text>
          </View>
        </View>
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
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  mealName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  mealDate: {
    fontSize: 14,
    color: "#666",
  },
  deleteIconButton: {
    padding: 4,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e0e0e0",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4caf50",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
  },
  foodsSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  foodCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
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
    borderRadius: 8,
  },
  foodImagePlaceholder: {
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  foodContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  foodHeader: {
    marginBottom: 8,
  },
  foodName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  foodBrand: {
    fontSize: 13,
    color: "#999",
  },
  foodQuantity: {
    fontSize: 12,
    color: "#666",
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
    color: "#333",
  },
  nutriLabel: {
    fontSize: 11,
    color: "#999",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 32,
  },
});
