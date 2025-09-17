import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Building2, ExternalLink, IndianRupee, Tag, Lightbulb, Info, Heart, ThumbsUp, ThumbsDown, Volume2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Badge } from '@/components/ui/badge';
import { useWishlist } from '@/contexts/WishlistContext';
import { SectorIcon } from './SectorIcons';
import { useAudioSupport } from '@/hooks/useAudioSupport';
import { InternshipDetailsModal } from './InternshipDetailsModal';
import { useState } from 'react';


const translations = {
  en: {
    apply: 'Apply Now',
    eligibility: 'Eligibility',
    location: 'Location',
    company: 'Company',
    stipend: 'Stipend',
    sectors: 'Sectors',
    requiredSkills: 'Skills Required',
    whyGoodMatch: 'Why this is a good match',
    listenDescription: 'Listen to description',
    helpful: 'Helpful?',
    viewDetails: 'View Details'
  },
  hi: {
    apply: 'अभी आवेदन करें',
    eligibility: 'योग्यता',
    location: 'स्थान',
    company: 'कंपनी',
    stipend: 'वजीफा',
    sectors: 'क्षेत्र',
    requiredSkills: 'आवश्यक कौशल',
    whyGoodMatch: 'यह क्यों अच्छा मैच है',
    listenDescription: 'विवरण सुनें',
    helpful: 'क्या यह सहायक है?',
    viewDetails: 'विवरण देखें'
  }
};

interface Internship {
  id: string;
  role: string;
  company: string;
  location: { city: string; lat?: number; lng?: number; } | string;
  eligibility_text: string;
  stipend: string;
  sector_tags: string[];
  required_skills: string[];
  apply_link: string;
  logo?: string;
  featured?: boolean;
}

interface InternshipCardProps {
  internship: Internship;
  matchExplanation?: string;
  userProfile?: any;
  onNext?: () => void;
  onPrev?: () => void;
  currentIndex?: number;
  totalCount?: number;
}

export const InternshipCard = ({ internship, matchExplanation, userProfile, onNext, onPrev, currentIndex, totalCount }: InternshipCardProps) => {
  const {
    id,
    role,
    company,
    location,
    eligibility_text,
    stipend,
    sector_tags,
    required_skills,
    apply_link,
    logo,
    featured = false,
  } = internship;

  const { language } = useTheme();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  const { isSupported: audioSupported, speak, isSpeaking } = useAudioSupport();
  const t = translations[language];
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
    speak(text, language);
  }

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
    <Card className={`relative minimal-card flex flex-col h-full ${
      featured ? 'ring-2 ring-primary/50 bg-primary/5' : ''
    }`}>
       <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm"
            onClick={handleWishlistToggle}
        >
            <Heart className={`w-5 h-5 transition-colors ${isWishlisted(id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
        </Button>
      <CardContent className="padding-responsive flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 pr-8">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              {logo ? (
                <img src={logo} alt={company} className="w-8 h-8 rounded" />
              ) : sector_tags && sector_tags.length > 0 ? (
                <SectorIcon sector={sector_tags[0]} className="w-6 h-6 text-primary" />
              ) : (
                <Building2 className="w-6 h-6 text-primary" />
              )}
            </div>
            
            <div>
              <h3 className="font-poppins font-semibold text-lg text-foreground mb-1 text-left">
                {role}
              </h3>
              <p className="text-muted-foreground text-sm flex items-center">
                <Building2 className="w-3 h-3 mr-1" />
                {company}
              </p>
            </div>
          </div>
          
          {featured && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 shrink-0">
              Featured
            </Badge>
          )}
        </div>

        <div className="space-y-3 mb-4 flex-grow text-left">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
            <span className="font-medium mr-2">{t.location}:</span>
            <span>{locationText}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <IndianRupee className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
            <span className="font-medium mr-2">{t.stipend}:</span>
            <span>{stipend}</span>
          </div>

          {required_skills && required_skills.length > 0 && (
            <div className="flex items-start text-sm text-muted-foreground">
              <Lightbulb className="w-4 h-4 mr-2 text-primary flex-shrink-0 mt-0.5" />
              <span className="font-medium mr-2 shrink-0">{t.requiredSkills}:</span>
              <div className="flex flex-wrap gap-1">
                {required_skills.map((skill) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          )}

          {sector_tags && sector_tags.length > 0 && (
            <div className="flex items-start text-sm text-muted-foreground">
              <Tag className="w-4 h-4 mr-2 text-primary flex-shrink-0 mt-0.5" />
              <span className="font-medium mr-2 shrink-0">{t.sectors}:</span>
              <div className="flex flex-wrap gap-1">
                {sector_tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>



        {eligibility_text && (
          <div className="mt-auto pt-4 border-t border-border/50">
             <div className="flex items-start text-xs text-muted-foreground bg-secondary/50 p-3 rounded-md">
                <Info className="w-4 h-4 mr-2 text-primary flex-shrink-0 mt-0.5" />
                <div>
                    <span className="font-semibold">{t.eligibility}: </span>
                    <span>{eligibility_text}</span>
                </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowModal(true)}
              className="flex-1"
            >
              {t.viewDetails}
            </Button>
            <a href={apply_link} target="_blank" rel="noopener noreferrer" className="flex-1" onClick={() => {
              const applications = JSON.parse(localStorage.getItem('applications') || '[]');
              const newApp = { internshipId: id, company, role, appliedAt: new Date().toISOString() };
              applications.push(newApp);
              localStorage.setItem('applications', JSON.stringify(applications));
            }}>
              <Button className="w-full bg-primary hover:bg-primary-dark text-white font-medium smooth-transition group">
                <span className="text-sm">{t.apply}</span>
                <ExternalLink className="w-3 h-3 ml-2 group-hover:translate-x-1 smooth-transition" />
              </Button>
            </a>
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
