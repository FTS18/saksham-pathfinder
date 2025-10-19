import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSafeAuth } from '@/hooks/useSafeAuth';
import UserPreferencesService from '@/services/userPreferencesService';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { THEME_PRESETS, DEFAULT_THEME, ThemePreset } from '@/lib/themePresets';

type Theme = 'light' | 'dark';
type ColorTheme = 'blue' | 'grey' | 'red' | 'yellow' | 'green';
type PresetTheme = keyof typeof THEME_PRESETS;

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
  currentPreset: PresetTheme;
  useSystemTheme: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setColorTheme: (colorTheme: ColorTheme) => void;
  setLanguage: (lang: Language) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  getColorThemeName: (colorTheme: ColorTheme) => string;
  setPreset: (preset: PresetTheme) => void;
  setUseSystemTheme: (use: boolean) => void;
  getAvailablePresets: () => ThemePreset[];
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

  const getInitialPreset = (): PresetTheme => {
    const saved = localStorage.getItem('themePreset') as PresetTheme;
    if (saved && saved in THEME_PRESETS) return saved;
    localStorage.removeItem('themePreset');
    return DEFAULT_THEME as PresetTheme;
  };

  const getInitialUseSystemTheme = (): boolean => {
    const saved = localStorage.getItem('useSystemTheme');
    return saved === null ? true : saved === 'true';
  };
  
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => getInitialColorTheme());
  const [currentPreset, setCurrentPresetState] = useState<PresetTheme>(() => getInitialPreset());
  const [useSystemTheme, setUseSystemThemeState] = useState<boolean>(() => getInitialUseSystemTheme());
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

  // Helper to convert hex to HSL
  const hexToHSL = (hex: string): string => {
    // Parse hex
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  // Apply themes to DOM (both preset colors and light/dark mode)
  const applyThemeToDOM = (newTheme: Theme, newColorTheme: ColorTheme, presetId?: PresetTheme) => {
    const root = document.documentElement;
    
    // Remove conflicting classes
    root.classList.remove('light', 'dark');
    root.classList.remove('blue', 'grey', 'red', 'yellow', 'green');
    
    // Add current mode
    root.classList.add(newTheme);
    root.classList.add(newColorTheme);
    
    // Apply preset colors if provided
    if (presetId && presetId in THEME_PRESETS) {
      const preset = THEME_PRESETS[presetId];
      const colors = newTheme === 'dark' ? preset.darkMode : preset.lightMode;
      
      // Apply CSS variables as HSL
      Object.entries(colors).forEach(([key, hexValue]) => {
        const cssVarName = `--color-${key}`;
        const hslValue = hexToHSL(hexValue);
        root.style.setProperty(cssVarName, hslValue);
      });
      
      // Store preset ID
      root.dataset.themePreset = presetId;
    }
  };

  // Get system preference for theme
  const getSystemTheme = (): Theme => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  };

  // Initialize theme on mount from localStorage
  useEffect(() => {
    const savedTheme = getInitialTheme();
    const savedColorTheme = getInitialColorTheme();
    const savedPreset = getInitialPreset();
    const savedUseSystemTheme = getInitialUseSystemTheme();
    
    // Use system theme if enabled
    const themeToUse = savedUseSystemTheme ? getSystemTheme() : savedTheme;
    
    applyThemeToDOM(themeToUse, savedColorTheme, savedPreset);
    setThemeState(themeToUse);
    setColorThemeState(savedColorTheme);
    setCurrentPresetState(savedPreset);
    setUseSystemThemeState(savedUseSystemTheme);
    setHasInitialized(true);
    
    // Listen for system theme changes
    if (savedUseSystemTheme) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
      const handler = (e: MediaQueryListEvent | MediaQueryList) => {
        const newTheme: Theme = e.matches ? 'light' : 'dark';
        setThemeState(newTheme);
        applyThemeToDOM(newTheme, savedColorTheme, savedPreset);
      };
      
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
      }
    }
  }, []);

  // Load Firebase preferences when user changes (after localStorage is set)
  useEffect(() => {
    if (user && hasInitialized) {
      loadUserThemePreferences();
    }
  }, [user, hasInitialized]);

  // Ensure theme persists on state changes
  useEffect(() => {
    applyThemeToDOM(theme, colorTheme, currentPreset);
  }, [theme, colorTheme, currentPreset]);

  // Theme setters that update both state and DOM
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setPendingSaveTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyThemeToDOM(newTheme, colorTheme, currentPreset);
    
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
    applyThemeToDOM(theme, newColorTheme, currentPreset);
    
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
    if (useSystemTheme) {
      // If system theme is enabled, toggle it off and set manual theme
      setUseSystemTheme(false);
      const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
    } else {
      setIsTransitioning(true);
      setTimeout(() => {
        const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        setTimeout(() => setIsTransitioning(false), 800);
      }, 400);
    }
  };

  const setPreset = (preset: PresetTheme) => {
    setCurrentPresetState(preset);
    localStorage.setItem('themePreset', preset);
    
    // Save to profile if user is authenticated
    if (user) {
      saveThemePresetToProfile(user.uid, preset).catch(error => {
        console.error('Failed to save preset to Firestore:', error);
      });
    }
  };

  const setUseSystemTheme = (use: boolean) => {
    setUseSystemThemeState(use);
    localStorage.setItem('useSystemTheme', String(use));
    
    if (use) {
      // Apply system theme immediately
      const systemTheme = getSystemTheme();
      setThemeState(systemTheme);
      applyThemeToDOM(systemTheme, colorTheme, currentPreset);
    }
    
    // Save to profile if user is authenticated
    if (user) {
      saveThemePresetToProfile(user.uid, currentPreset).catch(error => {
        console.error('Failed to save system theme preference to Firestore:', error);
      });
    }
  };

  const getAvailablePresets = (): ThemePreset[] => {
    return Object.values(THEME_PRESETS);
  };

  const saveThemePresetToProfile = async (userId: string, preset: PresetTheme) => {
    try {
      const profileRef = doc(db, 'profiles', userId);
      const docSnap = await getDoc(profileRef);
      
      if (docSnap.exists()) {
        await updateDoc(profileRef, { 
          themePreset: preset,
          useSystemTheme: useSystemTheme,
          updatedAt: new Date().toISOString()
        });
      } else {
        await setDoc(profileRef, { 
          themePreset: preset,
          useSystemTheme: useSystemTheme,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
      
      localStorage.setItem('themePreset', preset);
      localStorage.setItem('useSystemTheme', String(useSystemTheme));
    } catch (error) {
      console.error('Error in saveThemePresetToProfile:', error);
      throw error;
    }
  };

  const loadUserThemePreferences = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, 'profiles', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const profile = docSnap.data();
        
        // Load theme preset
        if (profile?.themePreset && profile.themePreset in THEME_PRESETS) {
          setCurrentPresetState(profile.themePreset);
          localStorage.setItem('themePreset', profile.themePreset);
        }
        
        // Load system theme preference
        if (typeof profile?.useSystemTheme === 'boolean') {
          setUseSystemThemeState(profile.useSystemTheme);
          localStorage.setItem('useSystemTheme', String(profile.useSystemTheme));
          
          // Apply system theme if enabled
          if (profile.useSystemTheme) {
            const systemTheme = getSystemTheme();
            setThemeState(systemTheme);
          }
        }
      }
    } catch (error) {
      console.error('Error loading theme preferences:', error);
    }
  };

  const increaseFontSize = () => setFontSize(fz => Math.min(fz + 2, 24));
  const decreaseFontSize = () => setFontSize(fz => Math.max(fz - 2, 12));
  
  const getColorThemeName = (colorTheme: ColorTheme) => {
    return colorThemeNames[colorTheme];
  };

  return (
    <ThemeContext.Provider value={{ theme, colorTheme, language, fontSize, isTransitioning, currentPreset, useSystemTheme, toggleTheme, setTheme, setColorTheme, setLanguage, increaseFontSize, decreaseFontSize, getColorThemeName, setPreset, setUseSystemTheme, getAvailablePresets }}>
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
