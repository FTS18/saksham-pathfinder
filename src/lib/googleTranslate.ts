// Simple Google Translate integration using the free API
export const translateText = async (text: string, targetLang: string): Promise<string> => {
  try {
    // Using Google Translate's free web interface (for demo purposes)
    // In production, you'd use the official Google Translate API with proper keys
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
    const data = await response.json();
    
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0];
    }
    return text; // Return original if translation fails
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text on error
  }
};

// Cache translations to avoid repeated API calls
const translationCache = new Map<string, string>();

export const getCachedTranslation = async (text: string, targetLang: string): Promise<string> => {
  const cacheKey = `${text}_${targetLang}`;
  
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }
  
  const translation = await translateText(text, targetLang);
  translationCache.set(cacheKey, translation);
  return translation;
};

// Initialize Google Translate widget (alternative approach)
export const initGoogleTranslate = () => {
  // Add Google Translate script
  if (!document.getElementById('google-translate-script')) {
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.head.appendChild(script);
    
    // Initialize the widget
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,hi',
        layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
      }, 'google_translate_element');
    };
  }
};