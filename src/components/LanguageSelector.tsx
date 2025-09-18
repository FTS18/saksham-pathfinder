import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { TranslationService, Language } from '@/lib/translation';

const languages = [
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'hi' as Language, name: 'हिंदी', flag: '🇮🇳' },
  { code: 'pa' as Language, name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ur' as Language, name: 'اردو', flag: '🇵🇰' }
];

interface LanguageSelectorProps {
  onLanguageChange?: (language: Language) => void;
}

export const LanguageSelector = ({ onLanguageChange }: LanguageSelectorProps) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const translationService = TranslationService.getInstance();

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language);
    translationService.setLanguage(language);
    onLanguageChange?.(language);
    
    // Trigger page refresh to apply translations
    window.location.reload();
  };

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="w-4 h-4" />
          {currentLang?.flag} {currentLang?.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="gap-2"
          >
            {language.flag} {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};