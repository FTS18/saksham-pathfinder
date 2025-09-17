import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MapPin, Building2, IndianRupee, Tag, Lightbulb, Info, ExternalLink, Volume2, ThumbsUp, ThumbsDown, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { SectorIcon } from './SectorIcons';
import { useAudioSupport } from '@/hooks/useAudioSupport';
import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface InternshipDetailsModalProps {
  internship: any;
  isOpen: boolean;
  onClose: () => void;
  matchExplanation?: string;
  userProfile?: any;
  onNext?: () => void;
  onPrev?: () => void;
  currentIndex?: number;
  totalCount?: number;
}

const translations = {
  en: {
    eligibility: 'Eligibility',
    location: 'Location',
    company: 'Company',
    stipend: 'Stipend',
    sectors: 'Sectors',
    requiredSkills: 'Skills Required',
    whyGoodMatch: 'Why this is a good match',
    listenDescription: 'Listen to description',
    helpful: 'Helpful?',
    apply: 'Apply Now'
  },
  hi: {
    eligibility: 'योग्यता',
    location: 'स्थान',
    company: 'कंपनी',
    stipend: 'वजीफा',
    sectors: 'क्षेत्र',
    requiredSkills: 'आवश्यक कौशल',
    whyGoodMatch: 'यह क्यों अच्छा मैच है',
    listenDescription: 'विवरण सुनें',
    helpful: 'क्या यह सहायक है?',
    apply: 'अभी आवेदन करें'
  }
};

export const InternshipDetailsModal = ({ 
  internship, 
  isOpen, 
  onClose, 
  matchExplanation, 
  userProfile,
  onNext,
  onPrev,
  currentIndex = 0,
  totalCount = 0
}: InternshipDetailsModalProps) => {
  const { language } = useTheme();
  const { isSupported: audioSupported, speak, isSpeaking } = useAudioSupport();
  const isMobile = useIsMobile();
  const t = translations[language];
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onNext, onPrev, onClose]);

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
    logo
  } = internship;

  const locationText = typeof location === 'string' ? location : location.city;

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    const feedbackData = {
      internshipId: id,
      feedback: type,
      timestamp: new Date().toISOString(),
      userProfile
    };
    const existingFeedback = JSON.parse(localStorage.getItem('internshipFeedback') || '[]');
    existingFeedback.push(feedbackData);
    localStorage.setItem('internshipFeedback', JSON.stringify(existingFeedback));
  };

  const handleListen = () => {
    const text = `${role} at ${company}. Location: ${locationText}. Stipend: ${stipend}. ${eligibility_text}`;
    speak(text, language);
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

  const content = (
    <div className="space-y-6">
      {totalCount > 1 && (
        <div className="flex items-center justify-between border-b pb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onPrev}
            disabled={!onPrev}
            className="rounded-full w-10 h-10 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </Button>
          
          <span className="text-sm text-muted-foreground font-medium">
            {currentIndex + 1} of {totalCount}
          </span>
          
          <Button
            variant="outline"
            size="icon"
            onClick={onNext}
            disabled={!onNext}
            className="rounded-full w-10 h-10 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </Button>
        </div>
      )}
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
          {logo ? (
            <img src={logo} alt={company} className="w-10 h-10 rounded" />
          ) : sector_tags && sector_tags.length > 0 ? (
            <SectorIcon sector={sector_tags[0]} className="w-8 h-8 text-primary" />
          ) : (
            <Building2 className="w-8 h-8 text-primary" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-foreground mb-2">{role}</h3>
          <p className="text-muted-foreground flex items-center">
            <Building2 className="w-4 h-4 mr-2" />
            {company}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-4">
        <div className="flex items-center text-sm">
          <MapPin className="w-4 h-4 mr-3 text-primary" />
          <span className="font-medium mr-2">{t.location}:</span>
          <span>{locationText}</span>
        </div>
        
        <div className="flex items-center text-sm">
          <IndianRupee className="w-4 h-4 mr-3 text-primary" />
          <span className="font-medium mr-2">{t.stipend}:</span>
          <span>{stipend}</span>
        </div>

        {required_skills && required_skills.length > 0 && (
          <div className="flex items-start text-sm">
            <Lightbulb className="w-4 h-4 mr-3 text-primary mt-0.5" />
            <span className="font-medium mr-2">{t.requiredSkills}:</span>
            <div className="flex flex-wrap gap-1">
              {required_skills.map((skill) => (
                <Badge key={skill} variant="secondary">{skill}</Badge>
              ))}
            </div>
          </div>
        )}

        {sector_tags && sector_tags.length > 0 && (
          <div className="flex items-start text-sm">
            <Tag className="w-4 h-4 mr-3 text-primary mt-0.5" />
            <span className="font-medium mr-2">{t.sectors}:</span>
            <div className="flex flex-wrap gap-1">
              {sector_tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Match Explanation */}
      {generateMatchExplanation() && (
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-start text-sm">
            <Lightbulb className="w-4 h-4 mr-2 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-primary">{t.whyGoodMatch}: </span>
              <span className="text-foreground">{generateMatchExplanation()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Eligibility */}
      {eligibility_text && (
        <div className="p-4 bg-secondary/50 rounded-lg">
          <div className="flex items-start text-sm">
            <Info className="w-4 h-4 mr-2 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">{t.eligibility}: </span>
              <span>{eligibility_text}</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {/* Audio Support */}
        {audioSupported && (
          <Button
            variant="outline"
            onClick={handleListen}
            disabled={isSpeaking}
            className="w-full flex items-center gap-2"
          >
            <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
            {isSpeaking ? 'Speaking...' : t.listenDescription}
          </Button>
        )}
        
        {/* Feedback */}
        <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
          <span className="text-sm text-muted-foreground">{t.helpful}</span>
          <div className="flex gap-2">
            <Button
              variant={feedback === 'up' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleFeedback('up')}
              className="h-8 w-8 p-0"
            >
              <ThumbsUp className="w-4 h-4" />
            </Button>
            <Button
              variant={feedback === 'down' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleFeedback('down')}
              className="h-8 w-8 p-0"
            >
              <ThumbsDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Apply Button */}
        <a href={apply_link} target="_blank" rel="noopener noreferrer" onClick={() => {
          const applications = JSON.parse(localStorage.getItem('applications') || '[]');
          const newApp = { internshipId: id, company, role, appliedAt: new Date().toISOString() };
          applications.push(newApp);
          localStorage.setItem('applications', JSON.stringify(applications));
        }}>
          <Button className="w-full bg-primary hover:bg-primary-dark text-white font-medium">
            <span>{t.apply}</span>
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </a>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-xl">
          <SheetHeader>
            <SheetTitle>Internship Details</SheetTitle>
          </SheetHeader>
          <div className="mt-6 overflow-y-auto">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <>
      {/* Blur Background Overlay - Excludes Navbar */}
      {isOpen && (
        <div className="fixed top-16 left-0 right-0 bottom-0 bg-black/20 backdrop-blur-sm z-40" />
      )}
      
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-50" aria-describedby="internship-description">
          <DialogHeader>
            <DialogTitle>Internship Details</DialogTitle>
          </DialogHeader>
          <div id="internship-description">
            {content}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};