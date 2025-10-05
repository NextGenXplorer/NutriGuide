import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: {
    // Primary colors
    primary: string;
    primaryDark: string;
    primaryLight: string;

    // Background colors
    background: string;
    surface: string;
    card: string;

    // Text colors
    text: string;
    textSecondary: string;
    textTertiary: string;

    // Accent colors
    accent: string;
    success: string;
    warning: string;
    error: string;
    info: string;

    // Border and divider
    border: string;
    divider: string;

    // Special
    shadow: string;
    overlay: string;

    // Header specific
    headerBackground: string;
    headerGradient: string;
    headerText: string;
    headerSubtext: string;
    logoBackground: string;
  };
}

const lightTheme: Theme = {
  mode: 'light',
  colors: {
    primary: '#27ae60',
    primaryDark: '#1e8449',
    primaryLight: '#2ecc71',

    background: '#f5f5f5',
    surface: '#ffffff',
    card: '#ffffff',

    text: '#2c3e50',
    textSecondary: '#7f8c8d',
    textTertiary: '#95a5a6',

    accent: '#3498db',
    success: '#27ae60',
    warning: '#f39c12',
    error: '#e74c3c',
    info: '#3498db',

    border: '#ddd',
    divider: '#ecf0f1',

    shadow: '#000',
    overlay: 'rgba(0, 0, 0, 0.5)',

    headerBackground: '#1e8449',
    headerGradient: '#27ae60',
    headerText: '#ffffff',
    headerSubtext: 'rgba(255, 255, 255, 0.85)',
    logoBackground: 'rgba(255, 255, 255, 0.95)',
  },
};

const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    primary: '#2ecc71',
    primaryDark: '#27ae60',
    primaryLight: '#52be80',

    background: '#121212',
    surface: '#1e1e1e',
    card: '#2a2a2a',

    text: '#e0e0e0',
    textSecondary: '#b0b0b0',
    textTertiary: '#808080',

    accent: '#5dade2',
    success: '#2ecc71',
    warning: '#f39c12',
    error: '#e74c3c',
    info: '#5dade2',

    border: '#404040',
    divider: '#333333',

    shadow: '#000',
    overlay: 'rgba(0, 0, 0, 0.7)',

    headerBackground: '#1a5c3e',
    headerGradient: '#239855',
    headerText: '#ffffff',
    headerSubtext: 'rgba(255, 255, 255, 0.85)',
    logoBackground: 'rgba(255, 255, 255, 0.15)',
  },
};

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@nutriguide_theme_mode';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [theme, setTheme] = useState<Theme>(lightTheme);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setThemeModeState(savedTheme);
        setTheme(savedTheme === 'dark' ? darkTheme : lightTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
      setTheme(mode === 'dark' ? darkTheme : lightTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
