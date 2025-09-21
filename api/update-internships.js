// Vercel serverless function for updating internships
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Scrape Internshala
    const internshalaData = await scrapeInternshala();
    
    // Use Gemini to process and structure data
    const prompt = `
    Convert this scraped internship data into structured JSON format:
    
    Required fields: id, pmis_id, title, company, location, stipend, duration, 
    required_skills[], sector_tags[], description, responsibilities[], 
    perks[], type, work_mode, openings, apply_link, posted_date, application_deadline
    
    Rules:
    - Generate unique PMIS IDs (format: PMIS-2025-SECTOR-XXX)
    - Set realistic future deadlines
    - Categorize into proper sectors
    - Extract skills from job descriptions
    
    Data: ${JSON.stringify(internshalaData)}
    `;

    const result = await model.generateContent(prompt);
    const structuredData = JSON.parse(result.response.text());

    res.status(200).json({
      success: true,
      count: structuredData.length,
      data: structuredData
    });

  } catch (error) {
    console.error('Update failed:', error);
    res.status(500).json({ error: 'Update failed' });
  }
}

async function scrapeInternshala() {
  try {
    const response = await fetch('https://internshala.com/internships/');
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const internships = [];
    
    $('.internship_meta').each((i, element) => {
      const title = $(element).find('.job-internship-name').text().trim();
      const company = $(element).find('.company-name').text().trim();
      const location = $(element).find('.location-names').text().trim();
      const stipend = $(element).find('.stipend').text().trim();
      
      if (title && company) {
        internships.push({ title, company, location, stipend });
      }
    });
    
    return internships;
  } catch (error) {
    console.error('Scraping failed:', error);
    return [];
  }
}