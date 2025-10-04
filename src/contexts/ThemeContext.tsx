import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSafeAuth } from '@/hooks/useSafeAuth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  const [theme, setTheme] = useState<Theme>('dark');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('blue');
  const [language, setLanguage] = useState<Language>('en');
  const [fontSize, setFontSize] = useState(16);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserPreferences();
    } else {
      const savedTheme = localStorage.getItem('theme') as Theme;
      const savedColorTheme = localStorage.getItem('colorTheme') as ColorTheme;
      const savedLanguage = localStorage.getItem('language') as Language;
      
      if (savedTheme) setTheme(savedTheme);
      if (savedColorTheme) setColorTheme(savedColorTheme);
      if (savedLanguage) setLanguage(savedLanguage);

      const savedFontSize = localStorage.getItem('fontSize');
      if (savedFontSize) setFontSize(Number(savedFontSize));
    }
  }, [user]);

  const loadUserPreferences = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, 'profiles', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.theme) setTheme(userData.theme);
        if (userData.colorTheme) setColorTheme(userData.colorTheme);
        if (userData.language) setLanguage(userData.language);
        if (userData.fontSize) setFontSize(userData.fontSize);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreference = async (key: string, value: any) => {
    if (user) {
      try {
        const docRef = doc(db, 'profiles', user.uid);
        await updateDoc(docRef, { [key]: value });
      } catch (error) {
        console.error('Error saving preference:', error);
        localStorage.setItem(key, String(value));
      }
    } else {
      localStorage.setItem(key, String(value));
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    savePreference('theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('blue', 'grey', 'red', 'yellow', 'green');
    root.classList.add(colorTheme);
    savePreference('colorTheme', colorTheme);
  }, [colorTheme]);

  useEffect(() => {
    savePreference('language', language);
    document.documentElement.lang = language;
    document.body.className = document.body.className.replace(/\b(en|hi|pa|ur|bn|ta|te|ml|kn|gu|mr)\b/g, '');
    document.body.classList.add(language);
  }, [language]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    savePreference('fontSize', fontSize);
  }, [fontSize]);

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
