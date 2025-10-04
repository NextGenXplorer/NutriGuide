import { UserProfile, BMIResult } from '../types';

export const calculateBMI = (weight: number, heightInCm: number): number => {
  // Convert height from cm to meters
  const heightInMeters = heightInCm / 100;
  return weight / (heightInMeters * heightInMeters);
};

export const getBMICategory = (bmi: number): BMIResult['category'] => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

export const calculateDailyCalories = (
  profile: UserProfile,
  bmi: number
): number => {
  // Base Metabolic Rate (BMR) using Mifflin-St Jeor Equation
  // Height is already in cm, so we use it directly
  let bmr: number;

  if (profile.gender === 'male') {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
  } else {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
  }

  // Activity multiplier
  const activityMultipliers = {
    low: 1.2,
    moderate: 1.55,
    high: 1.9,
  };

  let tdee = bmr * activityMultipliers[profile.activityLevel];

  // Adjust based on goal
  if (profile.goal === 'lose') {
    tdee -= 500; // 500 calorie deficit for weight loss
  } else if (profile.goal === 'gain') {
    tdee += 500; // 500 calorie surplus for weight gain
  }

  return Math.round(tdee);
};

export const getMacroRatios = (
  goal: UserProfile['goal']
): { carbs: number; protein: number; fats: number } => {
  switch (goal) {
    case 'lose':
      return { carbs: 40, protein: 30, fats: 30 };
    case 'gain':
      return { carbs: 50, protein: 25, fats: 25 };
    default: // maintain
      return { carbs: 45, protein: 25, fats: 30 };
  }
};

export const analyzeBMI = (profile: UserProfile): BMIResult => {
  const bmi = calculateBMI(profile.weight, profile.height);
  const category = getBMICategory(bmi);
  const dailyCalorieGoal = calculateDailyCalories(profile, bmi);
  const macros = getMacroRatios(profile.goal);

  return {
    bmi,
    category,
    dailyCalorieGoal,
    macros,
  };
};
