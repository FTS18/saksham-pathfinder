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
  // Profile page translations
  'profile.title': {
    en: 'Profile Settings',
    hi: 'प्रोफ़ाइल सेटिंग्स',
    pa: 'ਪ੍ਰੋਫਾਈਲ ਸੈਟਿੰਗਜ਼',
    ur: 'پروفائل کی ترتیبات'
  },
  'profile.save': {
    en: 'Save Changes',
    hi: 'परिवर्तन सहेजें',
    pa: 'ਤਬਦੀਲੀਆਂ ਸੇਵ ਕਰੋ',
    ur: 'تبدیلیاں محفوظ کریں'
  },
  'profile.basicInfo': {
    en: 'Basic Information',
    hi: 'बुनियादी जानकारी',
    pa: 'ਬੁਨਿਆਦੀ ਜਾਣਕਾਰੀ',
    ur: 'بنیادی معلومات'
  },
  'profile.username': {
    en: 'Username',
    hi: 'उपयोगकर्ता नाम',
    pa: 'ਯੂਜ਼ਰਨੇਮ',
    ur: 'صارف نام'
  },
  'profile.email': {
    en: 'Email',
    hi: 'ईमेल',
    pa: 'ਈਮੇਲ',
    ur: 'ای میل'
  },
  'profile.phone': {
    en: 'Phone Number',
    hi: 'फ़ोन नंबर',
    pa: 'ਫੋਨ ਨੰਬਰ',
    ur: 'فون نمبر'
  },
  'profile.country': {
    en: 'Country',
    hi: 'देश',
    pa: 'ਦੇਸ਼',
    ur: 'ملک'
  },
  'profile.state': {
    en: 'State',
    hi: 'राज्य',
    pa: 'ਰਾਜ',
    ur: 'ریاست'
  },
  'profile.city': {
    en: 'City',
    hi: 'शहर',
    pa: 'ਸ਼ਹਿਰ',
    ur: 'شہر'
  },
  'profile.sectors': {
    en: 'Interested Sectors',
    hi: 'रुचि के क्षेत्र',
    pa: 'ਦਿਲਚਸਪੀ ਦੇ ਖੇਤਰ',
    ur: 'دلچسپی کے شعبے'
  },
  'profile.skills': {
    en: 'Skills',
    hi: 'कौशल',
    pa: 'ਹੁਨਰ',
    ur: 'مہارتیں'
  },
  'profile.minStipend': {
    en: 'Minimum Expected Stipend',
    hi: 'न्यूनतम अपेक्षित वेतन',
    pa: 'ਘੱਟੋ-ਘੱਟ ਉਮੀਦ ਕੀਤਾ ਵੇਤਨ',
    ur: 'کم سے کم متوقع وظیفہ'
  },
  'profile.selectSectorsFirst': {
    en: 'Please select sectors first to enable skills selection',
    hi: 'कृपया पहले क्षेत्रों का चयन करें',
    pa: 'ਕਿਰਪਾ ਕਰਕੇ ਪਹਿਲਾਂ ਖੇਤਰ ਚੁਣੋ',
    ur: 'پہلے شعبے منتخب کریں'
  },
  // Index page translations
  'index.processing': {
    en: 'Processing Your Profile',
    hi: 'आपकी प्रोफ़ाइल प्रोसेस की जा रही है',
    pa: 'ਤੁਹਾਡੀ ਪ੍ਰੋਫਾਈਲ ਪ੍ਰੋਸੈਸ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ',
    ur: 'آپ کی پروفائل پروسیس کی جا رہی ہے'
  },
  'index.analyzing': {
    en: 'Our AI is analyzing your preferences and finding the best matches...',
    hi: 'हमारी AI आपकी प्राथमिकताओं का विश्लेषण कर रही है और सबसे अच्छे मैच ढूंढ रही है...',
    pa: 'ਸਾਡੀ AI ਤੁਹਾਡੀਆਂ ਤਰਜੀਹਾਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰ ਰਹੀ ਹੈ ਅਤੇ ਸਭ ਤੋਂ ਵਧੀਆ ਮੈਚ ਲੱਭ ਰਹੀ ਹੈ...',
    ur: 'ہماری AI آپ کی ترجیحات کا تجزیہ کر رہی ہے اور بہترین میچ تلاش کر رہی ہے...'
  },
  'index.teamName': {
    en: 'Team HexaCoders AI Engine',
    hi: 'टीम हेक्साकोडर्स AI इंजन',
    pa: 'ਟੀਮ ਹੈਕਸਾਕੋਡਰਜ਼ AI ਇੰਜਨ',
    ur: 'ٹیم ہیکساکوڈرز AI انجن'
  },
  'index.recommendations': {
    en: 'Your AI-Powered Recommendations',
    hi: 'आपकी AI-संचालित सिफारिशें',
    pa: 'ਤੁਹਾਡੀਆਂ AI-ਸੰਚਾਲਿਤ ਸਿਫਾਰਸ਼ਾਂ',
    ur: 'آپ کی AI سے چلنے والی سفارشات'
  },
  'index.found': {
    en: 'Found',
    hi: 'मिले',
    pa: 'ਮਿਲੇ',
    ur: 'ملے'
  },
  'index.internships': {
    en: 'internships matching your profile',
    hi: 'इंटर्नशिप आपकी प्रोफ़ाइल से मेल खाती हैं',
    pa: 'ਇੰਟਰਨਸ਼ਿਪ ਤੁਹਾਡੀ ਪ੍ਰੋਫਾਈਲ ਨਾਲ ਮੇਲ ਖਾਂਦੀਆਂ ਹਨ',
    ur: 'انٹرنشپ آپ کی پروفائل سے میل کھاتی ہیں'
  },
  'index.stats': {
    en: '250+ Internships Posted • 100+ Companies Hiring • 5,000+ Active Users',
    hi: '250+ इंटर्नशिप पोस्ट की गईं • 100+ कंपनियां भर्ती कर रही हैं • 5,000+ सक्रिय उपयोगकर्ता',
    pa: '250+ ਇੰਟਰਨਸ਼ਿਪ ਪੋਸਟ ਕੀਤੀਆਂ • 100+ ਕੰਪਨੀਆਂ ਭਰਤੀ ਕਰ ਰਹੀਆਂ ਹਨ • 5,000+ ਸਰਗਰਮ ਉਪਭੋਗਤਾ',
    ur: '250+ انٹرنشپ پوسٹ کی گئیں • 100+ کمپنیاں بھرتی کر رہی ہیں • 5,000+ فعال صارفین'
  },
  'index.sortBy': {
    en: 'Sort by:',
    hi: 'इसके अनुसार क्रमबद्ध करें:',
    pa: 'ਇਸ ਅਨੁਸਾਰ ਕ੍ਰਮਬੱਧ ਕਰੋ:',
    ur: 'اس کے مطابق ترتیب دیں:'
  },
  'index.aiScore': {
    en: 'AI Score',
    hi: 'AI स्कोर',
    pa: 'AI ਸਕੋਰ',
    ur: 'AI اسکور'
  },
  'index.stipend': {
    en: 'Stipend',
    hi: 'वेतन',
    pa: 'ਵੇਤਨ',
    ur: 'وظیفہ'
  },
  'index.proximity': {
    en: 'Proximity',
    hi: 'निकटता',
    pa: 'ਨੇੜਤਾ',
    ur: 'قربت'
  },
  'index.noRecommendations': {
    en: 'No recommendations found for this profile.',
    hi: 'इस प्रोफ़ाइल के लिए कोई सिफारिश नहीं मिली।',
    pa: 'ਇਸ ਪ੍ਰੋਫਾਈਲ ਲਈ ਕੋਈ ਸਿਫਾਰਸ਼ ਨਹੀਂ ਮਿਲੀ।',
    ur: 'اس پروفائل کے لیے کوئی سفارش نہیں ملی۔'
  },
  'index.updateProfile': {
    en: 'Update Profile',
    hi: 'प्रोफ़ाइल अपडेट करें',
    pa: 'ਪ੍ਰੋਫਾਈਲ ਅਪਡੇਟ ਕਰੋ',
    ur: 'پروفائل اپ ڈیٹ کریں'
  }
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

export const t = (key: string) => TranslationService.getInstance().translate(key);