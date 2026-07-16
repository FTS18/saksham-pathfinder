import { FALLBACK_RESPONSES } from "@/data/aiFallbackResponses";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

class GeminiAIService {

  private getCareerPrompt(message: string): string {
    return `You are UpSkillers, the intelligent career assistant for the UpSkillers platform - India's leading AI-powered internship discovery and career guidance platform.

**ABOUT UpSkillers PLATFORM:**
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
- **Quick Actions**: Use the sparkle button () to toggle the action menu
- **Theme Customization**: 5 color themes + light/dark mode
- **Mobile PWA**: Install as an app on your phone
- **Offline Mode**: Browse saved internships without internet

User question: ${message}

Provide helpful, specific advice about using the UpSkillers platform, finding internships, or career guidance. Reference platform features when relevant. Use bullet points and be practical.
When you mention a feature of the UpSkillers platform, include it as a markdown link like [Feature Name](/url).

Response:`;
  }

  private async generateSuggestions(message: string): Promise<string[]> {
    try {
      const prompt = `Based on the user's message: "${message}", generate 3 relevant follow-up questions that are within the scope of an AI career assistant for an internship platform. The questions should be short and concise, and formatted as a numbered list.`;
      const response = await this.generateGeminiContent(prompt);
      // The response will be a string with the questions, I need to parse them.
      // I will assume the questions are separated by newlines and have a number at the beginning.
      return response
        .split("\n")
        .map((q) => q.replace(/^\d+\.\s*/, ""))
        .filter((q) => q.trim() !== "");
    } catch (error) {
      console.error("Error generating suggestions with Gemini:", error);
      return []; // Return empty array on error
    }
  }

  async generateAutosuggestions(query: string): Promise<string[]> {
    if (!query.trim()) {
      return [];
    }

    // Try Gemini first
    try {
      const prompt = `Based on the user's partial query: "${query}", generate 3 short, relevant questions that an AI career assistant for an internship platform could answer. The questions should be formatted as a numbered list.`;
      const response = await this.generateGeminiContent(prompt);
      return response
        .split("\n")
        .map((q) => q.replace(/^\d+\.\s*/, ""))
        .filter((q) => q.trim() !== "");
    } catch (error) {
      console.warn(
        "Error generating autosuggestions with Gemini, using fallback:",
        error
      );
      return this.getLocalAutosuggestions(query);
    }
  }

  private fallbackResponses = FALLBACK_RESPONSES;

  private detectIntent(message: string): keyof typeof FALLBACK_RESPONSES {
    const lowerMessage = message.toLowerCase();

    // Check for navigation patterns first
    if (
      lowerMessage.includes("show") &&
      (lowerMessage.includes("internship") || lowerMessage.includes("job"))
    )
      return "search";
    if (
      lowerMessage.includes("internships in") ||
      lowerMessage.includes("jobs in")
    )
      return "search";
    if (
      lowerMessage.includes("internships at") ||
      lowerMessage.includes("jobs at")
    )
      return "search";

    // Standard intent detection
    if (
      lowerMessage.includes("search") ||
      lowerMessage.includes("find") ||
      lowerMessage.includes("internship")
    )
      return "search";
    if (
      lowerMessage.includes("resume") ||
      lowerMessage.includes("cv") ||
      lowerMessage.includes("portfolio")
    )
      return "resume";
    if (
      lowerMessage.includes("interview") ||
      lowerMessage.includes("preparation") ||
      lowerMessage.includes("questions")
    )
      return "interview";
    if (
      lowerMessage.includes("skill") ||
      lowerMessage.includes("gap") ||
      lowerMessage.includes("learn") ||
      lowerMessage.includes("develop")
    )
      return "skills";
    if (
      lowerMessage.includes("profile") ||
      lowerMessage.includes("setup") ||
      lowerMessage.includes("complete")
    )
      return "profile";
    if (lowerMessage.includes("filter") || lowerMessage.includes("advanced"))
      return "filters";
    if (
      lowerMessage.includes("compare") ||
      lowerMessage.includes("comparison") ||
      lowerMessage.includes("choose") ||
      lowerMessage.includes("decide")
    )
      return "compare";
    if (
      lowerMessage.includes("hello") ||
      lowerMessage.includes("hi") ||
      lowerMessage.includes("hey") ||
      lowerMessage.includes("help")
    )
      return "general";

    return "general";
  }

