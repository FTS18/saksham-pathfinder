// Theme Presets for Saksham Pathfinder
// Each theme maintains consistent color scheme across light and dark modes

export interface ThemePreset {
  id: string;
  name: string;
  label: string;
  description: string;
  lightMode: ThemeColors;
  darkMode: ThemeColors;
}

export interface ThemeColors {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  muted: string;
  mutedForeground: string;
  background: string;
  foreground: string;
  border: string;
  input: string;
  ring: string;
}

export const THEME_PRESETS: Record<string, ThemePreset> = {
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    label: '🌊 Ocean',
    description: 'Cool blues and teals - fresh and professional',
    lightMode: {
      primary: '#0ea5e9',
      primaryForeground: '#ffffff',
      secondary: '#06b6d4',
      secondaryForeground: '#ffffff',
      accent: '#14b8a6',
      accentForeground: '#ffffff',
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      muted: '#e2e8f0',
      mutedForeground: '#64748b',
      background: '#ffffff',
      foreground: '#0f172a',
      border: '#cbd5e1',
      input: '#f1f5f9',
      ring: '#0ea5e9',
    },
    darkMode: {
      primary: '#0ea5e9',
      primaryForeground: '#0f172a',
      secondary: '#06b6d4',
      secondaryForeground: '#0f172a',
      accent: '#14b8a6',
      accentForeground: '#0f172a',
      destructive: '#ef4444',
      destructiveForeground: '#0f172a',
      muted: '#1e293b',
      mutedForeground: '#94a3b8',
      background: '#0f172a',
      foreground: '#f1f5f9',
      border: '#1e293b',
      input: '#1e293b',
      ring: '#0ea5e9',
    },
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    label: '🌲 Forest',
    description: 'Natural greens - calm and grounded',
    lightMode: {
      primary: '#16a34a',
      primaryForeground: '#ffffff',
      secondary: '#22c55e',
      secondaryForeground: '#ffffff',
      accent: '#84cc16',
      accentForeground: '#ffffff',
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      muted: '#e2e8f0',
      mutedForeground: '#64748b',
      background: '#ffffff',
      foreground: '#1e3a1f',
      border: '#cbd5e1',
      input: '#f1f5f9',
      ring: '#16a34a',
    },
    darkMode: {
      primary: '#16a34a',
      primaryForeground: '#0f172a',
      secondary: '#22c55e',
      secondaryForeground: '#0f172a',
      accent: '#84cc16',
      accentForeground: '#0f172a',
      destructive: '#ef4444',
      destructiveForeground: '#0f172a',
      muted: '#1e293b',
      mutedForeground: '#94a3b8',
      background: '#0f172a',
      foreground: '#f1f5f9',
      border: '#1e293b',
      input: '#1e293b',
      ring: '#16a34a',
    },
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    label: '🌅 Sunset',
    description: 'Warm oranges and pinks - energetic and friendly',
    lightMode: {
      primary: '#f97316',
      primaryForeground: '#ffffff',
      secondary: '#fb923c',
      secondaryForeground: '#ffffff',
      accent: '#fbbf24',
      accentForeground: '#ffffff',
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      muted: '#e2e8f0',
      mutedForeground: '#64748b',
      background: '#ffffff',
      foreground: '#431407',
      border: '#cbd5e1',
      input: '#f1f5f9',
      ring: '#f97316',
    },
    darkMode: {
      primary: '#f97316',
      primaryForeground: '#0f172a',
      secondary: '#fb923c',
      secondaryForeground: '#0f172a',
      accent: '#fbbf24',
      accentForeground: '#0f172a',
      destructive: '#ef4444',
      destructiveForeground: '#0f172a',
      muted: '#1e293b',
      mutedForeground: '#94a3b8',
      background: '#0f172a',
      foreground: '#f1f5f9',
      border: '#1e293b',
      input: '#1e293b',
      ring: '#f97316',
    },
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    label: '⚡ Cyberpunk',
    description: 'Neon magenta and cyan - bold and modern',
    lightMode: {
      primary: '#d946ef',
      primaryForeground: '#ffffff',
      secondary: '#ec4899',
      secondaryForeground: '#ffffff',
      accent: '#06b6d4',
      accentForeground: '#ffffff',
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      muted: '#e2e8f0',
      mutedForeground: '#64748b',
      background: '#ffffff',
      foreground: '#581c87',
      border: '#cbd5e1',
      input: '#f1f5f9',
      ring: '#d946ef',
    },
    darkMode: {
      primary: '#d946ef',
      primaryForeground: '#0f172a',
      secondary: '#ec4899',
      secondaryForeground: '#0f172a',
      accent: '#06b6d4',
      accentForeground: '#0f172a',
      destructive: '#ef4444',
      destructiveForeground: '#0f172a',
      muted: '#1e293b',
      mutedForeground: '#94a3b8',
      background: '#0f172a',
      foreground: '#f1f5f9',
      border: '#1e293b',
      input: '#1e293b',
      ring: '#d946ef',
    },
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    label: '⚪ Minimal',
    description: 'Grayscale and neutral - clean and simple',
    lightMode: {
      primary: '#404040',
      primaryForeground: '#ffffff',
      secondary: '#737373',
      secondaryForeground: '#ffffff',
      accent: '#262626',
      accentForeground: '#ffffff',
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      muted: '#e5e5e5',
      mutedForeground: '#737373',
      background: '#ffffff',
      foreground: '#0a0a0a',
      border: '#e5e5e5',
      input: '#f5f5f5',
      ring: '#404040',
    },
    darkMode: {
      primary: '#e5e5e5',
      primaryForeground: '#0f172a',
      secondary: '#a3a3a3',
      secondaryForeground: '#0f172a',
      accent: '#d4d4d8',
      accentForeground: '#0f172a',
      destructive: '#ef4444',
      destructiveForeground: '#0f172a',
      muted: '#27272a',
      mutedForeground: '#a1a1aa',
      background: '#0f172a',
      foreground: '#fafafa',
      border: '#27272a',
      input: '#18181b',
      ring: '#e5e5e5',
    },
  },
};

export const DEFAULT_THEME = 'ocean';
