import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { initGoogleTranslate, translatePage } from '@/lib/googleTranslate';

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
    
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage && savedLanguage !== 'en') {
      [1000, 2000, 3000].forEach(delay => {
        setTimeout(() => translatePage(savedLanguage), delay);
      });
    }
  }, []);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as any);
    localStorage.setItem('selectedLanguage', newLanguage);
    
    document.body.className = document.body.className.replace(/\b(en|hi|pa|ur|bn|ta|te|ml|kn|gu|mr)\b/g, '');
    document.body.classList.add(newLanguage);
    
    if (newLanguage === 'en') {
      window.location.reload();
    } else {
      [0, 200, 500, 1000].forEach(delay => {
        setTimeout(() => translatePage(newLanguage), delay);
      });
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