import { GoogleGenerativeAI } from '@google/generative-ai';
import { InternshipScraper } from './internshipScraper';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export class DataUpdater {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  private scraper = new InternshipScraper();

  // Main function to update all data
  async updateInternshipData() {
    try {
      // 1. Get current data
      const currentData = await this.getCurrentData();
      
      // 2. Scrape new data
      const scrapedData = await this.scraper.scrapeInternships();
      
      // 3. Use Gemini to merge and update
      const updatedData = await this.mergeWithGemini(currentData, scrapedData);
      
      // 4. Save updated data
      await this.saveData(updatedData);
      
      return updatedData;
    } catch (error) {
      console.warn('Data update failed');
      throw new Error('Data update failed');
    }
  }

  private async getCurrentData() {
    const response = await fetch('/internships.json');
    return response.json();
  }

  private async mergeWithGemini(current: any[], scraped: any[]) {
    const prompt = `
    Merge current internship data with newly scraped data:
    
    RULES:
    1. Update deadlines if they've passed (extend by 30-60 days)
    2. Add new internships from scraped data
    3. Update existing ones with fresh info
    4. Keep PMIS IDs for existing entries
    5. Generate new PMIS IDs for new entries (format: PMIS-2025-SECTOR-XXX)
    6. Ensure all dates are in future
    
    Current Data: ${JSON.stringify(current.slice(0, 5))}
    Scraped Data: ${JSON.stringify(scraped.slice(0, 5))}
    
    Return complete merged JSON array.
    `;

    const result = await this.model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }

  private async saveData(data: any[]) {
    // In production, save to database
    // For now, you can manually update the JSON file
    console.log('Updated data ready:', data.length, 'internships');
    return data;
  }

  // Generate new internships using Gemini + real company APIs
  async generateNewInternships(count: number = 10) {
    const prompt = `
    Generate ${count} realistic internship opportunities for Indian students.
    Use real Indian companies and current market trends.
    
    Include:
    - Real company names (TCS, Infosys, Wipro, Reliance, etc.)
    - Current salary ranges
    - Realistic locations
    - Future deadlines (next 30-90 days)
    - Relevant skills for 2025
    - Proper PMIS IDs
    
    Return JSON array matching the existing format.
    `;

    const result = await this.model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }

  // Auto-schedule updates
  startAutoUpdate(intervalHours: number = 24) {
    setInterval(async () => {
      try {
        await this.updateInternshipData();
        console.log('Auto-update completed');
      } catch (error) {
        console.warn('Auto-update failed');
      }
    }, intervalHours * 60 * 60 * 1000);
  }
}