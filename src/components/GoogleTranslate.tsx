import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Languages } from 'lucide-react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

const GoogleTranslate = () => {
  const [currentLang, setCurrentLang] = useState('en');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    if (isInitializing) return;
    
    const loadGoogleTranslate = () => {
      if (window.google?.translate && !isInitializing) {
        initializeTranslate();
        return;
      }

      // Check if script already exists
      if (document.querySelector('script[src*="translate.google.com"]')) {
        return;
      }

      setIsInitializing(true);
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.onerror = () => {
        setIsInitializing(false);
        console.log('Failed to load Google Translate');
      };
      document.head.appendChild(script);

      window.googleTranslateElementInit = () => {
        initializeTranslate();
      };
    };

    const initializeTranslate = () => {
      if (isLoaded || !window.google?.translate) return;
      
      try {
        const element = document.getElementById('google_translate_element');
        if (!element || element.children.length > 0) return;
        
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'en,hi',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
          multilanguagePage: true
        }, 'google_translate_element');
        setIsLoaded(true);
        setIsInitializing(false);
      } catch (error) {
        console.log('Google Translate initialization failed:', error);
        setIsInitializing(false);
      }
    };

    loadGoogleTranslate();

    // Check saved language
    const savedLang = localStorage.getItem('selectedLanguage') || 'en';
    setCurrentLang(savedLang);
  }, [isInitializing, isLoaded]);

  const translatePage = (targetLang: string) => {
    if (!isLoaded) return;
    
    const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (combo) {
      combo.value = targetLang;
      combo.dispatchEvent(new Event('change'));
      setCurrentLang(targetLang);
      localStorage.setItem('selectedLanguage', targetLang);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div id="google_translate_element" className="hidden"></div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => translatePage(currentLang === 'en' ? 'hi' : 'en')}
        className="flex items-center gap-1 text-xs h-8 px-2"
        disabled={!isLoaded}
      >
        <Languages className="w-4 h-4" />
        <span className="hidden sm:inline">
          {currentLang === 'en' ? 'हिंदी' : 'English'}
        </span>
      </Button>
    </div>
  );
};

export default GoogleTranslate;