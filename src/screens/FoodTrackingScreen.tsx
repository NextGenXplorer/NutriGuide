import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { FoodLog } from '../types';
import { addFoodLog, getDailyProgress, getUserProfile } from '../services/storage';
import { analyzeBMI } from '../utils/bmiCalculator';
import { analyzeFoodImage, getFoodAlternatives } from '../services/geminiService';

export default function FoodTrackingScreen() {
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [mealType, setMealType] = useState<FoodLog['mealType']>('breakfast');
  const [todayLogs, setTodayLogs] = useState<FoodLog[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [calorieGoal, setCalorieGoal] = useState(0);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [showAlternatives, setShowAlternatives] = useState(false);

  const loadTodayData = async () => {
    const today = new Date().toISOString().split('T')[0];
    const progress = await getDailyProgress(today);

    if (progress) {
      setTodayLogs(progress.foodLogs);
      setTotalCalories(progress.caloriesConsumed);
      setCalorieGoal(progress.caloriesGoal);
    } else {
      const userProfile = await getUserProfile();
      if (userProfile) {
        const result = analyzeBMI(userProfile);
        setCalorieGoal(result.dailyCalorieGoal);
        setProfile(userProfile);
      }
    }
  };

  const getAIAlternatives = async () => {
    if (!foodName.trim() || !profile) return;

    setShowAlternatives(true);
    const alts = await getFoodAlternatives(foodName, profile);
    setAlternatives(alts);
  };

  useEffect(() => {
    loadTodayData();
  }, []);

  const handleAddFood = async () => {
    if (!foodName.trim() || !calories) {
      Alert.alert('Error', 'Please enter both food name and calories');
      return;
    }

    const calorieValue = parseInt(calories);
    if (isNaN(calorieValue) || calorieValue <= 0) {
      Alert.alert('Error', 'Please enter valid calories');
      return;
    }

    const newLog: FoodLog = {
      id: Date.now().toString(),
      name: foodName,
      calories: calorieValue,
      timestamp: new Date(),
      mealType,
    };

    try {
      const today = new Date().toISOString().split('T')[0];
      await addFoodLog(today, newLog);

      setFoodName('');
      setCalories('');
      await loadTodayData();
      Alert.alert('Success', 'Food logged successfully! 🎉');
    } catch (error) {
      Alert.alert('Error', 'Failed to log food. Please try again.');
    }
  };

  const takePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      analyzeFood(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Gallery permission is required to pick photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      analyzeFood(result.assets[0].uri);
    }
  };

  const analyzeFood = async (imageUri: string) => {
    setSelectedImage(imageUri);
    setAnalyzingImage(true);

    try {
      const result = await analyzeFoodImage(imageUri);
      setFoodName(result.foodName);
      setCalories(result.calories.toString());
      Alert.alert(
        'Food Detected! 🎉',
        `${result.foodName}\nEstimated: ${result.calories} calories\n\n${result.description}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze food image. Please try again or enter manually.');
      console.error(error);
    } finally {
      setAnalyzingImage(false);
    }
  };

  const getMealIcon = (type: FoodLog['mealType']) => {
    switch (type) {
      case 'breakfast':
        return '🌅';
      case 'lunch':
        return '☀️';
      case 'dinner':
        return '🌙';
      case 'snack':
        return '🍎';
    }
  };

  const percentage = calorieGoal > 0 ? (totalCalories / calorieGoal) * 100 : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Image source={require('../../assets/icon.png')} style={styles.logo} />
          <Text style={styles.title}>Track Your Food 🍽️</Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Today's Progress</Text>
        <Text style={styles.calorieText}>
          {totalCalories} / {calorieGoal} cal
        </Text>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${Math.min(percentage, 100)}%` },
            ]}
          />
        </View>
        <Text style={styles.percentageText}>{Math.round(percentage)}% of goal</Text>
      </View>

      <View style={styles.inputCard}>
        <Text style={styles.sectionTitle}>Log New Food</Text>

        {selectedImage && (
          <Image source={{ uri: selectedImage }} style={styles.foodImage} />
        )}

        {analyzingImage && (
          <View style={styles.analyzingContainer}>
            <ActivityIndicator size="large" color="#27ae60" />
            <Text style={styles.analyzingText}>Analyzing food image...</Text>
          </View>
        )}

        <View style={styles.cameraButtons}>
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={takePicture}
            disabled={analyzingImage}
          >
            <Ionicons name="camera" size={24} color="#fff" />
            <Text style={styles.cameraButtonText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={pickImage}
            disabled={analyzingImage}
          >
            <Ionicons name="images" size={24} color="#fff" />
            <Text style={styles.cameraButtonText}>Gallery</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.orText}>Or enter manually:</Text>

        <Text style={styles.label}>Food Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Oatmeal with fruits"
          value={foodName}
          onChangeText={setFoodName}
        />

        <Text style={styles.label}>Calories</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 300"
          keyboardType="numeric"
          value={calories}
          onChangeText={(text) => {
            // Allow decimal input for calories
            const cleanText = text.replace(/[^0-9.]/g, '');
            setCalories(cleanText);
          }}
        />

        <Text style={styles.label}>Meal Type</Text>
        <View style={styles.mealTypeContainer}>
          {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.mealTypeButton,
                mealType === type && styles.mealTypeButtonActive,
              ]}
              onPress={() => setMealType(type)}
            >
              <Text style={styles.mealTypeEmoji}>{getMealIcon(type)}</Text>
              <Text
                style={[
                  styles.mealTypeText,
                  mealType === type && styles.mealTypeTextActive,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {foodName.trim() && (
          <TouchableOpacity style={styles.aiButton} onPress={getAIAlternatives}>
            <Ionicons name="sparkles" size={20} color="#fff" />
            <Text style={styles.aiButtonText}>Get AI Healthier Alternatives</Text>
          </TouchableOpacity>
        )}

        {showAlternatives && alternatives.length > 0 && (
          <View style={styles.alternativesCard}>
            <Text style={styles.alternativesTitle}>✨ Healthier Options:</Text>
            {alternatives.map((alt, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.alternativeItem}
                onPress={() => {
                  setFoodName(alt);
                  setShowAlternatives(false);
                }}
              >
                <Text style={styles.alternativeText}>→ {alt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAddFood}>
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Log Food</Text>
        </TouchableOpacity>
      </View>

      {todayLogs.length > 0 && (
        <View style={styles.logsCard}>
          <Text style={styles.sectionTitle}>Today's Food Log</Text>
          {todayLogs.map((log) => (
            <View key={log.id} style={styles.logItem}>
              <View style={styles.logLeft}>
                <Text style={styles.logIcon}>{getMealIcon(log.mealType)}</Text>
                <View style={styles.logInfo}>
                  <Text style={styles.logName}>{log.name}</Text>
                  <Text style={styles.logTime}>
                    {new Date(log.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
              <Text style={styles.logCalories}>{log.calories} cal</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Tracking Tips</Text>
        <Text style={styles.tipItem}>
          • Be honest with portions - accuracy helps you reach your goals
        </Text>
        <Text style={styles.tipItem}>
          • Log meals immediately - don't wait until end of day
        </Text>
        <Text style={styles.tipItem}>
          • Include snacks and beverages in your tracking
        </Text>
        <Text style={styles.tipItem}>
          • Use measuring tools for better calorie estimates
        </Text>
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
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  calorieText: {
    fontSize: 32,
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
  percentageText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  inputCard: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 5,
  },
  mealTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    paddingHorizontal: 15,
  },
  mealTypeButtonActive: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
  },
  mealTypeEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  mealTypeText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  mealTypeTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#27ae60',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  foodImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  analyzingContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 15,
  },
  analyzingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '600',
  },
  cameraButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 15,
  },
  cameraButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  orText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: 14,
    marginVertical: 15,
  },
  logsCard: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  logInfo: {
    flex: 1,
  },
  logName: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  logTime: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  logCalories: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  tipsCard: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
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
  aiButton: {
    flexDirection: 'row',
    backgroundColor: '#9b59b6',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    gap: 8,
  },
  aiButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  alternativesCard: {
    backgroundColor: '#f3e5f5',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#9b59b6',
  },
  alternativesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6a1b9a',
    marginBottom: 10,
  },
  alternativeItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  alternativeText: {
    fontSize: 14,
    color: '#6a1b9a',
  },
});
