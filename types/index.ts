export type Food = {
  id: string;
  name: string;
  brand?: string;
  image_url?: string;
  nutriscore?: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  quantity?: number;
};

export type Meal = {
  id: string;
  name: string;
  date: string;
  foods: Food[];
};

export type MealType = "Petit-déjeuner" | "Déjeuner" | "Dîner" | "Snack";

export type NutritionTotals = {
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
};
