// Free Resume Scanning Options:

// 1. PDF.js for PDF text extraction (Free)
import * as pdfjsLib from 'pdfjs-dist';

// 2. Tesseract.js for OCR (Free)
import Tesseract from 'tesseract.js';

// 3. Regular expressions for parsing
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
const PHONE_REGEX = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
const LINKEDIN_REGEX = /linkedin\.com\/in\/([a-zA-Z0-9-]+)/g;
const GITHUB_REGEX = /github\.com\/([a-zA-Z0-9-]+)/g;

export interface ResumeData {
  name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  skills: string[];
  experience: string[];
  education: string[];
  rawText: string;
}

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('PDF extraction failed:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

export const extractTextFromImage = async (file: File): Promise<string> => {
  try {
    const result = await Tesseract.recognize(file, 'eng', {
      logger: m => console.log(m)
    });
    return result.data.text;
  } catch (error) {
    console.error('OCR extraction failed:', error);
    throw new Error('Failed to extract text from image');
  }
};

export const parseResumeText = (text: string): ResumeData => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  // Extract contact info
  const emails = text.match(EMAIL_REGEX) || [];
  const phones = text.match(PHONE_REGEX) || [];
  const linkedinMatches = text.match(LINKEDIN_REGEX) || [];
  const githubMatches = text.match(GITHUB_REGEX) || [];
  
  // Extract name (usually first non-empty line)
  const name = lines[0] || '';
  
  // Common skills keywords
  const skillKeywords = [
    'javascript', 'python', 'java', 'react', 'node', 'html', 'css', 'sql',
    'mongodb', 'postgresql', 'git', 'docker', 'kubernetes', 'aws', 'azure',
    'machine learning', 'data science', 'artificial intelligence', 'typescript',
    'angular', 'vue', 'express', 'django', 'flask', 'spring', 'laravel'
  ];
  
  const skills = skillKeywords.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
  
  // Extract sections (basic pattern matching)
  const experienceSection = extractSection(text, ['experience', 'work', 'employment']);
  const educationSection = extractSection(text, ['education', 'academic', 'degree']);
  
  return {
    name,
    email: emails[0],
    phone: phones[0],
    linkedin: linkedinMatches[0],
    github: githubMatches[0],
    skills,
    experience: experienceSection,
    education: educationSection,
    rawText: text
  };
};

const extractSection = (text: string, keywords: string[]): string[] => {
  const lines = text.split('\n');
  const sections: string[] = [];
  let inSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    if (keywords.some(keyword => line.includes(keyword))) {
      inSection = true;
      continue;
    }
    
    if (inSection) {
      if (line.trim() === '' || 
          ['skills', 'projects', 'certifications'].some(stop => line.includes(stop))) {
        break;
      }
      sections.push(lines[i].trim());
    }
  }
  
  return sections.filter(section => section.length > 0);
};

// Free APIs for profile enhancement:
export const fetchGitHubProfile = async (username: string) => {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    if (!response.ok) throw new Error('GitHub user not found');
    
    const data = await response.json();
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
    const repos = await reposResponse.json();
    
    return {
      name: data.name,
      bio: data.bio,
      location: data.location,
      company: data.company,
      blog: data.blog,
      publicRepos: data.public_repos,
      followers: data.followers,
      following: data.following,
      topRepos: repos.slice(0, 5).map((repo: any) => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count
      }))
    };
  } catch (error) {
    console.error('GitHub fetch failed:', error);
    return null;
  }
};

// Note: LinkedIn API requires approval and is not free for personal use
// Alternative: Use web scraping (not recommended due to ToS)
export const fetchLinkedInProfile = async (username: string) => {
  // LinkedIn API is restricted - would need official partnership
  // For demo purposes, return mock data
  console.warn('LinkedIn API requires business approval');
  return null;
};