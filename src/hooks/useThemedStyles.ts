import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme, Theme } from '../context/ThemeContext';

export const useThemedStyles = <T extends StyleSheet.NamedStyles<T>>(
  styleFactory: (theme: Theme) => T
): T => {
  const { theme } = useTheme();
  return useMemo(() => styleFactory(theme), [theme]);
};

export default useThemedStyles;
