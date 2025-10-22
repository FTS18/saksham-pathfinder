export interface Internship {
  id?: string;
  title: string;
  role?: string;
  company?: string;
  companyName?: string;
  location: string | { city: string; state?: string };
  stipend: string;
  duration: string;
  sector: string;
  sector_tags?: string[];
  skills?: string[];
  required_skills?: string[];
  preferred_education_levels?: string[];
  description: string;
  apply_link?: string;
  posted_date?: string;
  deadline?: string;
  application_deadline?: string;
  applicationDeadline?: string;
  work_mode?: "Remote" | "On-site" | "Hybrid";
  workMode?: "Remote" | "On-site" | "Hybrid";
  recruiterId?: string;
  status?: "draft" | "published" | "archived";
  views?: number;
  applications?: number;
  createdAt?: any;
  updatedAt?: any;
  publishedAt?: any;
  companyLogoUrl?: string;
  maxApplications?: number;
}

export interface ProfileData {
  name?: string;
  email?: string;
  phone?: string;
  location: string | { city: string; state?: string };
  desiredLocation?: string | { city: string; state?: string };
  education: string;
  skills: string[];
  interests: string[];
  minStipend?: number;
  maxStipend?: number;
  preferredWorkMode?: string;
  searchRadius?: number;
  bio?: string;
  isPublic?: boolean;
  isActive?: boolean;
  deactivatedAt?: any;
}

export interface FilterState {
  search: string;
  sector: string;
  location: string;
  workMode: string;
  education: string;
  minStipend: string;
  minAiScore?: string;
  sortBy: string;
  selectedSectors?: string[];
  selectedSkills?: string[];
}

export interface RecommendationItem {
  internship: Internship;
  score: number;
  explanation: string;
  aiTags: string[];
}

/**
 * ============================================================================
 * RECRUITER TYPES
 * ============================================================================
 */

export interface RecruiterProfile {
  id?: string;
  userId: string;
  companyName: string;
  companyEmail: string;
  emailDomain: string;
  gstNumber: string;
  incorporationCertificateUrl?: string;
  isVerified: boolean;
  status: "pending" | "verified" | "rejected" | "active" | "deactivated";
  submittedAt?: any;
  updatedAt?: any;
  internshipsCreated: number;
  applicationsReceived: number;
  deactivatedAt?: any;
  verificationNotes?: string;
}

export interface VerificationRequest {
  id?: string;
  recruiterId: string;
  companyName: string;
  companyEmail: string;
  gstNumber: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: any;
  updatedAt?: any;
  reviewedAt?: any;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface Application {
  id?: string;
  userId: string;
  internshipId: string;
  recruiterId: string;
  internshipTitle: string;
  companyName: string;
  status:
    | "pending"
    | "applied"
    | "in-review"
    | "under_review"
    | "shortlisted"
    | "interview"
    | "interview_scheduled"
    | "accepted"
    | "rejected"
    | "withdrawn";
  appliedAt?: any;
  updatedAt?: any;
  notes?: string;
  resumeURL?: string;
  coverLetter?: string;
  priority?: "low" | "medium" | "high";
  source?: string;
  metadata?: any;
}

export interface Analytics {
  id?: string;
  internshipId: string;
  userId?: string;
  recruiterId?: string;
  eventType: "view" | "click" | "apply" | "save";
  timestamp?: any;
  metadata?: any;
}

export interface Message {
  id?: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  subject?: string;
  content: string;
  isRead: boolean;
  createdAt?: any;
  updatedAt?: any;
  metadata?: any;
}

export interface RecruiterDashboardStats {
  totalInternships: number;
  totalViews: number;
  totalApplications: number;
  statusBreakdown: Record<string, number>;
  conversionRate: string | number;
}
