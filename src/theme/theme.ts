// src/theme/theme.ts
import { useColorScheme } from 'react-native';

export const palettes = {
  light: {
    bg: '#F4F7FC',
    surface: '#FFFFFF',
    text: '#0D1313',
    muted: '#6B7280',
    border: '#E4E8EE',
    primary: '#0AC5C5',
    success: '#22c55e',
    warning: '#f59e0b',
    danger:  '#ef4444',
  },
  dark: {
    bg: '#0E1116',
    surface: '#141922',
    text: '#EAF2F7',
    muted: '#97A2AE',
    border: '#263040',
    primary: '#0AC5C5',
    success: '#27d07a',
    warning: '#ffb020',
    danger:  '#ff5b5b',
  },
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 };
export const spacing = (n=1) => 4*n;

export const shadow = (e=8, color='#000') => ({
  shadowColor: color,
  shadowOpacity: 0.15,
  shadowRadius: e,
  shadowOffset: { width: 0, height: Math.ceil(e/2) },
  elevation: Math.ceil(e),
});

export const typography = {
  title:   { fontSize: 20, fontWeight: '800' as const },
  h2:      { fontSize: 16, fontWeight: '700' as const },
  body:    { fontSize: 14 },
  caption: { fontSize: 12 },
};

export function useTheme() {
  const scheme = useColorScheme(); // 'light' | 'dark'
  const c = scheme === 'dark' ? palettes.dark : palettes.light;
  return { colors: c, radius, spacing, shadow, typography, scheme };
}
