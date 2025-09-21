import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your environment variables.');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class GeminiService {
  private model = genAI?.getGenerativeModel({ model: 'gemini-1.5-flash' });

  private getSystemPrompt(language?: string): string {
    const basePrompt = `You are Saksham AI, an intelligent career assistant for the Saksham Pathfinder platform. 

Website Features:
- Live Internship Search: Browse 1000+ internships with advanced filters
- Smart Filters: Filter by salary, location, company size, work mode, sectors
- Wishlist: Save favorite internships for later
- Profile Management: Create detailed profiles with skills and preferences
- Dashboard: Personalized internship recommendations
- Resume Parser: Upload and analyze resumes
- Skill Gap Analysis: Identify missing skills for target roles

You can help users with:
1. Website navigation and feature explanations
2. Internship search strategies
3. Career guidance and advice
4. Interview preparation and practice questions
5. Resume optimization tips
6. Skill development recommendations

Always be helpful, concise, and encouraging. Provide actionable advice.`;

    if (language && language !== 'en') {
      return `${basePrompt}\n\nIMPORTANT: Respond in the user's preferred language. If they write in Hindi, respond in Hindi. If they write in any Indian language, respond in that language. Be culturally sensitive and use appropriate regional context.`;
    }
    
    return basePrompt;
  }

  async sendMessage(message: string, context?: string, language?: string): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini API not configured. Please add your API key.');
    }

    try {
      const systemPrompt = this.getSystemPrompt(language);
      const fullPrompt = context 
        ? `${systemPrompt}\n\nContext: ${context}\n\nUser: ${message}`
        : `${systemPrompt}\n\nUser: ${message}`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Failed to get response from AI assistant');
    }
  }

  async generateInterviewQuestions(role: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini API not configured');
    }

    const prompt = `Generate 5 ${difficulty} level interview questions for a ${role} internship position. Include both technical and behavioral questions. Format as numbered list with brief answer hints.`;
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating interview questions:', error);
      throw new Error('Failed to generate interview questions');
    }
  }


}

export const geminiService = new GeminiService();

export const quickActions = [
  { id: 'search', label: '🔍 Find Internships', prompt: 'How can I search for internships on this platform?' },
  { id: 'resume', label: '📄 Resume Tips', prompt: 'Give me tips to improve my resume for internship applications' },
  { id: 'interview', label: '💼 Interview Prep', prompt: 'Help me prepare for internship interviews' },
  { id: 'skills', label: '🎯 Skill Gap', prompt: 'How can I identify and fill skill gaps for my target role?' },
  { id: 'profile', label: '👤 Profile Setup', prompt: 'Guide me through setting up my profile on this platform' },
  { id: 'filters', label: '⚙️ Advanced Filters', prompt: 'Explain how to use advanced filters to find relevant internships' }
];