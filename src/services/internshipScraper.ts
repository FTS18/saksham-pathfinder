import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

interface ScrapedInternship {
  title: string;
  company: string;
  location: string;
  deadline: string;
  stipend?: string;
  skills: string[];
}

export class InternshipScraper {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Scrape major job portals
  async scrapeInternships(): Promise<ScrapedInternship[]> {
    const sources = [
      'https://internshala.com/internships',
      'https://www.naukri.com/internship-jobs',
      'https://www.linkedin.com/jobs/search/?keywords=internship'
    ];

    const allInternships: ScrapedInternship[] = [];

    for (const url of sources) {
      try {
        const response = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`);
        const html = await response.text();
        
        const structured = await this.extractWithGemini(html);
        allInternships.push(...structured);
      } catch (error) {
        console.error(`Failed to scrape ${url}:`, error);
      }
    }

    return allInternships;
  }

  // Use Gemini to extract structured data from HTML
  private async extractWithGemini(html: string): Promise<ScrapedInternship[]> {
    const prompt = `
    Extract internship data from this HTML. Return JSON array with:
    - title, company, location, deadline, stipend, skills[]
    
    HTML: ${html.slice(0, 8000)}
    `;

    const result = await this.model.generateContent(prompt);
    const text = result.response.text();
    
    try {
      return JSON.parse(text);
    } catch {
      return [];
    }
  }

  // Auto-update deadlines using Gemini
  async updateDeadlines(internships: any[]): Promise<any[]> {
    const prompt = `
    Update application deadlines for these internships based on current date ${new Date().toISOString()}.
    Rules:
    - If deadline passed, extend by 30-60 days
    - If posted recently, set deadline 2-4 weeks from posted date
    - Keep realistic timelines
    
    Internships: ${JSON.stringify(internships.slice(0, 10))}
    `;

    const result = await this.model.generateContent(prompt);
    const updated = JSON.parse(result.response.text());
    
    return updated;
  }
}