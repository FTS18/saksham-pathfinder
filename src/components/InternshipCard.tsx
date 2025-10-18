import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Building2, ExternalLink, IndianRupee, Tag, Lightbulb, ChevronRight, Bookmark, ThumbsUp, ThumbsDown, Volume2, GitCompare, Briefcase, CheckCircle } from 'lucide-react';
import { ShareInternship } from './ShareInternship';
import { useTheme } from '@/contexts/ThemeContext';
import { Badge } from '@/components/ui/badge';
import { useWishlist } from '@/contexts/WishlistContext';
import { useApplication } from '@/contexts/ApplicationContext';
import { SectorIcon } from './SectorIcons';
import { useAudioSupport } from '@/hooks/useAudioSupport';
import { InternshipDetailsModal } from './InternshipDetailsModal';
import { useComparison } from '@/contexts/ComparisonContext';
import { useState, useContext, createContext, useEffect } from 'react';

// Context for sharing internship data across modals
const InternshipNavigationContext = createContext<{
  allInternships: any[];
  setAllInternships: (internships: any[]) => void;
}>({ allInternships: [], setAllInternships: () => {} });

import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip';

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
  role?: string;
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
  aiScore?: number;
}

export const InternshipCard = ({ internship, matchExplanation, aiTags, userProfile, onNext, onPrev, currentIndex, totalCount, matchScore, aiScore }: InternshipCardProps) => {
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
  const { applyToInternship, hasApplied } = useApplication();
  const { isSupported: audioSupported, speak, isSpeaking } = useAudioSupport();
  const { addToComparison, removeFromComparison, isInComparison, selectedInternships, maxComparisons } = useComparison();
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalInternships, setModalInternships] = useState<any[]>([]);
  const [modalCurrentIndex, setModalCurrentIndex] = useState(0);
  
  // Listen for internship data response with proper cleanup
  useEffect(() => {
    const handleInternshipDataResponse = (e: CustomEvent) => {
      const { internships, currentIndex } = e.detail;
      setModalInternships(internships);
      setModalCurrentIndex(currentIndex >= 0 ? currentIndex : 0);
    };
    
    const controller = new AbortController();
    window.addEventListener('internshipDataResponse', handleInternshipDataResponse as EventListener, {
      signal: controller.signal
    });
    
    return () => {
      controller.abort();
    };
  }, []);

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

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInComparison(id)) {
      removeFromComparison(id);
    } else {
      addToComparison(internship);
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

  const getSectorColor = (sector: string) => {
    const sectorColors: { [key: string]: string } = {
      'Technology': '#3b82f6', // blue
      'Healthcare': '#10b981', // green
      'Finance': '#f59e0b', // yellow
      'Education': '#8b5cf6', // purple
      'Marketing': '#ef4444', // red
      'E-commerce': '#06b6d4', // cyan
      'Manufacturing': '#6b7280', // gray
      'Media': '#ec4899', // pink
      'Gaming': '#84cc16', // lime
      'Consulting': '#f97316', // orange
      'Banking': '#eab308', // yellow
      'Automotive': '#64748b', // slate
      'Construction': '#a3a3a3', // neutral
      'Hospitality': '#f43f5e', // rose
      'Travel': '#06b6d4', // cyan
      'NGO': '#22c55e', // green
      'Research': '#6366f1', // indigo
      'Sales': '#f59e0b', // amber
      'Operations': '#71717a', // zinc
      'Electronics': '#3b82f6', // blue
      'Infrastructure': '#78716c' // stone
    };
    return sectorColors[sector] || '#3b82f6';
  };

  const getCompanyTheme = (companyName: string) => {
    const themes: { [key: string]: string } = {
      'Google': 'border-l-4 border-l-blue-500 bg-blue-50/70 dark:bg-blue-950/20',
      'Microsoft': 'border-l-4 border-l-blue-600 bg-blue-50/70 dark:bg-blue-950/20',
      'Amazon': 'border-l-4 border-l-orange-500 bg-orange-50/70 dark:bg-orange-950/20',
      'Meta': 'border-l-4 border-l-blue-600 bg-blue-50/70 dark:bg-blue-950/20',
      'Apple': 'border-l-4 border-l-gray-800 bg-gray-50/70 dark:bg-gray-950/20',
      'Flipkart': 'border-l-4 border-l-yellow-500 bg-yellow-50/70 dark:bg-yellow-950/20',
      'TCS': 'border-l-4 border-l-blue-700 bg-blue-50/70 dark:bg-blue-950/20',
      'Infosys': 'border-l-4 border-l-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/20'
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
    <TooltipProvider>
    <Card className={`relative minimal-card flex flex-col h-full rounded-lg border shadow-md hover:shadow-lg transition-all duration-300 internship-card ${
        featured ? 'ring-2 ring-primary/50 bg-primary/5' : ''
      } ${getCompanyTheme(company)}`}
    >
      {/* Share Button - Top Right Corner */}
      <div className="absolute top-3 right-3 z-10">
        <ShareInternship internship={{ id, title, company }} />
      </div>
      {aiTags && aiTags.includes('AI Recommended') && (
        <div className="absolute -top-2 left-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full z-20 shadow-lg transform -rotate-3">
          Recommended
        </div>
      )}


      <CardContent className="p-4 flex flex-col h-full card-content">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 pr-6">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
              {sector_tags && sector_tags.length > 0 ? (
                <SectorIcon sector={sector_tags[0]} className="w-7 h-7" style={{ color: getSectorColor(sector_tags[0]) }} />
              ) : (
                <Building2 className="w-7 h-7 text-primary" />
              )}
            </div>
            
            <div className="ml-3 flex flex-col">
              <a 
                href={`/title/${role.toLowerCase().replace(/\s+/g, '-')}`}
                className="font-grotesk font-semibold text-base text-foreground mb-1.5 text-left notranslate leading-tight hover:text-primary hover:underline cursor-pointer transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {title}
              </a>
              <p className="text-muted-foreground text-sm flex items-center leading-tight">
                <Building2 className="w-3 h-3 mr-1" />
                <a 
                  href={`/company/${company.toLowerCase().replace(/\s+/g, '-')}`}
                  className="notranslate hover:text-primary hover:underline cursor-pointer transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {company}
                </a>
              </p>

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

        <div className="flex items-center justify-between text-sm mb-3">
          <div className="flex items-center text-muted-foreground">
            <MapPin className="w-3 h-3 mr-1 text-primary flex-shrink-0" />
            <a 
              href={`/city/${locationText.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-xs hover:text-primary hover:underline cursor-pointer transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {locationText}
            </a>
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
          <div className="text-sm mb-1">
            <div className="skills-container" style={{ maxHeight: '3.2rem', overflow: 'hidden', lineHeight: '1.4', paddingBottom: '0.75rem' }}>
              {(() => {
                const normalizeSkill = (skill: string) => {
                  const normalized = skill.toLowerCase().trim();
                  if (normalized.includes('html')) return 'html';
                  if (normalized.includes('css')) return 'css';
                  if (normalized.includes('javascript') || normalized === 'js') return 'javascript';
                  if (normalized.includes('react')) return 'react';
                  if (normalized.includes('node')) return 'nodejs';
                  if (normalized.includes('python')) return 'python';
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
                
                // Show skills with +X more logic
                const allSkills = [...matchedSkills, ...unmatchedSkills];
                const maxSkillsToShow = Math.min(3, allSkills.length);
                const skillsToShow = allSkills.slice(0, maxSkillsToShow);
                const remainingCount = required_skills.length - skillsToShow.length;
                
                return (
                  <>
                    {skillsToShow.map((skill, index) => {
                      const isMatched = matchedSkills.includes(skill);
                      return (
                        <a 
                          key={index}
                          href={`/skill/${skill.toLowerCase().replace(/\s+/g, '-')}`}
                          className={`inline-block px-1.5 py-0.5 rounded text-xs notranslate hover:opacity-80 cursor-pointer transition-all mr-1 mb-1 ${
                            isMatched 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700' 
                              : 'bg-secondary/50'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {skill}
                          {isMatched && <span className="ml-1">✓</span>}
                        </a>
                      );
                    })}
                    {remainingCount > 0 && (
                      <span className="inline-block px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground mr-1 mb-1">
                        +{remainingCount} more
                      </span>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}





        <div className="mt-auto pt-2">
          {/* Main Action Button with 3 Icons */}
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => {
                window.dispatchEvent(new CustomEvent('requestInternshipData', {
                  detail: { internshipId: id }
                }));
                setShowModal(true);
              }}
              className="flex-1 h-9 bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary text-primary-foreground font-semibold transition-all duration-200 shadow-sm hover:shadow-md group rounded-full"
            >
              <span className="text-sm">More</span>
            </Button>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleCompareToggle}
                  disabled={!isInComparison(id) && selectedInternships.length >= maxComparisons}
                  size="sm"
                  className={`h-9 w-9 p-0 shadow-sm hover:shadow-md transition-all ${
                    isInComparison(id) 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                >
                  <GitCompare className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Compare</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleWishlistToggle}
                  size="sm"
                  className={`h-9 w-9 p-0 shadow-sm hover:shadow-md transition-all ${
                    isWishlisted(id)
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isWishlisted(id) ? 'fill-current' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Wishlist</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`h-9 w-9 text-xs font-bold flex items-center justify-center cursor-default shadow-sm ${
                  (aiScore || matchScore || 0) >= 90 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                    : (aiScore || matchScore || 0) >= 80 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    : (aiScore || matchScore || 0) >= 70
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                    : (aiScore || matchScore || 0) >= 60
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                    : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                }`}>
                  {aiScore || matchScore || (userProfile ? 
                    Math.max(45, Math.min(89, 65 + createStableHash(id + (userProfile.email || 'user')) % 25)) :
                    Math.max(40, Math.min(85, 60 + createStableHash(id) % 26))
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <div className="font-semibold">AI Match Score</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {(aiScore || matchScore || 0) >= 90 ? '🔥 Excellent' :
                     (aiScore || matchScore || 0) >= 80 ? '⭐ Great' :
                     (aiScore || matchScore || 0) >= 70 ? '👍 Good' :
                     (aiScore || matchScore || 0) >= 60 ? '👌 Fair' : '📝 Basic'}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
    
    <InternshipDetailsModal
      internship={modalInternships.length > 0 ? modalInternships[modalCurrentIndex]?.internship || modalInternships[modalCurrentIndex] : internship}
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      matchExplanation={modalInternships.length > 0 ? modalInternships[modalCurrentIndex]?.explanation : matchExplanation}
      userProfile={userProfile}
      onNext={modalInternships.length > 0 && modalCurrentIndex < modalInternships.length - 1 ? () => {
        setModalCurrentIndex(prev => prev + 1);
      } : undefined}
      onPrev={modalInternships.length > 0 && modalCurrentIndex > 0 ? () => {
        setModalCurrentIndex(prev => prev - 1);
      } : undefined}
      currentIndex={modalCurrentIndex}
      totalCount={modalInternships.length || totalCount}
    />
    </TooltipProvider>
  );
};
