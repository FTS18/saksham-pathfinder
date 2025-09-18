import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { initGoogleTranslate } from '@/lib/googleTranslate';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' }
];

export const LanguageSelector = () => {
  const { language, setLanguage } = useTheme();

  useEffect(() => {
    initGoogleTranslate();
  }, []);

  const handleLanguageChange = (newLanguage: 'en' | 'hi') => {
    setLanguage(newLanguage);
    
    // Trigger Google Translate
    const googleTranslateElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (googleTranslateElement) {
      googleTranslateElement.value = newLanguage === 'hi' ? 'hi' : 'en';
      googleTranslateElement.dispatchEvent(new Event('change'));
    }
  };

  const currentLang = languages.find(lang => lang.code === language);

  return (
    <>
      <div id="google_translate_element" className="hidden"></div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Globe className="w-4 h-4" />
            {currentLang?.flag} {currentLang?.name}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code as 'en' | 'hi')}
              className="gap-2"
            >
              {lang.flag} {lang.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};