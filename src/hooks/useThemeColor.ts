import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const themeColors = {
  light: {
    blue: '#3b82f6',
    grey: '#6b7280',
    red: '#ef4444',
    yellow: '#eab308',
    green: '#22c55e'
  },
  dark: {
    blue: '#1e40af',
    grey: '#374151',
    red: '#dc2626',
    yellow: '#ca8a04',
    green: '#16a34a'
  }
};

export const useThemeColor = () => {
  const { theme, colorTheme } = useTheme();

  useEffect(() => {
    const updateThemeColor = () => {
      const color = themeColors[theme][colorTheme];
      
      // Update Chrome topbar color
      const themeColorMeta = document.getElementById('theme-color') as HTMLMetaElement;
      const tileColorMeta = document.getElementById('tile-color') as HTMLMetaElement;
      
      if (themeColorMeta) themeColorMeta.content = color;
      if (tileColorMeta) tileColorMeta.content = color;
      
      // Update Apple status bar
      let statusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]') as HTMLMetaElement;
      if (statusBarMeta) {
        statusBarMeta.content = theme === 'dark' ? 'black-translucent' : 'default';
      }
    };

    updateThemeColor();
  }, [theme, colorTheme]);
};