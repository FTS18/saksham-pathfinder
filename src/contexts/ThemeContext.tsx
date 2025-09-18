import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'rose';
type Language = 'en' | 'hi' | 'bn' | 'ta';

interface ThemeContextType {
  theme: Theme;
  language: Language;
  fontSize: number;
  isTransitioning: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
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
  const [theme, setTheme] = useState<Theme>('dark'); // Default to dark
  const [language, setLanguage] = useState<Language>('en');
  const [fontSize, setFontSize] = useState(16);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedLanguage = localStorage.getItem('language') as Language;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Default to dark mode for first-time users
      setTheme('dark');
      localStorage.setItem('theme', 'dark');
    }
    
    if (savedLanguage) setLanguage(savedLanguage);

    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) setFontSize(Number(savedFontSize));
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'blue', 'green', 'purple', 'orange', 'teal', 'rose');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem('fontSize', String(fontSize));
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

  return (
    <ThemeContext.Provider value={{ theme, language, fontSize, isTransitioning, toggleTheme, setTheme, setLanguage, increaseFontSize, decreaseFontSize }}>
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
