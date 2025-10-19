export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

class GeminiAIService {
  private apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  private getCareerPrompt(message: string): string {
    return `You are Saksham AI, the intelligent career assistant for the Saksham AI platform - India's leading AI-powered internship discovery and career guidance platform.

**ABOUT SAKSHAM AI PLATFORM:**
- **1000+ Live Internships** from top companies (Google, Microsoft, Amazon, startups)
- **AI-Powered Matching** with 50% skills weighting and company tier bonuses
- **Smart Filters** for location, salary, company size, work mode, sectors
- **Profile System** with 5-step onboarding and skill-sector mapping
- **Wishlist & Compare** features to save and analyze internships
- **Multi-language Support** (English/Hindi) with Google Translate
- **PWA App** installable on mobile with offline features
- **Government Integration** including PM Internship Scheme eligibility

**NAVIGATION COMMANDS I UNDERSTAND:**
- "Show [company] internships" → Takes you to company page
- "Internships in [city]" → Takes you to city-specific listings
- "[skill] internships" → Shows skill-based opportunities
- "[sector] internships" → Filters by industry sector
- "[title] jobs" → Shows role-specific listings

**KEY FEATURES YOU CAN HELP WITH:**
- **Search Strategy**: Using keywords, filters, AI recommendations
- **Profile Optimization**: Completing sections for better matches [Visit Profile](/profile)
- **Resume Building**: Tips for internship applications
- **Interview Prep**: Role-specific questions and preparation
- **Skill Development**: Gap analysis and learning resources
- **Comparison Tool**: Evaluating multiple internship offers
- **Application Tracking**: Managing application status [View Applications](/applications)
- **Wishlist Management**: Save and organize favorites [My Wishlist](/wishlist)

**PLATFORM NAVIGATION:**
- **Dashboard**: Personalized recommendations and saved internships [Home](/)
- **Search & Filters**: Advanced filtering by location, salary, skills, sectors [Search](/)
- **Wishlist**: Save favorite internships for later [Wishlist](/wishlist)
- **Profile**: Complete setup for AI matching (education, skills, preferences) [Profile](/profile)
- **Applications**: Track application status and deadlines [Applications](/applications)
- **News & Events**: Latest industry updates [News](/news-events)
- **Tutorials**: Learning resources and guides [Tutorials](/tutorials)
- **Referrals**: Earn points by referring friends [Refer](/referrals)

**AI SCORING SYSTEM:**
- Skills Match: 50% weight (semantic matching)
- Company Tier: Tier 1 (12% bonus), Tier 2 (8%), Tier 3 (5%)
- Location Match: 15% weight
- Sector Alignment: 10% weight
- Stipend Range: 15% weight
- Real-time compatibility scores

**SPECIAL FEATURES:**
- **Smart Suggestions**: Type partial queries for auto-complete
- **Voice Commands**: "Show me Google internships" or "Find internships in Mumbai"
- **Quick Actions**: Use the sparkle button (✨) to toggle the action menu
- **Theme Customization**: 5 color themes + light/dark mode
- **Mobile PWA**: Install as an app on your phone
- **Offline Mode**: Browse saved internships without internet

User question: ${message}

Provide helpful, specific advice about using the Saksham platform, finding internships, or career guidance. Reference platform features when relevant. Use bullet points and be practical.
When you mention a feature of the Saksham platform, include it as a markdown link like [Feature Name](/url).

Response:`;
  }

  private async generateSuggestions(message: string): Promise<string[]> {
    try {
      const prompt = `Based on the user's message: "${message}", generate 3 relevant follow-up questions that are within the scope of an AI career assistant for an internship platform. The questions should be short and concise, and formatted as a numbered list.`;
      const response = await this.generateGeminiContent(prompt);
      // The response will be a string with the questions, I need to parse them.
      // I will assume the questions are separated by newlines and have a number at the beginning.
      return response.split('\n').map(q => q.replace(/^\d+\.\s*/, '')).filter(q => q.trim() !== '');
    } catch (error) {
      console.error('Error generating suggestions with Gemini:', error);
      return []; // Return empty array on error
    }
  }

  async generateAutosuggestions(query: string): Promise<string[]> {
    if (!query.trim()) {
      return [];
    }
    
    // Try Gemini first if API key is available
    if (this.apiKey) {
      try {
        const prompt = `Based on the user's partial query: "${query}", generate 3 short, relevant questions that an AI career assistant for an internship platform could answer. The questions should be formatted as a numbered list.`;
        const response = await this.generateGeminiContent(prompt);
        return response.split('\n').map(q => q.replace(/^\d+\.\s*/, '')).filter(q => q.trim() !== '');
      } catch (error) {
        console.warn('Error generating autosuggestions with Gemini, using fallback:', error);
      }
    }
    
    // Use local fallback suggestions
    return this.getLocalAutosuggestions(query);
  }

