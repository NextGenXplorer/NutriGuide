import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function AboutScreen() {
  const { theme, themeMode, toggleTheme } = useTheme();

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
  };

  const styles = createStyles(theme);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.headerGradient}>
          <View style={styles.headerTop}>
            <View style={styles.logoContainer}>
              <Ionicons name="information-circle-outline" size={32} color={theme.mode === 'dark' ? '#fff' : '#27ae60'} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>About</Text>
              <Text style={styles.subtitle}>NutriGuide Information</Text>
            </View>
          </View>
        </View>
      </View>

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

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>What is NutriGuide?</Text>
        <Text style={styles.description}>
          NutriGuide is your AI-powered nutrition companion that helps you maintain a healthy
          lifestyle through personalized diet guidance, meal planning, and progress tracking.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Features ✨</Text>
        <View style={styles.featureItem}>
          <Ionicons name="fitness" size={20} color={theme.mode === 'dark' ? '#fff' : '#27ae60'} />
          <Text style={styles.featureText}>BMI Analysis & Tracking</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="restaurant" size={20} color={theme.mode === 'dark' ? '#fff' : '#27ae60'} />
          <Text style={styles.featureText}>AI Food Recognition</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="chatbubbles" size={20} color={theme.mode === 'dark' ? '#fff' : '#27ae60'} />
          <Text style={styles.featureText}>AI Nutrition Coach</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="trending-up" size={20} color={theme.mode === 'dark' ? '#fff' : '#27ae60'} />
          <Text style={styles.featureText}>Progress Insights</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="calendar" size={20} color={theme.mode === 'dark' ? '#fff' : '#27ae60'} />
          <Text style={styles.featureText}>Personalized Meal Plans</Text>
        </View>
      </View>

      <View style={styles.poweredCard}>
        <Text style={styles.poweredTitle}>Powered By</Text>
        <Image
          source={{ uri: 'https://avatars.githubusercontent.com/u/223625668?s=400&u=3760cffbf5cec0e95bc14deac3725202dfa2eb8e&v=4' }}
          style={styles.logo}
        />
        <Text style={styles.companyName}>NextGenXplorer</Text>
        <Text style={styles.tagline}>Innovating the Future of Technology</Text>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => openLink('https://github.com/NextGenXplorer/')}
        >
          <Ionicons name="logo-github" size={24} color="#fff" />
          <Text style={styles.linkText}>GitHub</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Connect With Us 🌐</Text>

        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => openLink('https://www.instagram.com/nexgenxplorerr')}
        >
          <Ionicons name="logo-instagram" size={24} color="#E4405F" />
          <Text style={styles.contactText}>@nexgenxplorerr</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => openLink('https://whatsapp.com/channel/0029VaU05uG9RZAeiXKyEu06')}
        >
          <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
          <Text style={styles.contactText}>WhatsApp Channel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => openLink('mailto:nxgextra@gmail.com')}
        >
          <Ionicons name="mail" size={24} color="#3498db" />
          <Text style={styles.contactText}>nxgextra@gmail.com</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.versionCard}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
        <Text style={styles.copyrightText}>
          © 2025 NextGenXplorer. All rights reserved.
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
    backgroundColor: theme.colors.headerBackground,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 24,
    paddingTop: 50,
    paddingBottom: 28,
    backgroundColor: theme.colors.headerGradient,
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
    color: theme.colors.headerSubtext,
    marginTop: 2,
    fontWeight: '500',
  },
  card: {
    backgroundColor: theme.colors.card,
    margin: 15,
    marginBottom: 0,
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
  description: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 22,
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
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: theme.colors.text,
    marginLeft: 12,
  },
  poweredCard: {
    backgroundColor: theme.colors.card,
    margin: 15,
    marginBottom: 0,
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  poweredTitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 15,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  linkButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.text,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    gap: 8,
  },
  linkText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.mode === 'dark' ? theme.colors.surface : '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  contactText: {
    fontSize: 15,
    color: theme.colors.text,
    marginLeft: 15,
    fontWeight: '500',
  },
  versionCard: {
    backgroundColor: theme.colors.card,
    margin: 15,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  versionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  copyrightText: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },
});
