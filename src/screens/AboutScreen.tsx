import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen() {
  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Image source={require('../../assets/icon.png')} style={styles.headerLogo} />
          <Text style={styles.title}>About NutriGuide 💚</Text>
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
          <Ionicons name="fitness" size={20} color="#27ae60" />
          <Text style={styles.featureText}>BMI Analysis & Tracking</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="restaurant" size={20} color="#27ae60" />
          <Text style={styles.featureText}>AI Food Recognition</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="chatbubbles" size={20} color="#27ae60" />
          <Text style={styles.featureText}>AI Nutrition Coach</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="trending-up" size={20} color="#27ae60" />
          <Text style={styles.featureText}>Progress Insights</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="calendar" size={20} color="#27ae60" />
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
  },
  headerLogo: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  description: {
    fontSize: 15,
    color: '#7f8c8d',
    lineHeight: 22,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#2c3e50',
    marginLeft: 12,
  },
  poweredCard: {
    backgroundColor: '#fff',
    margin: 15,
    marginBottom: 0,
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  poweredTitle: {
    fontSize: 16,
    color: '#7f8c8d',
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
    color: '#2c3e50',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
  },
  linkButton: {
    flexDirection: 'row',
    backgroundColor: '#2c3e50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    gap: 8,
  },
  linkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  contactText: {
    fontSize: 15,
    color: '#2c3e50',
    marginLeft: 15,
    fontWeight: '500',
  },
  versionCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  versionText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  copyrightText: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
  },
});