  private fallbackResponses = {
    search: "🔍 **Finding the Perfect Internship:**\n\n**Smart Search Commands:**\n• Try: 'Show Google internships' → Direct company search\n• Try: 'Internships in Mumbai' → Location-based results\n• Try: 'Python developer jobs' → Skill + role matching\n• Try: 'Technology sector internships' → Industry filtering\n\n**Search Strategy:**\n• Use specific keywords (role, company, skills)\n• Apply location filters for your preferred cities\n• Set salary expectations using stipend filters\n• Browse by sectors: Technology, Healthcare, Finance, etc.\n• Look for 'AI Recommended' badges for personalized matches\n\n**Pro Tips:**\n• Save interesting internships to your [Wishlist](/wishlist)\n• Complete your [Profile](/profile) for better AI matching\n• Use the ✨ button to toggle quick actions menu\n• Check both 'Remote' and your city for more options\n• Apply early - good internships fill up fast!\n\n**Navigation Shortcuts:**\n• [Browse All Internships](/) - Main dashboard\n• [My Applications](/applications) - Track your progress\n• [Compare Tool](/compare) - Side-by-side analysis\n\nWhat specific type of internship are you looking for?",
    
    resume: "📄 **Resume Optimization for Internships:**\n\n**Structure (Keep it 1-2 pages):**\n• Contact info + LinkedIn/GitHub links\n• Professional summary (2-3 lines)\n• Education (GPA if 3.5+, relevant coursework)\n• Experience (internships, projects, part-time jobs)\n• Skills (technical + soft skills)\n• Achievements & certifications\n\n**Content Tips:**\n• Use action verbs: 'Developed', 'Managed', 'Created'\n• Quantify results: 'Increased efficiency by 30%'\n• Tailor to each application\n• Include relevant projects and coursework\n• Highlight programming languages and tools\n\n**Common Mistakes to Avoid:**\n• Generic objectives\n• Spelling/grammar errors\n• Irrelevant information\n• Poor formatting\n\nNeed help with a specific section?",
    
    interview: "💼 **Interview Preparation Masterclass:**\n\n**Research Phase:**\n• Study company's mission, values, recent news\n• Understand the role requirements thoroughly\n• Review your resume and prepare examples\n• Research the interviewer on LinkedIn\n\n**Common Questions & STAR Method:**\n• 'Tell me about yourself' - 2-minute elevator pitch\n• 'Why this company/role?' - Show genuine interest\n• 'Describe a challenge you overcame' - Use STAR format\n• 'Where do you see yourself in 5 years?' - Show ambition\n\n**Technical Prep (if applicable):**\n• Practice coding problems on LeetCode/HackerRank\n• Review fundamental concepts\n• Prepare to explain your projects\n• Practice whiteboard coding\n\n**Questions to Ask Them:**\n• 'What does a typical day look like?'\n• 'What are the biggest challenges facing the team?'\n• 'How do you measure success in this role?'\n• 'What growth opportunities are available?'\n\nWant specific questions for your field?",
    
    skills: "🎯 **Skill Development Strategy:**\n\n**Identify Your Gaps:**\n• Compare job requirements with your current skills\n• Use our platform's skill matching feature\n• Ask for feedback from mentors and peers\n• Take online skill assessments\n\n**High-Demand Skills by Field:**\n• **Tech**: Python, JavaScript, React, SQL, Git\n• **Data**: Excel, SQL, Tableau, Python, Statistics\n• **Design**: Figma, Adobe Creative Suite, Prototyping\n• **Marketing**: Google Analytics, Social Media, SEO\n• **Business**: Excel, PowerPoint, Project Management\n\n**Learning Resources:**\n• **Free**: YouTube, freeCodeCamp, Coursera audits\n• **Paid**: Udemy, Pluralsight, LinkedIn Learning\n• **Practice**: GitHub projects, Kaggle competitions\n• **Certifications**: Google, Microsoft, AWS, HubSpot\n\n**Development Plan:**\n• Set SMART goals (Specific, Measurable, Achievable)\n• Dedicate 1-2 hours daily to learning\n• Build projects to apply new skills\n• Update your profile as you progress\n\nWhat specific skills are you looking to develop?",
    
    profile: "👤 **Profile Optimization Guide:**\n\n**Complete These Sections (Aim for 100%):**\n• **Personal Info**: Professional photo, clear bio\n• **Contact**: Email, phone, LinkedIn, GitHub\n• **Education**: Degree, graduation year, GPA (if 3.5+)\n• **Experience**: Internships, jobs, volunteer work\n• **Skills**: Technical and soft skills\n• **Projects**: Portfolio links and descriptions\n• **Preferences**: Location, salary, work mode\n\n**Profile Writing Tips:**\n• Use keywords from target job descriptions\n• Write a compelling 2-3 line summary\n• List skills in order of proficiency\n• Include relevant coursework and projects\n• Add links to your work (GitHub, portfolio)\n\n**Preferences Settings:**\n• Set realistic salary expectations\n• Choose multiple preferred locations\n• Select company sizes you're interested in\n• Pick your top 3-5 industry sectors\n\n**AI Matching Benefits:**\n• Complete profiles get 3x more relevant recommendations\n• Skills matching uses semantic analysis (50% weight)\n• Company tier bonuses: Tier 1 (+12%), Tier 2 (+8%), Tier 3 (+5%)\n• Real-time compatibility scoring\n\n**Quick Actions:**\n• [Complete Your Profile](/profile) - Start optimizing now\n• [View Recommendations](/) - See your matches\n• [Check Applications](/applications) - Track progress\n\nNeed help with any specific section?",
    
    filters: "⚙️ **Master Advanced Filtering:**\n\n**Location Filters:**\n• Select specific cities or states\n• Enable 'Remote' for work-from-home options\n• Use 'Hybrid' for flexible arrangements\n• Consider nearby cities for more opportunities\n\n**Compensation Filters:**\n• Set minimum stipend expectations\n• Consider total compensation (perks, learning)\n• Factor in cost of living by location\n• Don't filter too strictly initially\n\n**Company & Role Filters:**\n• **Company Size**: Startup (1-50), Mid-size (51-500), Large (500+)\n• **Work Mode**: On-site, Remote, Hybrid\n• **Duration**: 3, 6, or 12-month internships\n• **Start Date**: Immediate or future opportunities\n\n**Smart Filtering Strategy:**\n• Start broad, then narrow down\n• Use 2-3 filters maximum initially\n• Save successful filter combinations\n• Check results regularly as new internships are added\n\n**Pro Tips:**\n• Combine location + sector for targeted results\n• Use skill filters to match your expertise\n• Enable notifications for new matches\n• Review 'Featured' internships first\n\nTry different combinations to find hidden gems!",
    
    compare: "⚖️ **Internship Comparison Strategy:**\n\n**How to Use Compare Feature:**\n• Click the compare button (⚖️) on internship cards\n• Add up to 3 internships for side-by-side analysis\n• View detailed comparison in the modal\n• Get AI-powered recommendations\n\n**Key Factors to Compare:**\n\n**💰 Compensation:**\n• Base stipend amount\n• Additional perks and benefits\n• Potential for full-time offer\n• Cost of living in that location\n\n**📍 Location & Work:**\n• Commute time and costs\n• Remote/hybrid flexibility\n• Office culture and environment\n• Networking opportunities\n\n**🎯 Learning & Growth:**\n• Skill development opportunities\n• Mentorship and guidance\n• Project complexity and impact\n• Training programs available\n\n**🏢 Company Factors:**\n• Company reputation and stability\n• Team size and structure\n• Career advancement paths\n• Company culture fit\n\n**Decision Framework:**\n1. **Must-haves**: Non-negotiable requirements\n2. **Nice-to-haves**: Preferred but flexible\n3. **Long-term impact**: Career growth potential\n4. **Personal fit**: Culture and values alignment\n\n**Pro Tip**: Create a scoring system (1-10) for each factor and calculate weighted averages!\n\nNeed help with any specific aspects?",
    
    general: "Hi there! I'm Saksham AI, your personal career assistant! 👋\n\nI'm here to help you navigate the exciting world of internships and career growth. Whether you're just starting out or looking to level up, I've got you covered!\n\n**I can help you with:**\n• Finding the perfect internship match\n• Optimizing your [Profile](/profile) and resume\n• Preparing for interviews like a pro\n• Comparing different opportunities\n• Building in-demand skills\n• Navigating to specific internships\n\n**Smart Commands I Understand:**\n• 'Show Google internships' → Company-specific search\n• 'Internships in Delhi' → Location-based results\n• 'Python developer jobs' → Skill + role matching\n• 'Technology sector internships' → Industry filtering\n\n**Quick Navigation:**\n• [Browse Internships](/) - Main dashboard with AI recommendations\n• [My Wishlist](/wishlist) - Saved opportunities\n• [Applications](/applications) - Track your progress\n• [Profile Setup](/profile) - Optimize for better matches\n\n**Pro Tips:**\n• Use the ✨ button to toggle quick actions\n• Complete your profile for 3x better recommendations\n• Our platform has 1000+ live internships with AI-powered matching\n• Try voice commands for faster navigation\n\nWhat's on your mind today? Ask me anything about your career journey! 🚀"
  };

