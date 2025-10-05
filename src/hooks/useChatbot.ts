import { useState, useCallback, useEffect } from 'react';
import { localAIService, ChatMessage } from '@/lib/localAI';

export const useChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m your AI career assistant. I can help you with internship searches, career advice, and job-related questions. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Listen for external message additions (like navigation confirmations)
  useEffect(() => {
    const handleAddMessage = (e: CustomEvent) => {
      setMessages(prev => [...prev, e.detail]);
    };
    
    window.addEventListener('addChatMessage', handleAddMessage as EventListener);
    return () => window.removeEventListener('addChatMessage', handleAddMessage as EventListener);
  }, []);

  const sendMessage = useCallback(async (content: string, context?: string, language?: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const result = await localAIService.sendMessage(content.trim(), context, language);
      const response = typeof result === 'string' ? result : result.response;
      const suggestions = typeof result === 'object' ? result.suggestions : undefined;
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        suggestions
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error.message.includes('API key') ? 
          'Please add your Gemini API key to the .env file to use AI features. Check the GEMINI_SETUP.md file for instructions.' :
          'Sorry, I encountered an error. Please try again or ask a different question.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const generateInterviewQuestions = useCallback(async (role: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
    setIsLoading(true);
    try {
      const questions = await localAIService.generateInterviewQuestions(role, difficulty);
      
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Here are ${difficulty} level interview questions for ${role}:\n\n${questions}`,
        timestamp: new Date(),
        suggestions: [
          "Generate questions for a different role",
          "How to prepare for behavioral interviews?",
          "What to do after the interview?"
        ]
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I couldn\'t generate interview questions right now.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m your AI career assistant. How can I help you today?',
      timestamp: new Date()
    }]);
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);
  
  return {
    messages,
    isLoading,
    sendMessage,
    generateInterviewQuestions,
    clearMessages,
    addMessage
  };
};