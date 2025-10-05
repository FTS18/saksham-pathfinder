export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  required: boolean;
  validation?: (data: any) => boolean;
}

export interface StudentOnboardingData {
  username: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  desiredLocation: {
    city: string;
    state: string;
    country: string;
  };
  minStipend: string;
  sectors: string[];
  skills: string[];
  referralCode: string;
  education?: {
    level: string;
    institution: string;
    field: string;
    year: string;
  };
  experience?: {
    hasExperience: boolean;
    projects: Array<{
      title: string;
      description: string;
      technologies: string[];
    }>;
  };
}

export interface RecruiterOnboardingData {
  company: string;
  position: string;
  companySize: string;
  industry: string;
  location: string;
  website: string;
  phone: string;
  description: string;
  hiringNeeds: string;
  companyLogo?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  verificationStatus?: 'pending' | 'verified' | 'rejected';
}

export type OnboardingData = StudentOnboardingData | RecruiterOnboardingData;