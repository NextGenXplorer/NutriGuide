export interface UserProfile {
  name: string;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  gender: 'male' | 'female' | 'other';
  activityLevel: 'low' | 'moderate' | 'high';
  goal: 'maintain' | 'lose' | 'gain';
  dietaryPreference: 'vegetarian' | 'vegan' | 'non-veg';
}

export interface BMIResult {
  bmi: number;
  category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
  dailyCalorieGoal: number;
  macros: {
    carbs: number;
    protein: number;
    fats: number;
  };
}

export interface MealPlan {
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
}

export interface NutriGuideResponse {
  bmi: string;
  bmi_category: string;
  daily_calorie_goal: string;
  macros: {
    carbs: string;
    protein: string;
    fats: string;
  };
  meal_plan: MealPlan;
  progress_tips: string;
  motivation: string;
}

export interface FoodLog {
  id: string;
  name: string;
  calories: number;
  timestamp: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface DailyProgress {
  date: string;
  caloriesConsumed: number;
  caloriesGoal: number;
  weight?: number;
  foodLogs: FoodLog[];
}
