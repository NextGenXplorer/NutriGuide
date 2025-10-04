import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserProfile, BMIResult } from '../types';
import { GEMINI_API_KEY } from '@env';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const getGeminiResponse = async (
  userMessage: string,
  profile: UserProfile | null,
  bmiResult: BMIResult | null,
  conversationHistory: Array<{ role: string; text: string }> = []
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Build context about the user
    let systemContext = `You are NutriGuide — an expert AI diet coach and nutrition advisor.

Your role:
- Help users maintain a healthy body weight based on their BMI.
- Provide daily diet guidance, calorie goals, and food intake tracking.
- Motivate users to stay consistent and teach them about healthy eating habits.
- Be friendly, encouraging, and conversational.
- Avoid medical claims or strict prescriptions.
- Always promote balance, moderation, and positivity.
`;

    if (profile && bmiResult) {
      systemContext += `\n
Current User Profile:
- Name: ${profile.name}
- Age: ${profile.age} years
- Height: ${profile.height} cm
- Weight: ${profile.weight} kg
- Gender: ${profile.gender}
- Activity Level: ${profile.activityLevel}
- Goal: ${profile.goal} weight
- Dietary Preference: ${profile.dietaryPreference}
- BMI: ${bmiResult.bmi.toFixed(1)} (${bmiResult.category})
- Daily Calorie Goal: ${bmiResult.dailyCalorieGoal} cal
- Macros: Carbs ${bmiResult.macros.carbs}%, Protein ${bmiResult.macros.protein}%, Fats ${bmiResult.macros.fats}%

Personalize your responses using this information.
`;
    }

    // Build conversation history
    let conversationText = systemContext + '\n\n';
    conversationHistory.forEach((msg) => {
      conversationText += `${msg.role}: ${msg.text}\n`;
    });
    conversationText += `User: ${userMessage}\nAssistant:`;

    const result = await model.generateContent(conversationText);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to get response from AI. Please try again.');
  }
};

export const analyzeFoodImage = async (imageUri: string): Promise<{
  foodName: string;
  calories: number;
  description: string;
}> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Read image as base64
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data.split(',')[1]);
      };
      reader.readAsDataURL(blob);
    });

    const prompt = `Analyze this food image and provide:
1. The name of the food/dish
2. Estimated calories (as a number)
3. Brief nutritional description (protein, carbs, fats content)

Respond ONLY in this exact JSON format:
{
  "foodName": "name of the dish",
  "calories": estimated_number,
  "description": "brief nutritional info"
}`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64,
        },
      },
    ]);

    const text = result.response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        foodName: parsed.foodName || 'Unknown Food',
        calories: parsed.calories || 0,
        description: parsed.description || '',
      };
    }

    throw new Error('Could not parse food analysis');
  } catch (error) {
    console.error('Food image analysis error:', error);
    throw new Error('Failed to analyze food image');
  }
};

export const getQuickSuggestions = (profile: UserProfile | null): string[] => {
  const suggestions = [
    '💡 Give me meal ideas for today',
    '🍎 What healthy snacks can I have?',
    '🏃 How much exercise should I do?',
    '💧 How much water should I drink?',
    '😴 Tips for better sleep?',
  ];

  if (profile?.goal === 'lose') {
    suggestions.push('⚖️ Best foods for weight loss?');
  } else if (profile?.goal === 'gain') {
    suggestions.push('💪 High-calorie healthy foods?');
  }

  return suggestions;
};

export const getAIMotivation = async (
  profile: UserProfile | null,
  bmiResult: BMIResult | null,
  todayCalories: number
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a motivational nutrition coach. Generate a short, encouraging message (2-3 sentences) for:
- User: ${profile?.name || 'there'}
- BMI: ${bmiResult?.bmi.toFixed(1)} (${bmiResult?.category})
- Goal: ${profile?.goal} weight
- Today's calories: ${todayCalories}/${bmiResult?.dailyCalorieGoal || 0}

Be supportive, specific, and actionable. Use emojis appropriately.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return '🌟 Keep pushing forward! Every healthy choice counts toward your goals.';
  }
};

export const getAIMealSuggestions = async (
  profile: UserProfile | null,
  bmiResult: BMIResult | null,
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
): Promise<string[]> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Generate 3 personalized ${mealType} suggestions for:
- Goal: ${profile?.goal} weight
- Diet: ${profile?.dietaryPreference}
- Daily calories: ${bmiResult?.dailyCalorieGoal}
- Macros: Carbs ${bmiResult?.macros.carbs}%, Protein ${bmiResult?.macros.protein}%, Fats ${bmiResult?.macros.fats}%

Respond with ONLY a JSON array of 3 meal names, no explanations:
["meal1", "meal2", "meal3"]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return ['Oatmeal with fruits', 'Greek yogurt parfait', 'Veggie omelet'];
  } catch (error) {
    return ['Oatmeal with fruits', 'Greek yogurt parfait', 'Veggie omelet'];
  }
};

export const analyzeProgress = async (
  profile: UserProfile | null,
  bmiResult: BMIResult | null,
  weightHistory: Array<{ date: string; weight: number }>
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const recentWeights = weightHistory.slice(-7).map(w => w.weight);
    const weightChange = recentWeights.length > 1
      ? recentWeights[recentWeights.length - 1] - recentWeights[0]
      : 0;

    const prompt = `Analyze this fitness progress and provide insights (3-4 sentences):
- Goal: ${profile?.goal} weight
- Current BMI: ${bmiResult?.bmi.toFixed(1)} (${bmiResult?.category})
- Week weight change: ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg
- Recent weights: ${recentWeights.join(', ')} kg

Provide specific, actionable advice based on their progress. Be encouraging but honest.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return 'Keep tracking your progress consistently. Small, sustainable changes lead to lasting results! 💪';
  }
};

export const getFoodAlternatives = async (
  foodName: string,
  profile: UserProfile | null
): Promise<string[]> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Suggest 3 healthier alternatives to "${foodName}" for someone with:
- Goal: ${profile?.goal} weight
- Diet: ${profile?.dietaryPreference}

Respond with ONLY a JSON array: ["alternative1", "alternative2", "alternative3"]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    return [];
  }
};
