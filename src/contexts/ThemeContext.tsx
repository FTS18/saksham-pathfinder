import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type Language = 'en' | 'hi' | 'bn' | 'ta';

interface ThemeContextType {
  theme: Theme;
  language: Language;
  fontSize: number;
  toggleTheme: () => void;
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
  const [theme, setTheme] = useState<Theme>('light');
  const [language, setLanguage] = useState<Language>('en');
  const [fontSize, setFontSize] = useState(16); // Base font size

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedLanguage = localStorage.getItem('language') as Language;
    
    if (savedTheme) setTheme(savedTheme);
    if (savedLanguage) setLanguage(savedLanguage);

    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) setFontSize(Number(savedFontSize));

  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
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
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const increaseFontSize = () => setFontSize(fz => Math.min(fz + 2, 24));
  const decreaseFontSize = () => setFontSize(fz => Math.max(fz - 2, 12));

  return (
    <ThemeContext.Provider value={{ theme, language, fontSize, toggleTheme, setLanguage, increaseFontSize, decreaseFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
};
