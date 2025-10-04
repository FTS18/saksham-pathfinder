import { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Volume2, VolumeX, ChevronUp, ChevronDown, Palette } from 'lucide-react';
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
      <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur-xl border-l border-border/50 z-20 w-[60px] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-center p-3 border-b border-border hover:bg-muted/30 transition-colors rounded-t-xl">
          <Palette className="w-5 h-5 text-primary" />
        </div>

        {/* Controls */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">

          
            {/* Theme Color Selector */}
            <div className="flex flex-col rounded-2xl overflow-hidden border border-border/50">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => cycleTheme('up')} 
                    className="w-full h-6 p-0 rounded-none hover:bg-muted/50 hover-scale-sm btn-press"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">Next theme</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full h-8 flex items-center justify-center bg-muted/20">
                    <div 
                      className="w-5 h-5 rounded-full ring-2 ring-background shadow-sm" 
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
                    className="w-full h-6 p-0 rounded-none hover:bg-muted/50 hover-scale-sm btn-press"
                  >
                    <ChevronDown className="w-4 h-4" />
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
                  className="w-full h-12 p-0 rounded-2xl hover:bg-muted/50 hover:shadow-md hover:ring-2 hover:ring-muted/30 transition-all duration-200 hover-scale-sm btn-press"
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
                  className="w-full h-12 p-0 rounded-2xl hover:bg-muted/50 hover:shadow-md hover:ring-2 hover:ring-muted/30 transition-all duration-200 hover-scale-sm btn-press"
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
                  className="w-full h-12 p-0 rounded-2xl hover:bg-muted/50 hover:shadow-md hover:ring-2 hover:ring-muted/30 transition-all duration-200 hover-scale-sm btn-press"
                >
                  <span className="text-sm font-bold">
                    {currentLang === 'en' ? 'हि' : 'EN'}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">{currentLang === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleAudio}
                  className="w-full h-12 p-0 rounded-2xl hover:bg-muted/50 hover:shadow-md hover:ring-2 hover:ring-muted/30 transition-all duration-200 hover-scale-sm btn-press"
                >
                  {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Toggle read aloud</TooltipContent>
            </Tooltip>


          </div>
        </div>
        
        {/* Bottom Controls */}
        <div className="p-4 border-t border-border">
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
                    window.dispatchEvent(new CustomEvent('toggleChatbot'));
                  }
                }}
                className="w-full h-12 p-0 rounded-2xl bg-primary/10 hover:bg-primary/20 hover:shadow-md hover:ring-2 hover:ring-primary/30 transition-all duration-200 hover-scale-sm btn-press"
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