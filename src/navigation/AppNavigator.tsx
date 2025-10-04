import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import FoodTrackingScreen from '../screens/FoodTrackingScreen';
import ProgressScreen from '../screens/ProgressScreen';
import AIChatScreen from '../screens/AIChatScreen';
import AboutScreen from '../screens/AboutScreen';
import { getUserProfile, saveUserProfile } from '../services/storage';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Track Food') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'AI Guide') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Progress') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          } else if (route.name === 'About') {
            iconName = focused ? 'information-circle' : 'information-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#27ae60',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarStyle: {
          paddingBottom: 20,
          paddingTop: 5,
          height: 75,
          position: 'absolute',
          bottom: 0,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Track Food" component={FoodTrackingScreen} />
      <Tab.Screen name="AI Guide" component={AIChatScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="About" component={AboutScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const profile = await getUserProfile();

    // Migration: Convert old height in meters to cm
    if (profile && profile.height < 100) {
      // If height is less than 100, it's likely in meters, convert to cm
      const updatedProfile = {
        ...profile,
        height: profile.height * 100,
      };
      await saveUserProfile(updatedProfile);
    }

    setIsOnboarded(!!profile);
  };

  if (isOnboarded === null) {
    return null; // or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isOnboarded ? (
          <Stack.Screen name="Onboarding">
            {(props) => (
              <OnboardingScreen
                {...props}
                onComplete={() => setIsOnboarded(true)}
              />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="MainTabs" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