  async sendMessage(
    message: string,
    context?: string,
    language?: string
  ): Promise<any> {
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
      const intent = this.detectIntent(message);
      const localSuggestions = this.getLocalSuggestions(intent);
      return {
        response: this.fallbackResponses[intent],
        suggestions: localSuggestions,
      };
    }
  }

  async generateInterviewQuestions(
    role: string,
    difficulty: "easy" | "medium" | "hard" = "medium"
  ): Promise<string> {
    try {
      const prompt = `Generate 5 ${difficulty} level interview questions for a ${role} internship position. Include both technical and behavioral questions. Format as a numbered list with brief tips.`;
      return await this.generateGeminiContent(prompt);
    } catch (error) {
      console.warn(
        "Error generating questions with Gemini, using fallback:",
        error
      );
      return this.getFallbackQuestions(role, difficulty);
    }
  }

  async generateInternshipComparison(prompt: string): Promise<string> {
    try {
      return await this.generateGeminiContent(prompt);
    } catch (error) {
      console.warn(
        "Error generating comparison with Gemini, using fallback:",
        error
      );
      return this.getFallbackComparison();
    }
  }

  async editLatexCode(currentCode: string, prompt: string): Promise<string> {
    try {
      const systemPrompt = `You are an expert LaTeX developer. The user has provided their current LaTeX code and a request to modify it.
      
USER REQUEST:
${prompt}

CURRENT LATEX CODE:
\`\`\`latex
${currentCode}
\`\`\`

INSTRUCTIONS:
- Analyze the user request and modify the provided LaTeX code accordingly.
- Return ONLY the raw, updated LaTeX code.
- Do NOT include any markdown formatting blocks like \`\`\`latex.
- Do NOT include any explanations or conversational text. Just the raw text code.`;

      const response = await this.generateGeminiContent(systemPrompt);
      // Clean up the response in case the model ignored instructions and wrapped it in markdown
      let cleanedCode = response.trim();
      if (cleanedCode.startsWith("\`\`\`latex")) {
        cleanedCode = cleanedCode.replace(/^\`\`\`latex\n/, "");
      } else if (cleanedCode.startsWith("\`\`\`")) {
        cleanedCode = cleanedCode.replace(/^\`\`\`\n/, "");
      }
      if (cleanedCode.endsWith("\`\`\`")) {
        cleanedCode = cleanedCode.replace(/\n\`\`\`$/, "");
      }
      return cleanedCode;
    } catch (error) {
      console.error("Error editing LaTeX code with Gemini:", error);
      throw new Error("AI failed to process your request. Please try again.");
    }
  }

  async chatWithLatexEditor(messages: {role: string, content: string}[], currentCode: string): Promise<{message: string, latexCode: string}> {
    try {
      const formattedHistory = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
      
      const systemPrompt = `You are an expert LaTeX developer and AI assistant. The user is editing a LaTeX resume.
      
CONVERSATION HISTORY:
${formattedHistory}

CURRENT LATEX CODE:
\`\`\`latex
${currentCode}
\`\`\`

INSTRUCTIONS:
1. Analyze the user's latest request in the context of the conversation.
2. Decide if the LaTeX code needs modification.
3. Respond with a STRICT JSON object containing EXACTLY two keys (no markdown formatting, no backticks, just the raw JSON object):
   - "message": A conversational, friendly response explaining what you did or answering the user's question.
   - "latexCode": The COMPLETE, raw, updated LaTeX code. If no changes were needed, return the original code exactly. Do NOT wrap this code in markdown blocks inside the JSON string.

Example JSON output:
{
  "message": "I've updated the font size to 12pt as requested!",
  "latexCode": "\\\\documentclass[12pt]{article}..."
}`;

      const response = await this.generateGeminiContent(systemPrompt);
      
      // Clean up the response to extract JSON (in case Gemini returns markdown block)
      let cleanedJson = response.trim();
      if (cleanedJson.startsWith('\`\`\`json')) {
        cleanedJson = cleanedJson.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
      } else if (cleanedJson.startsWith('\`\`\`')) {
        cleanedJson = cleanedJson.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
      }
      
      const parsed = JSON.parse(cleanedJson);
      if (!parsed.message || !parsed.latexCode) {
         throw new Error("Invalid response format from AI.");
      }
      return parsed;
    } catch (error) {
      console.error("Error chatting with LaTeX AI:", error);
      throw new Error("AI failed to process your request. Please try again.");
    }
  }

  private getFallbackComparison(): string {
    return `** AI Analysis Unavailable**\n\nUnable to generate intelligent comparison at this time.\n\n**Quick Summary:**\n• Higher AI scores indicate better profile matches\n• Focus on the top-ranked internship\n• Consider skills alignment and location preferences\n\n*Please try again in a moment.*`;
  }

  private async generateGeminiContent(prompt: string): Promise<string> {
    // Use AI Queue Service for rate limiting and caching
    const AIQueueService = (await import("@/services/aiQueueService")).default;
    return await AIQueueService.generateResponse(prompt);
  }



  getQueueStatus(): { size: number; processing: boolean } {
    const AIQueueService = require("@/services/aiQueueService").default;
    return {
      size: AIQueueService.getQueueSize(),
      processing: AIQueueService.isProcessing(),
    };
  }

  private getLocalSuggestions(
    intent: keyof typeof this.fallbackResponses
  ): string[] {
    const suggestionMap = {
      search: [
        "How to filter by location?",
        "Show me remote internships",
        "Best companies for internships",
      ],
      resume: [
        "How to write a cover letter?",
        "Resume format for students",
        "Common resume mistakes",
      ],
      interview: [
        "How to prepare for technical interviews?",
        "What to wear for interviews?",
        "Questions to ask interviewer",
      ],
      skills: [
        "Most in-demand skills 2024",
        "How to learn programming?",
        "Free online courses",
      ],
      profile: [
        "How to add projects?",
        "Profile completion tips",
        "Privacy settings",
      ],
      filters: [
        "Location-based search",
        "Salary range filters",
        "Company size preferences",
      ],
      compare: [
        "How to save internships?",
        "Comparison criteria",
        "Decision making tips",
      ],
      general: [
        "Platform features",
        "Getting started guide",
        "Success stories",
      ],
    };
    return suggestionMap[intent] || [];
  }

  private getLocalAutosuggestions(query: string): string[] {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes("intern"))
      return [
        "How to find internships?",
        "Best internship websites",
        "Internship application tips",
      ];
    if (lowerQuery.includes("resume"))
      return [
        "Resume writing tips",
        "Resume templates",
        "Resume review checklist",
      ];
    if (lowerQuery.includes("interview"))
      return [
        "Interview preparation",
        "Common interview questions",
        "Interview follow-up",
      ];
    if (lowerQuery.includes("skill"))
      return [
        "Skill development",
        "In-demand skills",
        "Online learning platforms",
      ];
    return ["Career guidance", "Job search tips", "Professional development"];
  }

  private getFallbackQuestions(role: string, difficulty: string): string {
    return `${difficulty.toUpperCase()} ${role} Interview Questions:\n\n1. Tell me about yourself and your background\n2. Why are you interested in this ${role} internship?\n3. What are your greatest strengths and weaknesses?\n4. Describe a challenging project you worked on\n5. Where do you see yourself in the next few years?\n\nTip: Use the STAR method (Situation, Task, Action, Result) for behavioral questions!`;
  }

  async analyzeResumeATS(resumeText: string, jdText?: string): Promise<any> {
    try {
      const prompt = `
        You are an expert ATS (Applicant Tracking System) analyzer and senior technical recruiter.
        I will provide you with the extracted text from a candidate's resume.
        ${jdText ? `I will also provide a Job Description (JD).` : `There is no specific Job Description provided, so evaluate it against standard industry expectations.`}
        
        Resume Text:
        """${resumeText}"""
        
        ${jdText ? `Job Description:\n"""${jdText}"""\n` : ''}
        
        Analyze the resume and return a STRICT JSON object with the following structure exactly (no markdown formatting, no backticks, just the raw JSON object):
        {
          "score": number (0-100 representing ATS match or general strength),
          "strengths": string[] (list of 3-5 positive aspects of the resume, especially quantifiable metrics),
          "missingKeywords": string[] (list of 3-7 keywords or skills missing from the resume based on the JD or standard industry practices),
          "actionableFeedback": string[] (list of 3-5 specific, actionable bullet points on how to improve the resume format or content),
          "metricsFound": number (count of quantifiable numbers or metrics found in the resume)
        }
      `;
      
      const response = await this.generateGeminiContent(prompt);
      
      // Clean up the response to extract JSON (in case Gemini returns markdown block)
      let cleanedJson = response.trim();
      if (cleanedJson.startsWith('\`\`\`json')) {
        cleanedJson = cleanedJson.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
      } else if (cleanedJson.startsWith('\`\`\`')) {
        cleanedJson = cleanedJson.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
      }
      
      return JSON.parse(cleanedJson);
    } catch (error) {
      console.error("Error analyzing resume with ATS:", error);
      throw error;
    }
  }
}

export const localAIService = new GeminiAIService();

export const quickActions = [
  {
    id: "search",
    label: " Find Internships",
    prompt: "How can I search for internships on this platform?",
  },
  {
    id: "resume",
    label: " Resume Tips",
    prompt: "Give me tips to improve my resume for internship applications",
  },
  {
    id: "interview",
    label: " Interview Prep",
    prompt: "Help me prepare for internship interviews",
  },
  {
    id: "skills",
    label: " Skill Gap",
    prompt: "How can I identify and fill skill gaps for my target role?",
  },
  {
    id: "profile",
    label: " Profile Setup",
    action: (navigate: any) => navigate("/profile"),
  },
  {
    id: "wishlist",
    label: "My Wishlist",
    action: (navigate: any) => navigate("/wishlist"),
  },
  {
    id: "applications",
    label: " Applications",
    action: (navigate: any) => navigate("/applications"),
  },
  {
    id: "compare",
    label: "Compare Internships",
    prompt: "How do I compare different internship opportunities?",
  },
];
