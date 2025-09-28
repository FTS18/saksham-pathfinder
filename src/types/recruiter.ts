export interface Internship {
  id: string;
  title: string;
  company: string;
  description: string;
  duration: string;
  stipend: string;
  location: string;
  requirements: string[];
  skills: string[];
  sector: string;
  type: 'internship' | 'job';
  status: 'active' | 'closed';
  recruiterId: string;
  recruiterName: string;
  recruiterEmail: string;
  createdAt: Date;
  updatedAt: Date;
  applicationCount: number;
}

export interface Application {
  id: string;
  internshipId: string;
  candidateId: string;
  recruiterId: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
  appliedDate: Date;
  coverLetter?: string;
}

export interface Candidate {
  id: string;
  displayName: string;
  email: string;
  skills: string[];
  education?: {
    degree: string;
    institution: string;
    cgpa: number;
  };
  experience?: Array<{
    title: string;
    company: string;
    duration: string;
  }>;
  bio?: string;
}

export interface RecruiterProfile {
  id: string;
  displayName: string;
  email: string;
  company: string;
  position: string;
  userType: 'recruiter';
  createdAt: Date;
  onboardingCompleted: boolean;
  emailVerified: boolean;
}