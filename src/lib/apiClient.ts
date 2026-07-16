import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

interface ApiOptions extends RequestInit {
  data?: any;
}

/**
 * FIX #11: Unified API Client Layer
 * Handles routing requests to either Firebase Cloud Functions or Netlify Functions,
 * manages auth tokens automatically, and standardizes error handling.
 */
export const apiClient = {
  /**
   * Get Firebase Auth Token
   */
  async getToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  },

  /**
   * Core request handler
   */
  async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    // 1. Determine backend URL
    // All serverless API endpoints (/netlify/ or /recruiter-api/ or /api/) route to /api on Vercel
    const isServerless = endpoint.startsWith("/netlify/") || endpoint.startsWith("/recruiter-api") || endpoint.startsWith("/api/");
    const baseUrl = isServerless ? "/api" : "https://us-central1-saksham-ai-81c3a.cloudfunctions.net";
    
    // Format the URL properly
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    // Replace "/netlify" with empty string so "/netlify/admin-api" becomes "/admin-api" (accessible via "/api/admin-api")
    const cleanPath = path.replace("/netlify", "");
    const url = isServerless ? `${baseUrl}${cleanPath}` : `${baseUrl}${path}`;

    // 2. Prepare headers with Auth
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    const token = await this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // 3. Prepare config
    const config: RequestInit = {
      ...options,
      headers,
    };

    if (options.data && (options.method === "POST" || options.method === "PUT" || options.method === "PATCH")) {
      config.body = JSON.stringify(options.data);
    }

    try {
      console.log(`[API Client] ${options.method || "GET"} ${url}`, options.data ? { body: options.data } : "");
      
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || `API Error: ${response.status}`);
      }

      return data as T;
    } catch (error) {
      console.error(`[API Client] Request failed:`, error);
      throw error;
    }
  },

  /**
   * Convenience methods
   */
  async get<T>(endpoint: string, headers?: HeadersInit): Promise<T> {
    return apiClient.request<T>(endpoint, { method: "GET", headers });
  },

  async post<T>(endpoint: string, data: any, headers?: HeadersInit): Promise<T> {
    return apiClient.request<T>(endpoint, { method: "POST", data, headers });
  },

  async put<T>(endpoint: string, data: any, headers?: HeadersInit): Promise<T> {
    return apiClient.request<T>(endpoint, { method: "PUT", data, headers });
  },

  async delete<T>(endpoint: string, headers?: HeadersInit): Promise<T> {
    return apiClient.request<T>(endpoint, { method: "DELETE", headers });
  }
};
