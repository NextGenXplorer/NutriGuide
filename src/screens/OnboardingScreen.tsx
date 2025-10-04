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
} from 'react-native';
import { UserProfile } from '../types';
import { saveUserProfile } from '../services/storage';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
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
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={profile.name}
            onChangeText={(text) => setProfile({ ...profile, name: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your age"
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
            placeholder="e.g., 175"
            keyboardType="numeric"
            value={profile.height > 0 ? profile.height.toString() : ''}
            onChangeText={(text) => {
              // Allow decimal input
              const cleanText = text.replace(/[^0-9.]/g, '');
              setProfile({ ...profile, height: parseFloat(cleanText) || 0 });
            }}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Weight (in kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 70"
            keyboardType="numeric"
            value={profile.weight > 0 ? profile.weight.toString() : ''}
            onChangeText={(text) => {
              // Allow decimal input
              const cleanText = text.replace(/[^0-9.]/g, '');
              setProfile({ ...profile, weight: parseFloat(cleanText) || 0 });
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#27ae60',
    borderColor: '#27ae60',
  },
  optionText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  optionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#27ae60',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
