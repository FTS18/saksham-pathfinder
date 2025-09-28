import { useState, useEffect } from 'react';
import { Moon, Sun, ZoomIn, ZoomOut, Volume2, VolumeX, ChevronUp, ChevronDown, Palette } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip';
import { NotificationSystem } from './NotificationSystem';
import GoogleTranslate from './GoogleTranslate';

export const AccessibilitySidebar = () => {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  const { theme, colorTheme, toggleTheme, setColorTheme, increaseFontSize, decreaseFontSize } = useTheme();
  
  const colorThemes = [
    { name: 'Blue', value: 'blue', color: '#3b82f6' },
    { name: 'Grey', value: 'grey', color: '#6b7280' },
    { name: 'Red', value: 'red', color: '#ef4444' },
    { name: 'Yellow', value: 'yellow', color: '#eab308' },
    { name: 'Green', value: 'green', color: '#22c55e' }
  ];
  
  const currentThemeIndex = colorThemes.findIndex(t => t.value === colorTheme);
  
  const cycleTheme = (direction: 'up' | 'down') => {
    const newIndex = direction === 'up' 
      ? (currentThemeIndex + 1) % colorThemes.length
      : (currentThemeIndex - 1 + colorThemes.length) % colorThemes.length;
    setColorTheme(colorThemes[newIndex].value as any);
  };

  useEffect(() => {
    const saved = localStorage.getItem('selectedLanguage') || 'en';
    setCurrentLang(saved);
    
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('selectedLanguage') || 'en';
    setCurrentLang(saved);
  }, []);

  const toggleLanguage = () => {
    // Force Google Translate to load if not already loaded
    if (!window.google?.translate) {
      const script = document.createElement('script');
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.head.appendChild(script);
      
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'en,hi',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
        }, 'google_translate_element');
      };
      
      setTimeout(() => toggleLanguage(), 1000);
      return;
    }
    
    const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (combo) {
      const newLang = currentLang === 'en' ? 'hi' : 'en';
      combo.value = newLang;
      combo.dispatchEvent(new Event('change'));
      localStorage.setItem('selectedLanguage', newLang);
      setCurrentLang(newLang);
    } else {
      // Fallback: reload page with language parameter
      const newLang = currentLang === 'en' ? 'hi' : 'en';
      localStorage.setItem('selectedLanguage', newLang);
      setCurrentLang(newLang);
      window.location.reload();
    }
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (!audioEnabled) {
      // Enable speech synthesis and add click listeners
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Audio reading enabled. Click on any text to hear it read aloud.');
        speechSynthesis.speak(utterance);
        
        // Add click listeners to all text elements
        document.addEventListener('click', handleTextClick);
      }
    } else {
      // Disable speech synthesis and remove listeners
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        document.removeEventListener('click', handleTextClick);
      }
    }
  };

  const handleTextClick = (event: MouseEvent) => {
    if (!audioEnabled) return;
    
    const target = event.target as HTMLElement;
    const text = target.textContent || target.innerText;
    
    if (text && text.trim().length > 0 && 'speechSynthesis' in window) {
      speechSynthesis.cancel(); // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(text.trim());
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        document.removeEventListener('click', handleTextClick);
      }
    };
  }, []);

  return (
    <TooltipProvider>
      <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] bg-muted/20 dark:bg-muted/30 border-l border-border z-20 w-[60px] flex flex-col hover-scale-sm">
        {/* Header */}
        <div className="flex items-center justify-center p-3 border-b border-border hover:bg-muted/30 transition-colors">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
        </div>

        {/* Controls */}
        <div className="flex-1 p-3 space-y-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleTheme} 
                className="w-12 h-12 p-0 hover-scale-sm btn-press transition-all duration-200"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">{theme === 'light' ? 'Dark mode' : 'Light mode'}</TooltipContent>
          </Tooltip>
          
          {/* Theme Color Selector */}
          <div className="flex flex-col">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => cycleTheme('up')} 
                  className="w-12 h-6 p-0 rounded-b-none hover-scale-sm btn-press"
                >
                  <ChevronUp className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Next theme</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-12 h-6 flex items-center justify-center border-x border-border">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: colorThemes[currentThemeIndex]?.color }}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">{colorThemes[currentThemeIndex]?.name} theme</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => cycleTheme('down')} 
                  className="w-12 h-6 p-0 rounded-t-none hover-scale-sm btn-press"
                >
                  <ChevronDown className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Previous theme</TooltipContent>
            </Tooltip>
          </div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={increaseFontSize} 
                className="w-12 h-12 p-0 hover-scale-sm btn-press transition-all duration-200"
              >
                <ZoomIn className="w-5 h-5"/>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Increase font size</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={decreaseFontSize} 
                className="w-12 h-12 p-0 hover-scale-sm btn-press transition-all duration-200"
              >
                <ZoomOut className="w-5 h-5"/>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Decrease font size</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleLanguage}
                className="w-12 h-12 p-0 hover-scale-sm btn-press transition-all duration-200"
              >
                <span className="text-lg font-bold">
                  {currentLang === 'en' ? '🇮🇳' : '🇬🇧'}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">{currentLang === 'en' ? 'Switch to Hindi' : 'Switch to English'}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleAudio}
                className="w-12 h-12 p-0 hover-scale-sm btn-press transition-all duration-200"
              >
                {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Toggle read aloud</TooltipContent>
          </Tooltip>


        </div>
        
        {/* Chatbot Icon - Desktop Only */}
        <div className="hidden md:block absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const chatbotButton = document.querySelector('[data-chatbot-trigger]') as HTMLButtonElement;
                  if (chatbotButton) {
                    chatbotButton.click();
                  } else {
                    // Fallback: dispatch custom event
                    window.dispatchEvent(new CustomEvent('toggleChatbot'));
                  }
                }}
                className="w-12 h-12 p-0 hover-scale-sm btn-press rounded-full bg-primary/10 hover:bg-primary/20 transition-all duration-200"
              >
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">AI Career Assistant</TooltipContent>
          </Tooltip>
        </div>
      </div>
      {/* Hidden Google Translate */}
      <div className="hidden">
        <GoogleTranslate />
      </div>
    </TooltipProvider>
  );
};