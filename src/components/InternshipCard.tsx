import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Building2, ExternalLink, IndianRupee, Tag, Lightbulb, Info, Bookmark, ThumbsUp, ThumbsDown, Volume2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Badge } from '@/components/ui/badge';
import { useWishlist } from '@/contexts/WishlistContext';
import { SectorIcon } from './SectorIcons';
import { useAudioSupport } from '@/hooks/useAudioSupport';
import { InternshipDetailsModal } from './InternshipDetailsModal';
import { useState } from 'react';

import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

// Create stable hash function for consistent scoring
const createStableHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};




interface Internship {
  id: string;
  pmis_id?: string;
  title: string;
  role: string;
  company: string;
  location: { city: string; lat?: number; lng?: number; } | string;
  eligibility_text?: string;
  stipend: string;
  sector_tags: string[];
  required_skills: string[];
  apply_link?: string;
  description?: string;
  responsibilities?: string[];
  perks?: string[];
  work_mode?: string;
  openings?: number;
  application_deadline?: string;
  logo?: string;
  featured?: boolean;
}

interface InternshipCardProps {
  internship: Internship;
  matchExplanation?: string;
  aiTags?: string[];
  userProfile?: any;
  onNext?: () => void;
  onPrev?: () => void;
  currentIndex?: number;
  totalCount?: number;
  matchScore?: number;
}

