// Auto-translation service using Google Translate API
const GOOGLE_TRANSLATE_API = 'https://translate.googleapis.com/translate_a/single';

interface TranslationCache {
  [key: string]: string;
}

class AutoTranslateService {
  private cache: TranslationCache = {};
  private currentLanguage: string = 'en';

  async translateText(text: string, targetLang: string): Promise<string> {
    if (!text || targetLang === 'en') return text;
    
    const cacheKey = `${text}_${targetLang}`;
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    try {
      const url = `${GOOGLE_TRANSLATE_API}?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        const translation = data[0][0][0];
        this.cache[cacheKey] = translation;
        return translation;
      }
    } catch (error) {
      console.warn('Translation failed:', error);
    }
    
    return text;
  }

  async translateElement(element: HTMLElement, targetLang: string) {
    if (targetLang === 'en') return;

    const textNodes = this.getTextNodes(element);
    
    for (const node of textNodes) {
      const originalText = node.textContent?.trim();
      if (originalText && originalText.length > 1) {
        try {
          const translated = await this.translateText(originalText, targetLang);
          if (translated !== originalText) {
            node.textContent = translated;
          }
        } catch (error) {
          console.warn('Failed to translate text node:', error);
        }
      }
    }
  }

  private getTextNodes(element: HTMLElement): Text[] {
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip script, style, and other non-visible elements
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          const tagName = parent.tagName.toLowerCase();
          if (['script', 'style', 'noscript', 'code', 'pre'].includes(tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Skip empty or whitespace-only text
          const text = node.textContent?.trim();
          if (!text || text.length < 2) {
            return NodeFilter.FILTER_REJECT;
          }
          
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node as Text);
    }
    
    return textNodes;
  }

  async translatePage(targetLang: string) {
    if (targetLang === 'en') {
      // Reload page to restore original text
      window.location.reload();
      return;
    }

    this.currentLanguage = targetLang;
    
    // Translate main content areas
    const contentSelectors = [
      'main',
      '[role="main"]',
      '.container',
      'body'
    ];

    for (const selector of contentSelectors) {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        await this.translateElement(element, targetLang);
        break; // Only translate the first found container
      }
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  setCurrentLanguage(lang: string) {
    this.currentLanguage = lang;
  }
}

export const autoTranslateService = new AutoTranslateService();