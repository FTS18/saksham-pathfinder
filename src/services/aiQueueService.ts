// FIX #15: All Gemini requests now go through /api/ai-proxy.
// The API key is stored server-side as GEMINI_API_KEY env var.
// VITE_GEMINI_API_KEY is no longer needed on the client side.

import { apiClient } from "@/lib/apiClient";

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
  private readonly AI_PROXY_URL = "/api/ai-proxy";

  private getCacheKey(prompt: string): string {
    return btoa(encodeURIComponent(prompt)).slice(0, 50);
  }

  private getFromCache(prompt: string): string | null {
    const key = this.getCacheKey(prompt);
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.response;
    }
    if (cached) this.cache.delete(key);
    return null;
  }

  private setCache(prompt: string, response: string): void {
    const key = this.getCacheKey(prompt);
    this.cache.set(key, { response, timestamp: Date.now() });
    // Limit cache size to prevent memory leak
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
  }

  async generateResponse(prompt: string): Promise<string> {
    const cached = this.getFromCache(prompt);
    if (cached) return cached;

    return new Promise((resolve, reject) => {
      this.queue.push({ prompt, resolve, reject, retries: 0 });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

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
          const delay = this.RETRY_DELAY * Math.pow(2, item.retries);
          await new Promise((r) => setTimeout(r, delay));
          item.retries++;
          this.queue.unshift(item);
        } else {
          item.reject(error);
        }
      }

      // Throttle: 1 request per second to avoid hammering the backend
      await new Promise((r) => setTimeout(r, 1000));
    }

    this.processing = false;
  }

  private shouldRetry(error: any): boolean {
    const msg = error?.message?.toLowerCase() || "";
    return (
      msg.includes("rate limit") ||
      msg.includes("quota") ||
      msg.includes("429") ||
      msg.includes("503") ||
      msg.includes("502")
    );
  }

  private async makeRequest(prompt: string): Promise<string> {
    // Force all requests through the secure proxy (no VITE_GEMINI_API_KEY fallback)
    try {
      const response = await fetch(this.AI_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt })
      });
      if (!response.ok) throw new Error("AI Proxy Error");
      const data = await response.json();
      return data.response || data.text || "";
    } catch (e) {
      console.error("AI Queue Error", e);
      throw e;
    }
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

