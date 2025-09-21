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

export const initGoogleTranslate = () => {
  const existingScript = document.getElementById('google-translate-script');
  if (existingScript) existingScript.remove();

  const script = document.createElement('script');
  script.id = 'google-translate-script';
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  
  (window as any).googleTranslateElementInit = () => {
    if ((window as any).google?.translate) {
      new (window as any).google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,hi,pa,ur,bn,ta,te,ml,kn,gu,mr',
        layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
        multilanguagePage: true
      }, 'google_translate_element');
    }
  };
  
  document.head.appendChild(script);
};

export const translatePage = (targetLang: string) => {
  const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
  if (selectElement) {
    selectElement.value = targetLang;
    selectElement.dispatchEvent(new Event('change', { bubbles: true }));
  }
};