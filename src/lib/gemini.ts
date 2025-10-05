// This file is deprecated - AI functionality moved to localAI.ts
// Keeping for backward compatibility, but all functionality is now local

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class GeminiService {
  async sendMessage(message: string, context?: string, language?: string): Promise<string> {
    throw new Error('Gemini service is deprecated. Please use localAI service instead.');
  }

  async generateInterviewQuestions(role: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<string> {
    throw new Error('Gemini service is deprecated. Please use localAI service instead.');
  }
}

export const geminiService = new GeminiService();

// Redirect to new service
export const quickActions = [
  { id: 'search', label: '🔍 Find Internships', prompt: 'How can I search for internships on this platform?' },
  { id: 'resume', label: '📄 Resume Tips', prompt: 'Give me tips to improve my resume for internship applications' },
  { id: 'interview', label: '💼 Interview Prep', prompt: 'Help me prepare for internship interviews' },
  { id: 'skills', label: '🎯 Skill Gap', prompt: 'How can I identify and fill skill gaps for my target role?' },
  { id: 'profile', label: '👤 Profile Setup', prompt: 'Guide me through setting up my profile on this platform' },
  { id: 'filters', label: '⚙️ Advanced Filters', prompt: 'Explain how to use advanced filters to find relevant internships' }
];