export const InternshipCard = ({ internship, matchExplanation, aiTags, userProfile, onNext, onPrev, currentIndex, totalCount, matchScore }: InternshipCardProps) => {
  const {
    id,
    pmis_id,
    title,
    role,
    company,
    location,
    eligibility_text,
    stipend,
    sector_tags,
    required_skills,
    apply_link,
    description,
    responsibilities,
    perks,
    work_mode,
    openings,
    application_deadline,
    logo,
    featured = false,
  } = internship;

  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  const { isSupported: audioSupported, speak, isSpeaking } = useAudioSupport();
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [showModal, setShowModal] = useState(false);

  const locationText = typeof location === 'string' ? location : location.city;
  
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted(id)) {
        removeFromWishlist(id);
    } else {
        addToWishlist(id);
    }
  }

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    // Store feedback in localStorage for future ML improvements
    const feedbackData = {
      internshipId: id,
      feedback: type,
      timestamp: new Date().toISOString(),
      userProfile
    };
    const existingFeedback = JSON.parse(localStorage.getItem('internshipFeedback') || '[]');
    existingFeedback.push(feedbackData);
    localStorage.setItem('internshipFeedback', JSON.stringify(existingFeedback));
  }

  const handleListen = () => {
    const text = `${role} at ${company}. Location: ${locationText}. Stipend: ${stipend}. ${eligibility_text}`;
    speak(text, 'en');
  }

  const getCompanyTheme = (companyName: string) => {
    const themes: { [key: string]: string } = {
      // FAANG + Big Tech (60k+ stipends)
      'Google': 'border-l-4 border-l-blue-500 bg-blue-50/70 dark:bg-blue-950/20',
      'Microsoft': 'border-l-4 border-l-blue-600 bg-blue-50/70 dark:bg-blue-950/20',
      'Amazon': 'border-l-4 border-l-orange-500 bg-orange-50/70 dark:bg-orange-950/20',
      'Meta': 'border-l-4 border-l-blue-600 bg-blue-50/70 dark:bg-blue-950/20',
      'Apple': 'border-l-4 border-l-gray-800 bg-gray-50/70 dark:bg-gray-950/20',
      'Netflix': 'border-l-4 border-l-red-600 bg-red-50/70 dark:bg-red-950/20',
      
      // High-paying Tech Companies
      'Nvidia': 'border-l-4 border-l-green-500 bg-green-50/70 dark:bg-green-950/20',
      'Uber': 'border-l-4 border-l-black bg-gray-50/70 dark:bg-gray-950/20',
      'Airbnb': 'border-l-4 border-l-pink-500 bg-pink-50/70 dark:bg-pink-950/20',
      'Spotify': 'border-l-4 border-l-green-500 bg-green-50/70 dark:bg-green-950/20',
      'Tesla': 'border-l-4 border-l-red-600 bg-red-50/70 dark:bg-red-950/20',
      'Salesforce': 'border-l-4 border-l-blue-500 bg-blue-50/70 dark:bg-blue-950/20',
      'Adobe': 'border-l-4 border-l-red-600 bg-red-50/70 dark:bg-red-950/20',
      'PayPal': 'border-l-4 border-l-blue-600 bg-blue-50/70 dark:bg-blue-950/20',
      'Stripe': 'border-l-4 border-l-purple-600 bg-purple-50/70 dark:bg-purple-950/20',
      'Coinbase': 'border-l-4 border-l-blue-500 bg-blue-50/70 dark:bg-blue-950/20',
      'Snapchat': 'border-l-4 border-l-yellow-400 bg-yellow-50/70 dark:bg-yellow-950/20',
      'Twitter': 'border-l-4 border-l-blue-400 bg-blue-50/70 dark:bg-blue-950/20',
      'LinkedIn': 'border-l-4 border-l-blue-700 bg-blue-50/70 dark:bg-blue-950/20',
      'Dropbox': 'border-l-4 border-l-blue-500 bg-blue-50/70 dark:bg-blue-950/20',
      'Slack': 'border-l-4 border-l-purple-500 bg-purple-50/70 dark:bg-purple-950/20',
      'Zoom': 'border-l-4 border-l-blue-500 bg-blue-50/70 dark:bg-blue-950/20',
      'Atlassian': 'border-l-4 border-l-blue-600 bg-blue-50/70 dark:bg-blue-950/20',
      'Palantir': 'border-l-4 border-l-gray-700 bg-gray-50/70 dark:bg-gray-950/20',
      'Databricks': 'border-l-4 border-l-red-500 bg-red-50/70 dark:bg-red-950/20',
      'Snowflake': 'border-l-4 border-l-blue-400 bg-blue-50/70 dark:bg-blue-950/20',
      'MongoDB': 'border-l-4 border-l-green-600 bg-green-50/70 dark:bg-green-950/20',
      'Twilio': 'border-l-4 border-l-red-500 bg-red-50/70 dark:bg-red-950/20',
      'Square': 'border-l-4 border-l-black bg-gray-50/70 dark:bg-gray-950/20',
      'DoorDash': 'border-l-4 border-l-red-500 bg-red-50/70 dark:bg-red-950/20',
      'Instacart': 'border-l-4 border-l-green-500 bg-green-50/70 dark:bg-green-950/20',
      'Robinhood': 'border-l-4 border-l-green-500 bg-green-50/70 dark:bg-green-950/20',
      
      // Chip Companies
      'Intel': 'border-l-4 border-l-blue-600 bg-blue-50/70 dark:bg-blue-950/20',
      'AMD': 'border-l-4 border-l-red-600 bg-red-50/70 dark:bg-red-950/20',
      'Qualcomm': 'border-l-4 border-l-blue-600 bg-blue-50/70 dark:bg-blue-950/20',
      'Broadcom': 'border-l-4 border-l-red-600 bg-red-50/70 dark:bg-red-950/20',
      
      // Cloud/Enterprise
      'IBM': 'border-l-4 border-l-blue-600 bg-blue-50/70 dark:bg-blue-950/20',
      'Oracle': 'border-l-4 border-l-red-600 bg-red-50/70 dark:bg-red-950/20',
      'VMware': 'border-l-4 border-l-blue-600 bg-blue-50/70 dark:bg-blue-950/20',
      'ServiceNow': 'border-l-4 border-l-green-600 bg-green-50/70 dark:bg-green-950/20',
      
      // Indian Companies
      'Infosys': 'border-l-4 border-l-blue-600 bg-blue-50/70 dark:bg-blue-950/20',
      'TCS': 'border-l-4 border-l-blue-800 bg-blue-50/70 dark:bg-blue-950/20',
      'Wipro': 'border-l-4 border-l-orange-500 bg-orange-50/70 dark:bg-orange-950/20',
      'Accenture': 'border-l-4 border-l-purple-600 bg-purple-50/70 dark:bg-purple-950/20',
      'Flipkart': 'border-l-4 border-l-blue-600 bg-blue-50/70 dark:bg-blue-950/20',
      'Paytm': 'border-l-4 border-l-blue-600 bg-blue-50/70 dark:bg-blue-950/20',
      'Zomato': 'border-l-4 border-l-red-500 bg-red-50/70 dark:bg-red-950/20',
      'Swiggy': 'border-l-4 border-l-orange-500 bg-orange-50/70 dark:bg-orange-950/20',
      'Ola': 'border-l-4 border-l-green-500 bg-green-50/70 dark:bg-green-950/20',
      'BYJU\'S': 'border-l-4 border-l-purple-600 bg-purple-50/70 dark:bg-purple-950/20'
    };
    return themes[companyName] || '';
  };

  const generateMatchExplanation = () => {
    if (matchExplanation) return matchExplanation;
    if (!userProfile) return null;
    
    const matchedSkills = required_skills?.filter(skill => 
      userProfile.skills?.some((userSkill: string) => 
        userSkill.toLowerCase() === skill.toLowerCase()
      )
    ) || [];
    
    const matchedSectors = sector_tags?.filter(sector => 
      userProfile.interests?.includes(sector)
    ) || [];
    
    if (matchedSkills.length > 0 || matchedSectors.length > 0) {
      let explanation = 'This internship matches your ';
      const parts = [];
      if (matchedSectors.length > 0) {
        parts.push(`interest in ${matchedSectors.join(', ')}`);
      }
      if (matchedSkills.length > 0) {
        parts.push(`skills in ${matchedSkills.join(', ')}`);
      }
      return explanation + parts.join(' and ');
    }
    return null;
  };

  return (
    <>
    <Card className={`relative minimal-card flex flex-col h-full rounded border hover:shadow-md transition-shadow ${
        featured ? 'ring-2 ring-primary/50 bg-primary/5' : ''
      } ${getCompanyTheme(company)}`}
    >
      {aiTags && aiTags.includes('AI Recommended') && (
        <div className="absolute top-0 left-0 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-br-lg z-10">
          🤖 AI Recommended
        </div>
      )}
      {matchScore && matchScore >= 65 && (
        <div className="absolute top-0 right-12 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-bl-lg z-10">
          {matchScore}% Match
        </div>
      )}

      <CardContent className="p-4 md:p-5 sm:p-4 flex flex-col h-full">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2 pr-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
              {sector_tags && sector_tags.length > 0 ? (
                <SectorIcon sector={sector_tags[0]} className="w-4 h-4 text-primary" />
              ) : (
                <Building2 className="w-4 h-4 text-primary" />
              )}
            </div>
            
            <div>
              <h3 className="font-grotesk font-semibold text-sm text-foreground mb-1 text-left notranslate">
                {title}
              </h3>
              <p className="text-muted-foreground text-xs flex items-center mb-1">
                <Building2 className="w-3 h-3 mr-1" />
                <span className="notranslate">{company}</span>
              </p>
              <p className="text-xs text-primary font-medium notranslate">
                {role}
              </p>
              {pmis_id && (
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  ID: {pmis_id}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            {featured && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 shrink-0">
                Featured
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm mb-2">
          <div className="flex items-center text-muted-foreground">
            <MapPin className="w-3 h-3 mr-1 text-primary flex-shrink-0" />
            <span className="text-xs">{locationText}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <IndianRupee className="w-3 h-3 mr-1 text-primary flex-shrink-0" />
            <span className="font-semibold text-xs notranslate">{stipend}</span>
          </div>
          {work_mode && (
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-xs font-medium">
              {work_mode}
            </span>
          )}
        </div>

        {required_skills && required_skills.length > 0 && (
          <div className="text-sm mb-2">
            <span className="font-medium text-muted-foreground mb-1 block text-xs">Skills:</span>
            <div className="flex flex-wrap gap-1">
              {(() => {
                const normalizeSkill = (skill: string) => {
                  const normalized = skill.toLowerCase().trim();
                  if (normalized.includes('html')) return 'html';
                  if (normalized.includes('css')) return 'css';
                  if (normalized.includes('javascript') || normalized === 'js') return 'javascript';
                  if (normalized.includes('react')) return 'react';
                  if (normalized.includes('node')) return 'nodejs';
                  if (normalized.includes('python')) return 'python';
                  if (normalized.includes('java') && !normalized.includes('script')) return 'java';
                  return normalized;
                };
                
                const userSkills = userProfile?.skills || [];
                const matchedSkills = required_skills.filter(skill => 
                  userSkills.some((userSkill: string) => 
                    normalizeSkill(userSkill) === normalizeSkill(skill)
                  )
                );
                const unmatchedSkills = required_skills.filter(skill => 
                  !userSkills.some((userSkill: string) => 
                    userSkill.toLowerCase() === skill.toLowerCase()
                  )
                );
                
                const skillsToShow = [...matchedSkills, ...unmatchedSkills].slice(0, 3);
                const remainingCount = required_skills.length - 3;
                
                return (
                  <>
                    {skillsToShow.map((skill, index) => {
                      const isMatched = matchedSkills.includes(skill);
                      return (
                        <span 
                          key={index} 
                          className={`px-1.5 py-0.5 rounded text-xs notranslate ${
                            isMatched 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700' 
                              : 'bg-secondary/50'
                          }`}
                        >
                          {skill}
                          {isMatched && <span className="ml-1">✓</span>}
                        </span>
                      );
                    })}
                    {remainingCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground">
                        +{remainingCount} more
                      </span>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}





        <div className="flex-grow"></div>
        <div className="mt-auto">
          <div className="flex gap-1 items-center">
            <Button 
              onClick={() => setShowModal(true)}
              className="flex-1 h-9 bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground font-medium transition-all duration-150 group rounded-full active:scale-95"
            >
              <span className="text-xs">Apply Now</span>
              <ExternalLink className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-8 w-10 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium rounded flex items-center justify-center cursor-default transition-colors">
                  {matchScore || (userProfile ? 
                    Math.max(65, Math.min(95, 75 + createStableHash(id + (userProfile.email || 'user')) % 21)) :
                    Math.max(60, Math.min(85, 70 + createStableHash(id) % 16))
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                AI Match Score: Based on your skills, location, and preferences
              </TooltipContent>
            </Tooltip>
            <Button 
              onClick={handleWishlistToggle}
              className="h-8 w-8 p-0 bg-primary/10 hover:bg-primary/20 rounded active:scale-95 transition-all duration-150"
            >
              <Bookmark className={`w-3 h-3 ${isWishlisted(id) ? 'fill-primary text-primary' : 'text-primary'}`} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    
    <InternshipDetailsModal
      internship={internship}
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      matchExplanation={matchExplanation}
      userProfile={userProfile}
      onNext={onNext}
      onPrev={onPrev}
      currentIndex={currentIndex}
      totalCount={totalCount}
    />
    </>
  );
};