  private detectIntent(message: string): keyof typeof this.fallbackResponses {
    const lowerMessage = message.toLowerCase();
    
    // Check for navigation patterns first
    if (lowerMessage.includes('show') && (lowerMessage.includes('internship') || lowerMessage.includes('job'))) return 'search';
    if (lowerMessage.includes('internships in') || lowerMessage.includes('jobs in')) return 'search';
    if (lowerMessage.includes('internships at') || lowerMessage.includes('jobs at')) return 'search';
    
    // Standard intent detection
    if (lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('internship')) return 'search';
    if (lowerMessage.includes('resume') || lowerMessage.includes('cv') || lowerMessage.includes('portfolio')) return 'resume';
    if (lowerMessage.includes('interview') || lowerMessage.includes('preparation') || lowerMessage.includes('questions')) return 'interview';
    if (lowerMessage.includes('skill') || lowerMessage.includes('gap') || lowerMessage.includes('learn') || lowerMessage.includes('develop')) return 'skills';
    if (lowerMessage.includes('profile') || lowerMessage.includes('setup') || lowerMessage.includes('complete')) return 'profile';
    if (lowerMessage.includes('filter') || lowerMessage.includes('advanced')) return 'filters';
    if (lowerMessage.includes('compare') || lowerMessage.includes('comparison') || lowerMessage.includes('choose') || lowerMessage.includes('decide')) return 'compare';
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.includes('help')) return 'general';
    
