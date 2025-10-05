import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSafeAuth } from '@/hooks/useSafeAuth';
import UserPreferencesService from '@/services/userPreferencesService';

type Theme = 'light' | 'dark';
type ColorTheme = 'blue' | 'grey' | 'red' | 'yellow' | 'green';

const colorThemeNames: Record<ColorTheme, string> = {
  blue: 'Blue',
  grey: 'Grey',
  red: 'Red',
  yellow: 'Yellow',
  green: 'Green'
};
type Language = 'en' | 'hi' | 'pa' | 'ur' | 'bn' | 'ta' | 'te' | 'ml' | 'kn' | 'gu' | 'mr';

interface ThemeContextType {
  theme: Theme;
  colorTheme: ColorTheme;
  language: Language;
  fontSize: number;
  isTransitioning: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setColorTheme: (colorTheme: ColorTheme) => void;
  setLanguage: (lang: Language) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  getColorThemeName: (colorTheme: ColorTheme) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { user } = useSafeAuth();
  
  // Initialize with values from localStorage to prevent flash
  const [theme, setTheme] = useState<Theme>(() => 
    (localStorage.getItem('theme') as Theme) || 'dark'
  );
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => 
    (localStorage.getItem('colorTheme') as ColorTheme) || 'blue'
  );
  const [language, setLanguage] = useState<Language>(() => 
    (localStorage.getItem('language') as Language) || 'en'
  );
  const [fontSize, setFontSize] = useState(() => 
    parseInt(localStorage.getItem('fontSize') || '16')
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Initialize theme immediately on mount
  useEffect(() => {
    const initializeTheme = () => {
      const savedTheme = localStorage.getItem('theme') as Theme;
      const savedColorTheme = localStorage.getItem('colorTheme') as ColorTheme;
      const savedLanguage = localStorage.getItem('language') as Language;
      const savedFontSize = localStorage.getItem('fontSize');
      
      if (savedTheme) setTheme(savedTheme);
      if (savedColorTheme) setColorTheme(savedColorTheme);
      if (savedLanguage) setLanguage(savedLanguage);
      if (savedFontSize) setFontSize(Number(savedFontSize));
    };
    
    // Initialize immediately
    initializeTheme();
    
    // Load user preferences if logged in
    if (user) {
      loadUserPreferences();
    }
  }, [user]);

  const loadUserPreferences = async () => {
    if (!user) return;
    try {
      // First sync local to Firebase to ensure latest settings are saved
      await UserPreferencesService.syncLocalToFirebase(user.uid);
      
      // Then get preferences from Firebase
      const preferences = await UserPreferencesService.getUserPreferences(user.uid);
      
      // Apply Firebase preferences (they are the source of truth for synced data)
      if (preferences.theme) {
        setTheme(preferences.theme as Theme);
        localStorage.setItem('theme', preferences.theme);
      }
      if (preferences.colorTheme) {
        setColorTheme(preferences.colorTheme as ColorTheme);
        localStorage.setItem('colorTheme', preferences.colorTheme);
      }
      if (preferences.language) {
        setLanguage(preferences.language as Language);
        localStorage.setItem('language', preferences.language);
      }
      if (preferences.fontSize) {
        setFontSize(preferences.fontSize);
        localStorage.setItem('fontSize', String(preferences.fontSize));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      // Keep current localStorage values on error
    }
  };

  const saveThemePreference = async (theme: Theme, colorTheme: ColorTheme) => {
    if (!user) return;
    try {
      await UserPreferencesService.updateTheme(user.uid, theme, colorTheme);
    } catch (error) {
      console.error('Error saving theme preference to Firebase:', error);
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Save to localStorage immediately
    localStorage.setItem('theme', theme);
    
    // Save to Firebase if user is logged in
    if (user) {
      saveThemePreference(theme, colorTheme);
    }
  }, [theme, user]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('blue', 'grey', 'red', 'yellow', 'green');
    root.classList.add(colorTheme);
    
    // Save to localStorage immediately
    localStorage.setItem('colorTheme', colorTheme);
    
    // Save to Firebase if user is logged in
    if (user) {
      saveThemePreference(theme, colorTheme);
    }
  }, [colorTheme, user]);

  useEffect(() => {
    // Save to localStorage immediately
    localStorage.setItem('language', language);
    
    // Update DOM
    document.documentElement.lang = language;
    document.body.className = document.body.className.replace(/\b(en|hi|pa|ur|bn|ta|te|ml|kn|gu|mr)\b/g, '');
    document.body.classList.add(language);
    
    // Save to Firebase if user is logged in
    if (user) {
      UserPreferencesService.updateLanguage(user.uid, language).catch(console.error);
    }
  }, [language, user]);

  useEffect(() => {
    // Save to localStorage immediately
    localStorage.setItem('fontSize', String(fontSize));
    
    // Update DOM
    document.documentElement.style.fontSize = `${fontSize}px`;
    
    // Save to Firebase if user is logged in
    if (user) {
      UserPreferencesService.updateFontSize(user.uid, fontSize).catch(console.error);
    }
  }, [fontSize, user]);

  const toggleTheme = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
      setTimeout(() => setIsTransitioning(false), 800);
    }, 400);
  };

  const increaseFontSize = () => setFontSize(fz => Math.min(fz + 2, 24));
  const decreaseFontSize = () => setFontSize(fz => Math.max(fz - 2, 12));
  
  const getColorThemeName = (colorTheme: ColorTheme) => {
    return colorThemeNames[colorTheme];
  };

  return (
    <ThemeContext.Provider value={{ theme, colorTheme, language, fontSize, isTransitioning, toggleTheme, setTheme, setColorTheme, setLanguage, increaseFontSize, decreaseFontSize, getColorThemeName }}>
      {children}
      {isTransitioning && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black opacity-0 animate-[fadeIn_0.4s_ease-in-out_forwards]" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-400 shadow-2xl animate-[moonTransition_0.8s_ease-in-out_forwards] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-600 rounded-full transform translate-x-full animate-[moonSlide_0.8s_ease-in-out_forwards]" />
            </div>
          </div>
        </div>
      )}
    </ThemeContext.Provider>
  );
};
