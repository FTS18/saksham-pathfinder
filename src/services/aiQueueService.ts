import { GoogleGenerativeAI } from '@google/generative-ai';

interface QueueItem {
  prompt: string;
  resolve: (value: string) => void;
  reject: (error: any) => void;
  retries: number;
}

class AIQueueService {
  private queue: QueueItem[] = [];
  private processing = false;
  private cache = new Map<string, { response: string; timestamp: number }>();
  private readonly CACHE_DURATION = 1000 * 60 * 30; // 30 minutes
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 2000; // 2 seconds
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  private getCacheKey(prompt: string): string {
    return btoa(prompt).slice(0, 50);
  }

  private getFromCache(prompt: string): string | null {
    const key = this.getCacheKey(prompt);
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.response;
    }
    
    if (cached) {
      this.cache.delete(key);
    }
    
    return null;
  }

  private setCache(prompt: string, response: string): void {
    const key = this.getCacheKey(prompt);
    this.cache.set(key, { response, timestamp: Date.now() });
    
    // Limit cache size
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  async generateResponse(prompt: string): Promise<string> {
    // Check cache first
    const cached = this.getFromCache(prompt);
    if (cached) {
      return cached;
    }

    // Add to queue
    return new Promise((resolve, reject) => {
      this.queue.push({ prompt, resolve, reject, retries: 0 });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) break;

      try {
        const response = await this.makeRequest(item.prompt);
        this.setCache(item.prompt, response);
        item.resolve(response);
      } catch (error: any) {
        if (item.retries < this.MAX_RETRIES && this.shouldRetry(error)) {
          // Exponential backoff
          const delay = this.RETRY_DELAY * Math.pow(2, item.retries);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          item.retries++;
          this.queue.unshift(item); // Add back to front of queue
        } else {
          item.reject(error);
        }
      }

      // Rate limiting: wait between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.processing = false;
  }

  private shouldRetry(error: any): boolean {
    const errorMessage = error?.message?.toLowerCase() || '';
    return (
      errorMessage.includes('rate limit') ||
      errorMessage.includes('quota') ||
      errorMessage.includes('429') ||
      errorMessage.includes('503')
    );
  }

  private async makeRequest(prompt: string): Promise<string> {
    if (!this.genAI) {
      throw new Error('Gemini API not configured');
    }

    const model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  }

  clearCache(): void {
    this.cache.clear();
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  isProcessing(): boolean {
    return this.processing;
  }
}

export default new AIQueueService();
