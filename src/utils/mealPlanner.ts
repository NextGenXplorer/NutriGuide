import { UserProfile, MealPlan } from '../types';

interface MealSuggestion {
  [key: string]: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
  };
}

const vegetarianMeals: MealSuggestion = {
  lose: {
    breakfast: [
      'Oatmeal with berries and almonds (~300 cal) - High fiber, protein-rich',
      'Greek yogurt with chia seeds and honey (~250 cal) - Probiotic, omega-3',
      'Vegetable poha with peanuts (~280 cal) - Light, nutritious',
      'Smoothie bowl with banana, spinach, protein powder (~320 cal) - Vitamin-packed',
    ],
    lunch: [
      'Quinoa salad with chickpeas, cucumber, tomatoes (~400 cal) - Complete protein, fiber',
      'Brown rice with dal and steamed vegetables (~420 cal) - Balanced, filling',
      'Whole wheat wrap with paneer and veggies (~380 cal) - Protein-rich',
      'Vegetable khichdi with curd (~350 cal) - Easy to digest, comforting',
    ],
    dinner: [
      'Grilled vegetables with tofu (~300 cal) - Low-cal, high protein',
      'Vegetable soup with multigrain bread (~280 cal) - Light, satisfying',
      'Palak paneer with roti (~350 cal) - Iron, calcium-rich',
      'Stir-fried vegetables with brown rice (~320 cal) - Fiber-rich',
    ],
    snacks: [
      'Apple with peanut butter (~150 cal)',
      'Carrot sticks with hummus (~120 cal)',
      'Roasted chickpeas (~130 cal)',
      'Mixed nuts (small handful ~160 cal)',
    ],
  },
  maintain: {
    breakfast: [
      'Whole wheat toast with avocado and eggs (~400 cal) - Healthy fats, protein',
      'Upma with vegetables and coconut chutney (~380 cal) - Energizing',
      'Masala dosa with sambar (~420 cal) - Traditional, balanced',
      'Paneer paratha with curd (~450 cal) - Protein-packed',
    ],
    lunch: [
      'Rice with rajma and salad (~500 cal) - Complete protein, fiber',
      'Chole with brown rice and raita (~520 cal) - Satisfying, nutritious',
      'Vegetable biryani with raita (~550 cal) - Flavorful, balanced',
      'Mixed dal with roti and vegetables (~480 cal) - Traditional, wholesome',
    ],
    dinner: [
      'Paneer tikka with quinoa (~450 cal) - High protein',
      'Vegetable curry with brown rice (~420 cal) - Nutrient-dense',
      'Mushroom masala with roti (~400 cal) - Umami-rich',
      'Dal makhani with jeera rice (~480 cal) - Protein-rich, comforting',
    ],
    snacks: [
      'Fruit chaat (~180 cal)',
      'Sprouted moong salad (~160 cal)',
      'Paneer cubes with mint chutney (~200 cal)',
      'Trail mix (~190 cal)',
    ],
  },
  gain: {
    breakfast: [
      'Banana smoothie with oats, peanut butter, milk (~500 cal) - Calorie-dense',
      'Aloo paratha with butter and curd (~550 cal) - High-energy',
      'Idli with coconut chutney and sambhar (~480 cal) - Carb-rich',
      'Stuffed paneer sandwich with cheese (~520 cal) - Protein-packed',
    ],
    lunch: [
      'Paneer butter masala with naan and rice (~700 cal) - Rich, satisfying',
      'Rajma chawal with raita and salad (~650 cal) - Complete meal',
      'Vegetable pulao with paneer curry (~680 cal) - Wholesome',
      'Chole bhature with lassi (~720 cal) - Traditional, filling',
    ],
    dinner: [
      'Stuffed capsicum with rice (~550 cal) - Nutrient-dense',
      'Paneer tikka masala with naan (~600 cal) - Protein-rich',
      'Mixed vegetable curry with paratha (~580 cal) - Balanced',
      'Palak paneer with rice and dal (~620 cal) - Iron-rich',
    ],
    snacks: [
      'Peanut butter banana sandwich (~300 cal)',
      'Protein shake with fruits (~280 cal)',
      'Cheese and crackers (~250 cal)',
      'Dry fruits and nuts mix (~320 cal)',
    ],
  },
};

export const generateMealPlan = (
  profile: UserProfile,
  calories: number
): MealPlan => {
  const meals = vegetarianMeals[profile.goal];

  // Randomly select meals from options
  const getRandomMeal = (mealArray: string[]) =>
    mealArray[Math.floor(Math.random() * mealArray.length)];

  return {
    breakfast: getRandomMeal(meals.breakfast),
    lunch: getRandomMeal(meals.lunch),
    dinner: getRandomMeal(meals.dinner),
    snacks: getRandomMeal(meals.snacks),
  };
};

export const getProgressTips = (
  caloriesConsumed: number,
  caloriesGoal: number,
  goal: UserProfile['goal']
): string => {
  const percentage = (caloriesConsumed / caloriesGoal) * 100;

  if (percentage < 50) {
    return `You've consumed ${Math.round(percentage)}% of your daily calories. Make sure to eat nutritious meals throughout the day to meet your goal!`;
  } else if (percentage < 80) {
    return `Great progress! You're at ${Math.round(percentage)}% of your calorie goal. Stay on track with balanced meals.`;
  } else if (percentage < 100) {
    return `Almost there! You've reached ${Math.round(percentage)}% of your goal. A light, healthy ${goal === 'lose' ? 'dinner' : 'snack'} will complete your day perfectly.`;
  } else if (percentage < 110) {
    return `Perfect! You've met your calorie goal. Stay hydrated and maintain this consistency!`;
  } else {
    return `You're ${Math.round(percentage - 100)}% over your goal. No worries! Consider lighter meals tomorrow and stay active.`;
  }
};

export const getMotivation = (profile: UserProfile): string => {
  const motivations = [
    `${profile.name}, every healthy choice you make is a step towards a better you! Keep going! 💪`,
    `You're doing amazing, ${profile.name}! Consistency is the key to success. 🌟`,
    `${profile.name}, remember: progress, not perfection. You've got this! 🎯`,
    `Great work today, ${profile.name}! Your future self will thank you for these healthy habits. 🙌`,
    `${profile.name}, nutrition is self-care. You're investing in your health every day! 💚`,
    `Stay strong, ${profile.name}! Small daily improvements lead to stunning long-term results. 🚀`,
    `${profile.name}, your commitment to health is inspiring! Keep nourishing your body well. 🥗`,
    `Believe in yourself, ${profile.name}! Every meal is an opportunity to fuel your goals. ⭐`,
  ];

  return motivations[Math.floor(Math.random() * motivations.length)];
};
