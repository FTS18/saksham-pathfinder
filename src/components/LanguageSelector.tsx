import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { initGoogleTranslate } from '@/lib/googleTranslate';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' }
];

export const LanguageSelector = () => {
  const { language, setLanguage } = useTheme();

  useEffect(() => {
    initGoogleTranslate();
    
    // Restore language selection on page load
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage && savedLanguage !== 'en') {
      setTimeout(() => {
        const googleTranslateElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (googleTranslateElement) {
          googleTranslateElement.value = savedLanguage;
          googleTranslateElement.dispatchEvent(new Event('change'));
        }
      }, 2000); // Wait longer for Google Translate to fully load
    }
  }, []);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as any);
    localStorage.setItem('selectedLanguage', newLanguage);
    
    // Trigger Google Translate immediately
    const triggerTranslation = () => {
      const googleTranslateElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (googleTranslateElement) {
        const translateValue = newLanguage === 'en' ? '' : newLanguage;
        googleTranslateElement.value = translateValue;
        googleTranslateElement.dispatchEvent(new Event('change'));
        
        // Add body class for font switching
        document.body.className = document.body.className.replace(/\b(en|hi|pa|ur|bn|ta|te|ml|kn|gu|mr)\b/g, '');
        document.body.classList.add(newLanguage);
      }
    };
    
    // Try multiple times to ensure translation works
    triggerTranslation();
    setTimeout(triggerTranslation, 500);
    setTimeout(triggerTranslation, 1500);
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
              onClick={() => handleLanguageChange(lang.code)}
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