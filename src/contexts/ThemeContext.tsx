import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSafeAuth } from '@/hooks/useSafeAuth';
import UserPreferencesService from '@/services/userPreferencesService';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
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
  const { currentUser: user } = useSafeAuth();
  
  // Get initial values from localStorage with validation
  const getInitialTheme = (): Theme => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    localStorage.removeItem('theme');
    return 'dark';
  };
  
  const getInitialColorTheme = (): ColorTheme => {
    const validColors: ColorTheme[] = ['blue', 'grey', 'red', 'yellow', 'green'];
    const saved = localStorage.getItem('colorTheme') as ColorTheme;
    if (saved && validColors.includes(saved)) return saved;
    localStorage.removeItem('colorTheme');
    return 'blue';
  };
  
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => getInitialColorTheme());
  const [language, setLanguage] = useState<Language>(() => 
    (localStorage.getItem('language') as Language) || 'en'
  );
  const [fontSize, setFontSize] = useState(() => 
    parseInt(localStorage.getItem('fontSize') || '16')
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [pendingSaveTheme, setPendingSaveTheme] = useState<Theme | null>(null);
  const [pendingSaveColor, setPendingSaveColor] = useState<ColorTheme | null>(null);

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

  // Initialize theme on mount from localStorage
  useEffect(() => {
    const savedTheme = getInitialTheme();
    const savedColorTheme = getInitialColorTheme();
    applyThemeToDOM(savedTheme, savedColorTheme);
    setThemeState(savedTheme);
    setColorThemeState(savedColorTheme);
    setHasInitialized(true);
  }, []);

  // Load Firebase preferences when user changes (after localStorage is set)
  useEffect(() => {
    if (user && hasInitialized) {
      loadUserThemePreferences();
      // Also clean up any corrupted data
      cleanupCorruptedThemeData();
    }
  }, [user, hasInitialized]);

  // Ensure theme persists on state changes
  useEffect(() => {
    applyThemeToDOM(theme, colorTheme);
  }, [theme, colorTheme]);

  const loadUserThemePreferences = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, 'profiles', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const profile = docSnap.data();
        let themeUpdated = false;
        let colorUpdated = false;
        
        // Validate theme before using it
        const validThemes: Theme[] = ['light', 'dark'];
        const validColors: ColorTheme[] = ['blue', 'grey', 'red', 'yellow', 'green'];
        
        // Aggressively clean values - remove all whitespace/newlines
        const trimmedTheme = profile?.theme ? String(profile.theme).replace(/[\s\n\r\t]/g, '') : '';
        const trimmedColor = profile?.colorTheme ? String(profile.colorTheme).replace(/[\s\n\r\t]/g, '') : '';
        
        if (trimmedTheme && validThemes.includes(trimmedTheme as Theme) && trimmedTheme !== theme) {
          const newTheme = trimmedTheme as Theme;
          setThemeState(newTheme);
          localStorage.setItem('theme', newTheme);
          themeUpdated = true;
        }
        if (trimmedColor && validColors.includes(trimmedColor as ColorTheme) && trimmedColor !== colorTheme) {
          const newColorTheme = trimmedColor as ColorTheme;
          setColorThemeState(newColorTheme);
          localStorage.setItem('colorTheme', newColorTheme);
          colorUpdated = true;
        }
        
        // Apply immediately to DOM if changes detected
        if (themeUpdated || colorUpdated) {
          const finalTheme = (validThemes.includes(trimmedTheme as Theme) ? trimmedTheme : theme) as Theme;
          const finalColor = (validColors.includes(trimmedColor as ColorTheme) ? trimmedColor : colorTheme) as ColorTheme;
          applyThemeToDOM(finalTheme, finalColor);
        }
      }
    } catch (error) {
      console.error('Error loading theme preferences:', error);
      // Keep current localStorage values on error
    }
  };

  // Auto-cleanup corrupted theme data from Firestore
  const cleanupCorruptedThemeData = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, 'profiles', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const profile = docSnap.data();
        const validThemes = ['light', 'dark'];
        const validColors = ['blue', 'grey', 'red', 'yellow', 'green'];
        
        // Check if theme or colorTheme are corrupted (not in valid list)
        const themeCorrupted = profile?.theme && !validThemes.includes(profile.theme);
        const colorCorrupted = profile?.colorTheme && !validColors.includes(profile.colorTheme);
        
        if (themeCorrupted || colorCorrupted) {
          // Fix corrupted data
          const updates: any = {};
          if (themeCorrupted) updates.theme = 'dark';
          if (colorCorrupted) updates.colorTheme = 'blue';
          
          await updateDoc(docRef, updates);
        }
      }
    } catch (error) {
      // Silently fail on cleanup
    }
  };

  // Theme setters that update both state and DOM
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setPendingSaveTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyThemeToDOM(newTheme, colorTheme);
    
    // Save to profile document immediately if user is authenticated
    if (user) {
      saveThemeToProfile(user.uid, newTheme, colorTheme).then(() => {
        setPendingSaveTheme(null);
      }).catch(error => {
        console.error('❌ Failed to save theme to Firestore:', error);
        // Pending save will retry when user loads
      });
    }
  };

  const setColorTheme = (newColorTheme: ColorTheme) => {
    setColorThemeState(newColorTheme);
    setPendingSaveColor(newColorTheme);
    localStorage.setItem('colorTheme', newColorTheme);
    applyThemeToDOM(theme, newColorTheme);
    
    // Save to profile document immediately if user is authenticated
    if (user) {
      saveThemeToProfile(user.uid, theme, newColorTheme).then(() => {
        setPendingSaveColor(null);
      }).catch(error => {
        console.error('❌ Failed to save color theme to Firestore:', error);
        // Pending save will retry when user loads
      });
    }
  };

  const saveThemeToProfile = async (userId: string, theme: Theme, colorTheme: ColorTheme) => {
    try {
      // Validate before saving
      const validThemes = ['light', 'dark'];
      const validColors = ['blue', 'grey', 'red', 'yellow', 'green'];
      
      const validatedTheme = validThemes.includes(theme) ? theme : 'dark';
      const validatedColor = validColors.includes(colorTheme) ? colorTheme : 'blue';
      
      // Save to profiles collection (single source of truth)
      const profileRef = doc(db, 'profiles', userId);
      
      // Check if document exists
      const docSnap = await getDoc(profileRef);
      
      if (docSnap.exists()) {
        // Document exists, update it
        await updateDoc(profileRef, { 
          theme: validatedTheme, 
          colorTheme: validatedColor,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Document doesn't exist, create it with merge
        await setDoc(profileRef, { 
          theme: validatedTheme, 
          colorTheme: validatedColor,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
      
      // Ensure localStorage is in sync
      localStorage.setItem('theme', validatedTheme);
      localStorage.setItem('colorTheme', validatedColor);
    } catch (error) {
      console.error('❌ Error in saveThemeToProfile:', error);
      throw error; // Re-throw so caller can handle
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

  // Sync theme to Firestore when user becomes available
  useEffect(() => {
    if (!user) return;
    
    // If there are pending saves (user wasn't available earlier), retry them
    if (pendingSaveTheme !== null || pendingSaveColor !== null) {
      const saveThemeVal = pendingSaveTheme !== null ? pendingSaveTheme : theme;
      const saveColorVal = pendingSaveColor !== null ? pendingSaveColor : colorTheme;
      
      saveThemeToProfile(user.uid, saveThemeVal, saveColorVal).then(() => {
        setPendingSaveTheme(null);
        setPendingSaveColor(null);
      }).catch(error => {
        console.error('Error retrying pending saves:', error);
      });
    } else if (theme && colorTheme) {
      // No pending saves, just sync current values
      saveThemeToProfile(user.uid, theme, colorTheme).catch(error => {
        console.error('Error syncing theme after user loaded:', error);
      });
    }
  }, [user]);

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
      const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
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
