import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Food, Meal } from "@/types";

const STORAGE_KEYS = {
  MEALS: "@meals",
  CURRENT_MEAL: "@current_meal_foods",
  CALORIE_GOAL: "@daily_calorie_goal",
} as const;

export const DEFAULT_CALORIE_GOAL = 2000;

export async function getCalorieGoal(): Promise<number> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.CALORIE_GOAL);
    if (stored) {
      const value = Number(stored);
      return Number.isFinite(value) && value > 0 ? value : DEFAULT_CALORIE_GOAL;
    }
    return DEFAULT_CALORIE_GOAL;
  } catch (e) {
    console.error("Erreur chargement objectif", e);
    return DEFAULT_CALORIE_GOAL;
  }
}

export async function saveCalorieGoal(goal: number): Promise<boolean> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.CALORIE_GOAL,
      String(Math.round(goal)),
    );
    return true;
  } catch (e) {
    console.error("Erreur sauvegarde objectif", e);
    return false;
  }
}

export async function getMeals(): Promise<Meal[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.MEALS);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Erreur chargement repas", e);
    return [];
  }
}

export async function saveMeals(meals: Meal[]): Promise<boolean> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
    return true;
  } catch (e) {
    console.error("Erreur sauvegarde repas", e);
    return false;
  }
}

export async function getCurrentMealFoods(): Promise<Food[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_MEAL);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Erreur chargement repas en cours", e);
    return [];
  }
}

export async function saveCurrentMealFoods(foods: Food[]): Promise<boolean> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.CURRENT_MEAL,
      JSON.stringify(foods),
    );
    return true;
  } catch (e) {
    console.error("Erreur sauvegarde repas en cours", e);
    return false;
  }
}

export async function clearCurrentMealFoods(): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_MEAL);
    return true;
  } catch (e) {
    console.error("Erreur suppression repas en cours", e);
    return false;
  }
}
