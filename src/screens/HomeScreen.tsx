import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile, BMIResult, MealPlan } from '../types';
import { getUserProfile, getDailyProgress } from '../services/storage';
import { analyzeBMI } from '../utils/bmiCalculator';
import { generateMealPlan, getProgressTips, getMotivation } from '../utils/mealPlanner';
import { getAIMotivation, getAIMealSuggestions } from '../services/geminiService';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bmiResult, setBmiResult] = useState<BMIResult | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [progressTip, setProgressTip] = useState('');
  const [motivation, setMotivation] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [aiMotivation, setAiMotivation] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  const loadData = async () => {
    const userProfile = await getUserProfile();
    if (userProfile) {
      setProfile(userProfile);
      const result = analyzeBMI(userProfile);
      setBmiResult(result);
      setMealPlan(generateMealPlan(userProfile, result.dailyCalorieGoal));
      setMotivation(getMotivation(userProfile));

      const today = new Date().toISOString().split('T')[0];
      const todayProgress = await getDailyProgress(today);
      const consumed = todayProgress?.caloriesConsumed || 0;
      setCaloriesConsumed(consumed);
      setProgressTip(getProgressTips(consumed, result.dailyCalorieGoal, userProfile.goal));

      // Get AI-powered motivation
      setLoadingAI(true);
      const aiMsg = await getAIMotivation(userProfile, result, consumed);
      setAiMotivation(aiMsg);
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (!profile || !bmiResult || !mealPlan) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const caloriePercentage = (caloriesConsumed / bmiResult.dailyCalorieGoal) * 100;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Image source={require('../../assets/icon.png')} style={styles.logo} />
          <Text style={styles.appName}>NutriGuide</Text>
        </View>
        <Text style={styles.greeting}>Hello, {profile.name}! 👋</Text>
        <Text style={styles.motivationText}>{motivation}</Text>
      </View>

      {aiMotivation && (
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <Ionicons name="sparkles" size={20} color="#f39c12" />
            <Text style={styles.aiTitle}>AI Coach Says</Text>
          </View>
          <Text style={styles.aiText}>{aiMotivation}</Text>
        </View>
      )}
      {loadingAI && (
        <View style={styles.aiCard}>
          <Text style={styles.aiText}>✨ Getting personalized insight...</Text>
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="fitness" size={24} color="#27ae60" />
          <Text style={styles.cardTitle}>Your BMI Analysis</Text>
        </View>
        <View style={styles.bmiContainer}>
          <View style={styles.bmiCircle}>
            <Text style={styles.bmiValue}>{bmiResult.bmi.toFixed(1)}</Text>
            <Text style={styles.bmiLabel}>BMI</Text>
          </View>
          <View style={styles.bmiInfo}>
            <Text style={styles.bmiCategory}>{bmiResult.category}</Text>
            <Text style={styles.bmiDescription}>
              {bmiResult.category === 'Underweight' &&
                'Focus on nutrient-dense foods to reach a healthy weight'}
              {bmiResult.category === 'Normal' &&
                'Great job! Maintain this healthy range'}
              {bmiResult.category === 'Overweight' &&
                'A balanced diet can help you reach a healthier weight'}
              {bmiResult.category === 'Obese' &&
                'Let\'s work together on a sustainable weight management plan'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="flame" size={24} color="#e74c3c" />
          <Text style={styles.cardTitle}>Daily Calorie Goal</Text>
        </View>
        <Text style={styles.calorieGoal}>{bmiResult.dailyCalorieGoal} cal</Text>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${Math.min(caloriePercentage, 100)}%` },
            ]}
          />
        </View>
        <Text style={styles.caloriesText}>
          {caloriesConsumed} / {bmiResult.dailyCalorieGoal} cal (
          {Math.round(caloriePercentage)}%)
        </Text>
        <Text style={styles.progressTip}>{progressTip}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="pie-chart" size={24} color="#3498db" />
          <Text style={styles.cardTitle}>Macro Distribution</Text>
        </View>
        <View style={styles.macroContainer}>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{bmiResult.macros.carbs}%</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{bmiResult.macros.protein}%</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{bmiResult.macros.fats}%</Text>
            <Text style={styles.macroLabel}>Fats</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="restaurant" size={24} color="#f39c12" />
          <Text style={styles.cardTitle}>Today's Meal Plan</Text>
        </View>

        <View style={styles.mealItem}>
          <Text style={styles.mealType}>🌅 Breakfast</Text>
          <Text style={styles.mealDescription}>{mealPlan.breakfast}</Text>
        </View>

        <View style={styles.mealItem}>
          <Text style={styles.mealType}>☀️ Lunch</Text>
          <Text style={styles.mealDescription}>{mealPlan.lunch}</Text>
        </View>

        <View style={styles.mealItem}>
          <Text style={styles.mealType}>🌙 Dinner</Text>
          <Text style={styles.mealDescription}>{mealPlan.dinner}</Text>
        </View>

        <View style={styles.mealItem}>
          <Text style={styles.mealType}>🍎 Snacks</Text>
          <Text style={styles.mealDescription}>{mealPlan.snacks}</Text>
        </View>
      </View>

      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Healthy Habits</Text>
        <Text style={styles.tipItem}>💧 Drink 8-10 glasses of water daily</Text>
        <Text style={styles.tipItem}>🏃 Stay active - 30 min exercise daily</Text>
        <Text style={styles.tipItem}>😴 Get 7-8 hours of quality sleep</Text>
        <Text style={styles.tipItem}>🧘 Practice mindful eating</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 90,
  },
  header: {
    backgroundColor: '#27ae60',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  card: {
    backgroundColor: '#fff',
    margin: 15,
    marginBottom: 0,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 10,
  },
  bmiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bmiCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  bmiValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  bmiLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  bmiInfo: {
    flex: 1,
  },
  bmiCategory: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  bmiDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  calorieGoal: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#e74c3c',
    textAlign: 'center',
    marginVertical: 10,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#ecf0f1',
    borderRadius: 6,
    overflow: 'hidden',
    marginVertical: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#27ae60',
    borderRadius: 6,
  },
  caloriesText: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressTip: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  macroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3498db',
  },
  macroLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  mealItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  mealType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 6,
  },
  mealDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  tipsCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 30,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  tipItem: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10,
    lineHeight: 20,
  },
  aiCard: {
    backgroundColor: '#fff3cd',
    margin: 15,
    marginTop: -10,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f39c12',
    marginLeft: 8,
  },
  aiText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});
