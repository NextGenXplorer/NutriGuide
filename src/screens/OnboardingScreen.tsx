import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Switch,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile } from '../types';
import { saveUserProfile } from '../services/storage';
import { useTheme } from '../context/ThemeContext';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { theme, themeMode, toggleTheme } = useTheme();
  const styles = createStyles(theme);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    age: 0,
    height: 0,
    weight: 0,
    gender: 'male',
    activityLevel: 'moderate',
    goal: 'maintain',
    dietaryPreference: 'vegetarian',
  });
  const [heightText, setHeightText] = useState('');
  const [weightText, setWeightText] = useState('');

  const handleSubmit = async () => {
    if (
      !profile.name ||
      profile.age <= 0 ||
      profile.height <= 0 ||
      profile.weight <= 0
    ) {
      alert('Please fill in all fields with valid values');
      return;
    }

    try {
      await saveUserProfile(profile);
      onComplete();
    } catch (error) {
      alert('Error saving profile. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Image source={require('../../assets/icon.png')} style={styles.logo} />
            <View>
              <Text style={styles.headerTitle}>Welcome to NutriGuide 🥗</Text>
              <Text style={styles.headerSubtitle}>Let's create your personalized nutrition plan</Text>
            </View>
          </View>
        </View>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.themeToggleContainer}>
            <View style={styles.themeToggleLeft}>
              <Ionicons
                name={themeMode === 'dark' ? 'moon' : 'sunny'}
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.themeToggleText}>
                {themeMode === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </Text>
            </View>
            <Switch
              value={themeMode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#ddd', true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor={theme.colors.textTertiary}
            value={profile.name}
            onChangeText={(text) => setProfile({ ...profile, name: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your age"
            placeholderTextColor={theme.colors.textTertiary}
            keyboardType="numeric"
            value={profile.age > 0 ? profile.age.toString() : ''}
            onChangeText={(text) =>
              setProfile({ ...profile, age: parseInt(text) || 0 })
            }
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Height (in cm)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 175.5"
            placeholderTextColor={theme.colors.textTertiary}
            keyboardType="decimal-pad"
            value={heightText}
            onChangeText={(text) => {
              setHeightText(text);
              const numValue = parseFloat(text);
              if (!isNaN(numValue)) {
                setProfile({ ...profile, height: numValue });
              }
            }}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Weight (in kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 70.5"
            placeholderTextColor={theme.colors.textTertiary}
            keyboardType="decimal-pad"
            value={weightText}
            onChangeText={(text) => {
              setWeightText(text);
              const numValue = parseFloat(text);
              if (!isNaN(numValue)) {
                setProfile({ ...profile, weight: numValue });
              }
            }}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.buttonRow}>
            {['male', 'female', 'other'].map((g) => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.optionButton,
                  profile.gender === g && styles.optionButtonActive,
                ]}
                onPress={() =>
                  setProfile({ ...profile, gender: g as UserProfile['gender'] })
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    profile.gender === g && styles.optionTextActive,
                  ]}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Activity Level</Text>
          <View style={styles.buttonRow}>
            {[
              { key: 'low', label: 'Low' },
              { key: 'moderate', label: 'Moderate' },
              { key: 'high', label: 'High' },
            ].map((a) => (
              <TouchableOpacity
                key={a.key}
                style={[
                  styles.optionButton,
                  profile.activityLevel === a.key && styles.optionButtonActive,
                ]}
                onPress={() =>
                  setProfile({
                    ...profile,
                    activityLevel: a.key as UserProfile['activityLevel'],
                  })
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    profile.activityLevel === a.key && styles.optionTextActive,
                  ]}
                >
                  {a.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Goal</Text>
          <View style={styles.buttonRow}>
            {[
              { key: 'lose', label: 'Lose Weight' },
              { key: 'maintain', label: 'Maintain' },
              { key: 'gain', label: 'Gain Weight' },
            ].map((g) => (
              <TouchableOpacity
                key={g.key}
                style={[
                  styles.optionButton,
                  profile.goal === g.key && styles.optionButtonActive,
                ]}
                onPress={() =>
                  setProfile({ ...profile, goal: g.key as UserProfile['goal'] })
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    profile.goal === g.key && styles.optionTextActive,
                  ]}
                >
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dietary Preference</Text>
          <View style={styles.buttonRow}>
            {[
              { key: 'vegetarian', label: 'Vegetarian' },
              { key: 'vegan', label: 'Vegan' },
              { key: 'non-veg', label: 'Non-Veg' },
            ].map((d) => (
              <TouchableOpacity
                key={d.key}
                style={[
                  styles.optionButton,
                  profile.dietaryPreference === d.key && styles.optionButtonActive,
                ]}
                onPress={() =>
                  setProfile({
                    ...profile,
                    dietaryPreference: d.key as UserProfile['dietaryPreference'],
                  })
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    profile.dietaryPreference === d.key && styles.optionTextActive,
                  ]}
                >
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Start My Journey 🚀</Text>
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: theme.colors.primary,
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.headerText,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.headerText,
    opacity: 0.9,
  },
  scrollView: {
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
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
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeToggleText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: theme.colors.text,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  optionTextActive: {
    color: theme.colors.headerText,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: theme.colors.headerText,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
