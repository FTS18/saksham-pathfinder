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
  
  // Get initial values from localStorage
  const getInitialTheme = (): Theme => localStorage.getItem('theme') as Theme || 'dark';
  const getInitialColorTheme = (): ColorTheme => localStorage.getItem('colorTheme') as ColorTheme || 'blue';
  
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(getInitialColorTheme);
  const [language, setLanguage] = useState<Language>(() => 
    (localStorage.getItem('language') as Language) || 'en'
  );
  const [fontSize, setFontSize] = useState(() => 
    parseInt(localStorage.getItem('fontSize') || '16')
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Apply themes to DOM
  const applyThemeToDOM = (newTheme: Theme, newColorTheme: ColorTheme) => {
    const root = document.documentElement;
    // Remove only conflicting classes, not all at once
    root.classList.remove('light', 'dark');
    root.classList.remove('blue', 'grey', 'red', 'yellow', 'green');
    // Add classes immediately
    root.classList.add(newTheme);
    root.classList.add(newColorTheme);
  };

  // Initialize theme on mount and sync with Firebase when user loads
  useEffect(() => {
    const savedTheme = getInitialTheme();
    const savedColorTheme = getInitialColorTheme();
    applyThemeToDOM(savedTheme, savedColorTheme);
    setThemeState(savedTheme);
    setColorThemeState(savedColorTheme);
  }, []);

  // Load Firebase preferences when user changes
  useEffect(() => {
    if (user) {
      loadUserThemePreferences();
    }
  }, [user]);

  // Ensure theme persists on state changes
  useEffect(() => {
    applyThemeToDOM(theme, colorTheme);
  }, [theme, colorTheme]);

  const loadUserThemePreferences = async () => {
    if (!user) return;
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      const docRef = doc(db, 'profiles', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const profile = docSnap.data();
        if (profile?.theme && profile.theme !== theme) {
          const newTheme = profile.theme as Theme;
          setThemeState(newTheme);
          localStorage.setItem('theme', newTheme);
        }
        if (profile?.colorTheme && profile.colorTheme !== colorTheme) {
          const newColorTheme = profile.colorTheme as ColorTheme;
          setColorThemeState(newColorTheme);
          localStorage.setItem('colorTheme', newColorTheme);
        }
      }
    } catch (error) {
      console.error('Error loading theme preferences:', error);
      // Keep current localStorage values on error
    }
  };

  // Theme setters that update both state and DOM
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyThemeToDOM(newTheme, colorTheme);
    
    // Save to profile document immediately
    if (user) {
      saveThemeToProfile(user.uid, newTheme, colorTheme).catch(console.error);
    }
  };

  const setColorTheme = (newColorTheme: ColorTheme) => {
    setColorThemeState(newColorTheme);
    localStorage.setItem('colorTheme', newColorTheme);
    applyThemeToDOM(theme, newColorTheme);
    
    // Save to profile document immediately
    if (user) {
      saveThemeToProfile(user.uid, theme, newColorTheme).catch(console.error);
    }
  };

  const saveThemeToProfile = async (userId: string, theme: Theme, colorTheme: ColorTheme) => {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      const docRef = doc(db, 'profiles', userId);
      await updateDoc(docRef, { theme, colorTheme });
    } catch (error) {
      console.error('Error saving theme to profile:', error);
    }
  };

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
    <ThemeContext.Provider value={{ theme, colorTheme, language, fontSize, isTransitioning, toggleTheme, setTheme: setTheme, setColorTheme: setColorTheme, setLanguage, increaseFontSize, decreaseFontSize, getColorThemeName }}>
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
