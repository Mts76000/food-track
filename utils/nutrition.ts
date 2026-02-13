import type { Food, Meal, NutritionTotals } from "@/types";

export function calculateNutritionFactor(quantity: number = 100): number {
  return quantity / 100;
}

export function calculateFoodNutrition(food: Food): NutritionTotals {
  const factor = calculateNutritionFactor(food.quantity);
  return {
    calories: (food.calories || 0) * factor,
    proteins: (food.proteins || 0) * factor,
    carbs: (food.carbs || 0) * factor,
    fats: (food.fats || 0) * factor,
  };
}

export function calculateMealTotals(meal: Meal): NutritionTotals {
  return meal.foods.reduce(
    (totals, food) => {
      const nutrition = calculateFoodNutrition(food);
      return {
        calories: totals.calories + nutrition.calories,
        proteins: totals.proteins + nutrition.proteins,
        carbs: totals.carbs + nutrition.carbs,
        fats: totals.fats + nutrition.fats,
      };
    },
    { calories: 0, proteins: 0, carbs: 0, fats: 0 },
  );
}

export function calculateDailyTotals(meals: Meal[]): NutritionTotals {
  return meals.reduce(
    (totals, meal) => {
      const mealTotals = calculateMealTotals(meal);
      return {
        calories: totals.calories + mealTotals.calories,
        proteins: totals.proteins + mealTotals.proteins,
        carbs: totals.carbs + mealTotals.carbs,
        fats: totals.fats + mealTotals.fats,
      };
    },
    { calories: 0, proteins: 0, carbs: 0, fats: 0 },
  );
}
