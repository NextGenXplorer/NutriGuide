import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, DailyProgress, FoodLog } from '../types';

const STORAGE_KEYS = {
  USER_PROFILE: '@nutriguide_user_profile',
  DAILY_PROGRESS: '@nutriguide_daily_progress',
  WEIGHT_HISTORY: '@nutriguide_weight_history',
};

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

export const saveDailyProgress = async (progress: DailyProgress): Promise<void> => {
  try {
    const key = `${STORAGE_KEYS.DAILY_PROGRESS}_${progress.date}`;
    await AsyncStorage.setItem(key, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving daily progress:', error);
    throw error;
  }
};

export const getDailyProgress = async (date: string): Promise<DailyProgress | null> => {
  try {
    const key = `${STORAGE_KEYS.DAILY_PROGRESS}_${date}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting daily progress:', error);
    return null;
  }
};

export const addFoodLog = async (
  date: string,
  foodLog: FoodLog
): Promise<void> => {
  try {
    const progress = await getDailyProgress(date);

    const updatedProgress: DailyProgress = progress
      ? {
          ...progress,
          foodLogs: [...progress.foodLogs, foodLog],
          caloriesConsumed: progress.caloriesConsumed + foodLog.calories,
        }
      : {
          date,
          caloriesConsumed: foodLog.calories,
          caloriesGoal: 0, // Will be updated with user's goal
          foodLogs: [foodLog],
        };

    await saveDailyProgress(updatedProgress);
  } catch (error) {
    console.error('Error adding food log:', error);
    throw error;
  }
};

export const saveWeight = async (weight: number): Promise<void> => {
  try {
    const historyData = await AsyncStorage.getItem(STORAGE_KEYS.WEIGHT_HISTORY);
    const history = historyData ? JSON.parse(historyData) : [];

    history.push({
      date: new Date().toISOString().split('T')[0],
      weight,
    });

    await AsyncStorage.setItem(STORAGE_KEYS.WEIGHT_HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving weight:', error);
    throw error;
  }
};

export const getWeightHistory = async (): Promise<Array<{ date: string; weight: number }>> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.WEIGHT_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting weight history:', error);
    return [];
  }
};
