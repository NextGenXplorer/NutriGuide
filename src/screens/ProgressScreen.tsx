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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import Markdown from 'react-native-markdown-display';
import { getUserProfile, saveWeight, getWeightHistory, saveUserProfile } from '../services/storage';
import { UserProfile } from '../types';
import { analyzeBMI } from '../utils/bmiCalculator';
import { analyzeProgress } from '../services/geminiService';

export default function ProgressScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [newWeight, setNewWeight] = useState('');
  const [weightHistory, setWeightHistory] = useState<Array<{ date: string; weight: number }>>([]);
  const [currentBMI, setCurrentBMI] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const loadData = async () => {
    const userProfile = await getUserProfile();
    if (userProfile) {
      setProfile(userProfile);
      const result = analyzeBMI(userProfile);
      setCurrentBMI(result.bmi);
    }

    const history = await getWeightHistory();
    setWeightHistory(history.slice(-7).reverse()); // Last 7 entries, newest first

    // Get AI progress analysis
    if (userProfile && history.length > 0) {
      setLoadingAnalysis(true);
      const result = analyzeBMI(userProfile);
      const analysis = await analyzeProgress(userProfile, result, history);
      setAiAnalysis(analysis);
      setLoadingAnalysis(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateWeight = async () => {
    if (!newWeight || !profile) {
      Alert.alert('Error', 'Please enter a valid weight');
      return;
    }

    const weight = parseFloat(newWeight);
    if (isNaN(weight) || weight <= 0) {
      Alert.alert('Error', 'Please enter a valid weight');
      return;
    }

    try {
      await saveWeight(weight);

      const updatedProfile = { ...profile, weight };
      await saveUserProfile(updatedProfile);

      setNewWeight('');
      await loadData();
      Alert.alert('Success', 'Weight updated successfully! 🎉');
    } catch (error) {
      Alert.alert('Error', 'Failed to update weight. Please try again.');
    }
  };

  const getWeightTrend = () => {
    if (weightHistory.length < 2) return null;

    const latest = weightHistory[0].weight;
    const previous = weightHistory[1].weight;
    const diff = latest - previous;

    if (diff > 0) {
      return { trend: 'up', value: diff.toFixed(1), color: theme.colors.error };
    } else if (diff < 0) {
      return { trend: 'down', value: Math.abs(diff).toFixed(1), color: theme.colors.primary };
    }
    return { trend: 'stable', value: '0', color: '#95a5a6' };
  };

  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return '#3498db'; // Underweight
    if (bmi < 25) return '#27ae60'; // Normal
    if (bmi < 30) return '#f39c12'; // Overweight
    return '#e74c3c'; // Obese
  };

  const trend = getWeightTrend();

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.headerGradient}>
          <View style={styles.headerTop}>
            <View style={styles.logoContainer}>
              <Ionicons name="trending-up" size={32} color={theme.mode === 'dark' ? '#fff' : '#27ae60'} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Progress Tracker</Text>
              <Text style={styles.subtitle}>Monitor Your Journey</Text>
            </View>
          </View>
        </View>
      </View>

      {aiAnalysis && (
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <Ionicons name="analytics" size={20} color="#3498db" />
            <Text style={styles.aiTitle}>AI Progress Analysis</Text>
          </View>
          <Markdown
            style={{
              body: styles.aiText,
              heading1: styles.markdownHeading,
              heading2: styles.markdownHeading,
              strong: styles.markdownBold,
              em: styles.markdownItalic,
              link: styles.markdownLink,
              code_inline: styles.markdownCode,
              code_block: styles.markdownCodeBlock,
              fence: styles.markdownCodeBlock,
              bullet_list: styles.markdownList,
              ordered_list: styles.markdownList,
              list_item: styles.markdownListItem,
            }}
          >
            {aiAnalysis}
          </Markdown>
        </View>
      )}
      {loadingAnalysis && (
        <View style={styles.aiCard}>
          <Text style={styles.aiText}>🤖 Analyzing your progress...</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Current Stats</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Weight</Text>
            <Text style={styles.statValue}>{profile.weight} kg</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>BMI</Text>
            <Text style={[styles.statValue, { color: getBMIColor(currentBMI) }]}>
              {currentBMI.toFixed(1)}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Height</Text>
            <Text style={styles.statValue}>{profile.height} cm</Text>
          </View>
        </View>
      </View>

      {trend && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Weight Trend</Text>
          <View style={styles.trendContainer}>
            <Ionicons
              name={
                trend.trend === 'up'
                  ? 'trending-up'
                  : trend.trend === 'down'
                  ? 'trending-down'
                  : 'remove'
              }
              size={48}
              color={trend.color}
            />
            <Text style={[styles.trendValue, { color: trend.color }]}>
              {trend.trend === 'stable' ? 'No change' : `${trend.value} kg`}
            </Text>
            <Text style={styles.trendLabel}>
              {trend.trend === 'up'
                ? 'Weight increased'
                : trend.trend === 'down'
                ? 'Weight decreased'
                : 'Weight stable'}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Update Weight</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter new weight (kg)"
          placeholderTextColor={theme.colors.textTertiary}
          keyboardType="numeric"
          value={newWeight}
          onChangeText={(text) => {
            // Allow decimal input
            const cleanText = text.replace(/[^0-9.]/g, '');
            setNewWeight(cleanText);
          }}
        />
        <TouchableOpacity style={styles.updateButton} onPress={handleUpdateWeight}>
          <Ionicons name="scale" size={24} color="#fff" />
          <Text style={styles.updateButtonText}>Update Weight</Text>
        </TouchableOpacity>
      </View>

      {weightHistory.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Weight History</Text>
          {weightHistory.map((entry, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyDate}>
                {new Date(entry.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
              <Text style={styles.historyWeight}>{entry.weight} kg</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Goal: {profile.goal.charAt(0).toUpperCase() + profile.goal.slice(1)} Weight</Text>
        <Text style={styles.goalText}>
          {profile.goal === 'lose' &&
            'Keep up the good work! Focus on consistent healthy eating and staying active.'}
          {profile.goal === 'maintain' &&
            'Great job maintaining your weight! Continue your balanced approach.'}
          {profile.goal === 'gain' &&
            'Stay consistent with your calorie surplus and strength training for healthy weight gain.'}
        </Text>
      </View>

      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Progress Tips</Text>
        <Text style={styles.tipItem}>
          • Weigh yourself at the same time each day for consistency
        </Text>
        <Text style={styles.tipItem}>
          • Track weekly averages, not daily fluctuations
        </Text>
        <Text style={styles.tipItem}>
          • Take progress photos alongside weight measurements
        </Text>
        <Text style={styles.tipItem}>
          • Celebrate non-scale victories like better energy and mood
        </Text>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  header: {
    backgroundColor: '#1e8449',
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 24,
    paddingTop: 50,
    paddingBottom: 28,
    backgroundColor: theme.colors.primary,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.headerText,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
    fontWeight: '500',
  },
  card: {
    backgroundColor: theme.colors.card,
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  trendContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  trendValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 10,
  },
  trendLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 5,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    color: theme.colors.text,
  },
  updateButton: {
    flexDirection: 'row',
    backgroundColor: '#9b59b6',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonText: {
    color: theme.colors.headerText,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  historyDate: {
    fontSize: 16,
    color: theme.colors.text,
  },
  historyWeight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9b59b6',
  },
  goalText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  tipsCard: {
    backgroundColor: theme.colors.card,
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 15,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 30,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  tipItem: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 10,
    lineHeight: 20,
  },
  aiCard: {
    backgroundColor: '#e3f2fd',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.accent,
    marginLeft: 8,
  },
  aiText: {
    fontSize: 14,
    color: '#1565c0',
    lineHeight: 20,
  },
  markdownHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1565c0',
    marginTop: 8,
    marginBottom: 4,
  },
  markdownBold: {
    fontWeight: 'bold',
    color: '#1565c0',
  },
  markdownItalic: {
    fontStyle: 'italic',
    color: '#1976d2',
  },
  markdownLink: {
    color: '#2196f3',
    textDecorationLine: 'underline',
  },
  markdownCode: {
    backgroundColor: '#e3f2fd',
    fontFamily: 'monospace',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 13,
  },
  markdownCodeBlock: {
    backgroundColor: '#1565c0',
    color: theme.colors.headerText,
    fontFamily: 'monospace',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontSize: 12,
  },
  markdownList: {
    marginVertical: 4,
  },
  markdownListItem: {
    flexDirection: 'row',
    marginVertical: 2,
  },
});