    return 'general';
  }

  async sendMessage(message: string, context?: string, language?: string): Promise<any> {
    // Try Gemini first if API key is available
    if (this.apiKey) {
      try {
        const prompt = this.getCareerPrompt(message);
        const response = await this.generateGeminiContent(prompt);
        
        const suggestions = await this.generateSuggestions(message);
        return {
          response,
          suggestions,
        };
      } catch (error) {
        console.warn(`Gemini API call failed, using local fallback:`, error);
        // Fall through to local response
      }
    }
    
    // Use local fallback
    const intent = this.detectIntent(message);
    const localSuggestions = this.getLocalSuggestions(intent);
    return {
      response: this.fallbackResponses[intent],
      suggestions: localSuggestions,
    };
  }

  async generateInterviewQuestions(role: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<string> {
    // Try Gemini first if API key is available
    if (this.apiKey) {
      try {
        const prompt = `Generate 5 ${difficulty} level interview questions for a ${role} internship position. Include both technical and behavioral questions. Format as a numbered list with brief tips.`;
        return await this.generateGeminiContent(prompt);
      } catch (error) {
        console.warn('Error generating questions with Gemini, using fallback:', error);
      }
    }
    
    // Use local fallback
    return this.getFallbackQuestions(role, difficulty);
  }
  
  async generateInternshipComparison(prompt: string): Promise<string> {
    // Try Gemini first if API key is available
    if (this.apiKey) {
      try {
        return await this.generateGeminiContent(prompt);
      } catch (error) {
        console.warn('Error generating comparison with Gemini, using fallback:', error);
      }
    }
    
    // Use local fallback for comparison
    return this.getFallbackComparison();
  }
  
  private getFallbackComparison(): string {
    return `**❌ AI Analysis Unavailable**\n\nUnable to generate intelligent comparison at this time.\n\n**Quick Summary:**\n• Higher AI scores indicate better profile matches\n• Focus on the top-ranked internship\n• Consider skills alignment and location preferences\n\n*Please try again in a moment.*`;
  }

  private async generateGeminiContent(prompt: string): Promise<string> {
    // Use AI Queue Service for rate limiting and caching
    const AIQueueService = (await import('@/services/aiQueueService')).default;
    return await AIQueueService.generateResponse(prompt);
  }
  
  private async generateGeminiContentDirect(prompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
    
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_ONLY_HIGH'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_ONLY_HIGH'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_ONLY_HIGH'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_ONLY_HIGH'
        }
      ]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      console.error('Gemini API error:', errorData);
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error('Gemini API response:', data);
      throw new Error('No candidates in Gemini API response');
    }
    
    const candidate = data.candidates[0];
    
    // Handle blocked or filtered responses
    if (candidate.finishReason === 'SAFETY' || candidate.finishReason === 'RECITATION') {
      console.error('Gemini API response blocked:', candidate);
      throw new Error('Response blocked by safety filters');
    }
    
    if (!candidate.content) {
      console.error('No content in candidate:', candidate);
      throw new Error('No content in Gemini API response');
    }
    
    if (!candidate.content.parts || candidate.content.parts.length === 0) {
      console.error('No parts in content:', candidate.content);
      throw new Error('No parts in Gemini API response content');
    }
    
    let text = candidate.content.parts[0].text;
    
    if (!text) {
      console.error('No text in first part:', candidate.content.parts[0]);
      throw new Error('No text in Gemini API response part');
    }
    
    // Handle MAX_TOKENS finish reason
    if (candidate.finishReason === 'MAX_TOKENS') {
      text += '\n\n*[Response truncated due to length limit]*';
    }
    
    return text;
  }
  
  getQueueStatus(): { size: number; processing: boolean } {
    const AIQueueService = require('@/services/aiQueueService').default;
    return {
      size: AIQueueService.getQueueSize(),
      processing: AIQueueService.isProcessing()
    };
  }
  
  private getLocalSuggestions(intent: keyof typeof this.fallbackResponses): string[] {
    const suggestionMap = {
      search: ['How to filter by location?', 'Show me remote internships', 'Best companies for internships'],
      resume: ['How to write a cover letter?', 'Resume format for students', 'Common resume mistakes'],
      interview: ['How to prepare for technical interviews?', 'What to wear for interviews?', 'Questions to ask interviewer'],
      skills: ['Most in-demand skills 2024', 'How to learn programming?', 'Free online courses'],
      profile: ['How to add projects?', 'Profile completion tips', 'Privacy settings'],
      filters: ['Location-based search', 'Salary range filters', 'Company size preferences'],
      compare: ['How to save internships?', 'Comparison criteria', 'Decision making tips'],
      general: ['Platform features', 'Getting started guide', 'Success stories']
    };
    return suggestionMap[intent] || [];
  }
  
  private getLocalAutosuggestions(query: string): string[] {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('intern')) return ['How to find internships?', 'Best internship websites', 'Internship application tips'];
    if (lowerQuery.includes('resume')) return ['Resume writing tips', 'Resume templates', 'Resume review checklist'];
    if (lowerQuery.includes('interview')) return ['Interview preparation', 'Common interview questions', 'Interview follow-up'];
    if (lowerQuery.includes('skill')) return ['Skill development', 'In-demand skills', 'Online learning platforms'];
    return ['Career guidance', 'Job search tips', 'Professional development'];
  }
  
  private getFallbackQuestions(role: string, difficulty: string): string {
    return `${difficulty.toUpperCase()} ${role} Interview Questions:\n\n1. Tell me about yourself and your background\n2. Why are you interested in this ${role} internship?\n3. What are your greatest strengths and weaknesses?\n4. Describe a challenging project you worked on\n5. Where do you see yourself in the next few years?\n\nTip: Use the STAR method (Situation, Task, Action, Result) for behavioral questions!`;
  }
}

export const localAIService = new GeminiAIService();

export const quickActions = [
  { id: 'search', label: '🔍 Find Internships', prompt: 'How can I search for internships on this platform?' },
  { id: 'resume', label: '📄 Resume Tips', prompt: 'Give me tips to improve my resume for internship applications' },
  { id: 'interview', label: '💼 Interview Prep', prompt: 'Help me prepare for internship interviews' },
  { id: 'skills', label: '🎯 Skill Gap', prompt: 'How can I identify and fill skill gaps for my target role?' },
  { id: 'profile', label: '👤 Profile Setup', action: (navigate: any) => navigate('/profile') },
  { id: 'wishlist', label: '❤️ My Wishlist', action: (navigate: any) => navigate('/wishlist') },
  { id: 'applications', label: '📋 Applications', action: (navigate: any) => navigate('/applications') },
  { id: 'compare', label: '⚖️ Compare Internships', prompt: 'How do I compare different internship opportunities?' }
];
