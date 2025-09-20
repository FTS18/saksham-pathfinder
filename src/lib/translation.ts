export type Language = 'en' | 'hi' | 'pa' | 'ur';

export interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    pa: string;
    ur: string;
  };
}

export const translations: Translations = {
  'profile.title': { en: 'Profile Settings', hi: '', pa: '', ur: '' },
  'profile.save': { en: 'Save Changes', hi: '', pa: '', ur: '' },
  'profile.basicInfo': { en: 'Basic Information', hi: '', pa: '', ur: '' },
  'profile.username': { en: 'Username', hi: '', pa: '', ur: '' },
  'profile.email': { en: 'Email', hi: '', pa: '', ur: '' },
  'profile.phone': { en: 'Phone Number', hi: '', pa: '', ur: '' },
  'profile.country': { en: 'Country', hi: '', pa: '', ur: '' },
  'profile.state': { en: 'State', hi: '', pa: '', ur: '' },
  'profile.city': { en: 'City', hi: '', pa: '', ur: '' },
  'profile.sectors': { en: 'Interested Sectors', hi: '', pa: '', ur: '' },
  'profile.skills': { en: 'Skills', hi: '', pa: '', ur: '' },
  'profile.minStipend': { en: 'Minimum Expected Stipend', hi: '', pa: '', ur: '' },
  'profile.selectSectorsFirst': { en: 'Please select sectors first to enable skills selection', hi: '', pa: '', ur: '' },
  'index.processing': { en: 'Processing Your Profile', hi: '', pa: '', ur: '' },
  'index.analyzing': { en: 'Our AI is analyzing your preferences and finding the best matches...', hi: '', pa: '', ur: '' },
  'index.teamName': { en: 'Team HexaCoders AI Engine', hi: '', pa: '', ur: '' },
  'index.recommendations': { en: 'Your AI-Powered Recommendations', hi: '', pa: '', ur: '' },
  'index.found': { en: 'Found', hi: '', pa: '', ur: '' },
  'index.internships': { en: 'internships matching your profile', hi: '', pa: '', ur: '' },
  'index.stats': { en: '250+ Internships Posted • 100+ Companies Hiring • 5,000+ Active Users', hi: '', pa: '', ur: '' },
  'index.sortBy': { en: 'Sort by:', hi: '', pa: '', ur: '' },
  'index.aiScore': { en: 'AI Score', hi: '', pa: '', ur: '' },
  'index.stipend': { en: 'Stipend', hi: '', pa: '', ur: '' },
  'index.proximity': { en: 'Proximity', hi: '', pa: '', ur: '' },
  'index.noRecommendations': { en: 'No recommendations found for this profile.', hi: '', pa: '', ur: '' },
  'index.updateProfile': { en: 'Update Profile', hi: '', pa: '', ur: '' }
};

export class TranslationService {
  private static instance: TranslationService;
  private currentLanguage: Language = 'en';

  static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  setLanguage(language: Language) {
    this.currentLanguage = language;
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  translate(key: string): string {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translation[this.currentLanguage] || translation.en || key;
  }

  // Helper method to translate with fallback
  t(key: string, fallback?: string): string {
    const translation = translations[key];
    if (!translation) {
      return fallback || key;
    }
    return translation[this.currentLanguage] || translation.en || fallback || key;
  }

  // Google Translate API integration for dynamic content
  async translateText(text: string, targetLanguage: Language): Promise<string> {
    if (targetLanguage === 'en') return text;
    
    try {
      // Using Google Translate API (requires API key)
      // For demo purposes, we'll use a simple mapping
      const languageMap: Record<Language, string> = {
        en: 'en',
        hi: 'hi',
        pa: 'pa',
        ur: 'ur'
      };

      // In production, you would use:
      // const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${languageMap[targetLanguage]}&dt=t&q=${encodeURIComponent(text)}`);
      // const data = await response.json();
      // return data[0][0][0];

      // For now, return original text
      return text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }
}

export const t = (key: string) => {
  const translation = translations[key];
  return translation ? translation.en : key;
};