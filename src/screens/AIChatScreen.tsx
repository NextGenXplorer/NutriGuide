import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { getUserProfile } from '../services/storage';
import { analyzeBMI } from '../utils/bmiCalculator';
import { getGeminiResponse, getQuickSuggestions } from '../services/geminiService';
import { UserProfile, BMIResult } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export default function AIChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bmiResult, setBmiResult] = useState<BMIResult | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadUserData();
    addWelcomeMessage();
  }, []);

  const loadUserData = async () => {
    const userProfile = await getUserProfile();
    if (userProfile) {
      setProfile(userProfile);
      const result = analyzeBMI(userProfile);
      setBmiResult(result);
    }
  };

  const addWelcomeMessage = () => {
    const welcomeMsg: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      text: `Hello! 👋 I'm your NutriGuide AI assistant. I'm here to help you with nutrition advice, meal planning, and achieving your health goals.\n\nHow can I help you today?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMsg]);
  };

  const sendMessage = async (text: string = inputText) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      // Build conversation history for context
      const history = messages.map((msg) => ({
        role: msg.role === 'user' ? 'User' : 'Assistant',
        text: msg.text,
      }));

      const response = await getGeminiResponse(text.trim(), profile, bmiResult, history);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: 'Sorry, I encountered an error. Please make sure you have configured your Gemini API key and try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = getQuickSuggestions(profile);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Image source={require('../../assets/icon.png')} style={styles.logo} />
          <Text style={styles.headerTitle}>AI Nutrition Guide 💬</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={[styles.messagesContent, { paddingBottom: 90 }]}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.role === 'user' ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            {message.role === 'user' ? (
              <Text style={styles.userText}>{message.text}</Text>
            ) : (
              <Markdown
                style={{
                  body: styles.assistantText,
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
                {message.text}
              </Markdown>
            )}
            <Text
              style={[
                styles.timestamp,
                message.role === 'user' ? styles.userTimestamp : styles.assistantTimestamp,
              ]}
            >
              {message.timestamp.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        ))}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#3498db" />
            <Text style={styles.loadingText}>Thinking...</Text>
          </View>
        )}

        {messages.length === 1 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Quick Questions:</Text>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionButton}
                onPress={() => sendMessage(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask me anything about nutrition..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={() => sendMessage()}
          disabled={!inputText.trim() || loading}
        >
          <Ionicons
            name="send"
            size={24}
            color={inputText.trim() ? '#fff' : '#bdc3c7'}
          />
        </TouchableOpacity>
      </View>
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
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#3498db',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: '#2c3e50',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  userTimestamp: {
    color: '#ecf0f1',
    textAlign: 'right',
  },
  assistantTimestamp: {
    color: '#95a5a6',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingText: {
    marginLeft: 8,
    color: '#7f8c8d',
    fontSize: 14,
  },
  suggestionsContainer: {
    marginTop: 10,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  suggestionButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  suggestionText: {
    fontSize: 14,
    color: '#3498db',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: 10,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#3498db',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ecf0f1',
  },
  markdownHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 8,
    marginBottom: 4,
  },
  markdownBold: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  markdownItalic: {
    fontStyle: 'italic',
    color: '#34495e',
  },
  markdownLink: {
    color: '#3498db',
    textDecorationLine: 'underline',
  },
  markdownCode: {
    backgroundColor: '#f5f5f5',
    fontFamily: 'monospace',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 14,
  },
  markdownCodeBlock: {
    backgroundColor: '#2c3e50',
    color: '#ecf0f1',
    fontFamily: 'monospace',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontSize: 13,
  },
  markdownList: {
    marginVertical: 4,
  },
  markdownListItem: {
    flexDirection: 'row',
    marginVertical: 2,
  },
});
