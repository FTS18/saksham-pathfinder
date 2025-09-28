export interface Internship {
  id: string;
  title: string;
  company: string;
  location: string | { city: string; state?: string };
  stipend: string;
  duration: string;
  sector: string;
  sector_tags: string[];
  required_skills: string[];
  preferred_education_levels: string[];
  description: string;
  apply_link: string;
  posted_date: string;
  deadline: string;
  work_mode: 'Remote' | 'On-site' | 'Hybrid';
}

export interface ProfileData {
  name: string;
  email: string;
  phone?: string;
  location: string | { city: string; state?: string };
  desiredLocation?: string | { city: string; state?: string };
  education: string;
  skills: string[];
  interests: string[];
  minStipend?: number;
  maxStipend?: number;
  preferredWorkMode?: string;
  bio?: string;
}

export interface FilterState {
  search: string;
  sector: string;
  location: string;
  workMode: string;
  education: string;
  minStipend: string;
  sortBy: string;
  selectedSectors: string[];
  selectedSkills: string[];
}

export interface RecommendationItem {
  internship: Internship;
  score: number;
  explanation: string;
  aiTags: string[];
}