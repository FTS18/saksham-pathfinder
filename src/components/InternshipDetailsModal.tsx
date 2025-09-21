import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building2, ExternalLink, IndianRupee, Calendar, Users, Clock, Briefcase } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { ReadingAssistant } from './ReadingAssistant';
import { useState } from 'react';

interface Internship {
  id: string;
  title: string;
  role: string;
  company: string;
  location: { city: string; lat?: number; lng?: number; } | string;
  stipend: string;
  duration?: string;
  sector_tags: string[];
  required_skills: string[];
  preferred_education_levels?: string[];
  description?: string;
  responsibilities?: string[];
  perks?: string[];
  work_mode?: string;
  type?: string;
  openings?: number;
  application_deadline?: string;
  posted_date?: string;
  apply_link?: string;
}

interface InternshipDetailsModalProps {
  internship: Internship;
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
    apply: 'Apply Now',
    description: 'Description',
    responsibilities: 'Responsibilities',
    perks: 'Perks & Benefits',
    requirements: 'Requirements',
    details: 'Details',
    duration: 'Duration',
    type: 'Type',
    openings: 'Openings',
    deadline: 'Application Deadline',
    posted: 'Posted On',
    skills: 'Required Skills',
    education: 'Education Level',
    sectors: 'Sectors'
  },
  hi: {
    apply: 'अभी आवेदन करें',
    description: 'विवरण',
    responsibilities: 'जिम्मेदारियां',
    perks: 'लाभ और सुविधाएं',
    requirements: 'आवश्यकताएं',
    details: 'विवरण',
    duration: 'अवधि',
    type: 'प्रकार',
    openings: 'रिक्तियां',
    deadline: 'आवेदन की अंतिम तिथि',
    posted: 'पोस्ट किया गया',
    skills: 'आवश्यक कौशल',
    education: 'शिक्षा स्तर',
    sectors: 'क्षेत्र'
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
  currentIndex,
  totalCount
}: InternshipDetailsModalProps) => {
  const { language } = useTheme();
  const t = translations[language];
  const [showReadingAssistant, setShowReadingAssistant] = useState(false);
  
  const locationText = typeof internship.location === 'string' ? internship.location : internship.location.city;
  
  const getModalText = () => {
    let text = `${internship.title} at ${internship.company}. Location: ${locationText}. Stipend: ${internship.stipend}.`;
    if (internship.description) text += ` Description: ${internship.description}`;
    if (internship.responsibilities) text += ` Responsibilities: ${internship.responsibilities.join(', ')}`;
    if (internship.required_skills) text += ` Required skills: ${internship.required_skills.join(', ')}`;
    return text;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div>{internship.title}</div>
                <div className="text-sm font-normal text-muted-foreground">{internship.company}</div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReadingAssistant(!showReadingAssistant)}
              className="text-xs"
            >
              🔊 Read Aloud
            </Button>
          </DialogTitle>
          {showReadingAssistant && (
            <ReadingAssistant text={getModalText()} isVisible={showReadingAssistant} />
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{locationText}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <IndianRupee className="w-4 h-4 text-primary" />
              <span>{internship.stipend}</span>
            </div>
            {internship.duration && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span>{internship.duration}</span>
              </div>
            )}
            {internship.work_mode && (
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="w-4 h-4 text-primary" />
                <span>{internship.work_mode}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {internship.description && (
            <div>
              <h3 className="font-semibold mb-2">{t.description}</h3>
              <p className="text-sm text-muted-foreground">{internship.description}</p>
            </div>
          )}

          {/* Responsibilities */}
          {internship.responsibilities && internship.responsibilities.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">{t.responsibilities}</h3>
              <ul className="list-disc list-inside space-y-1">
                {internship.responsibilities.map((responsibility, index) => (
                  <li key={index} className="text-sm text-muted-foreground">{responsibility}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills */}
          {internship.required_skills && internship.required_skills.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">{t.skills}</h3>
              <div className="flex flex-wrap gap-2">
                {internship.required_skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Perks */}
          {internship.perks && internship.perks.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">{t.perks}</h3>
              <div className="flex flex-wrap gap-2">
                {internship.perks.map((perk, index) => (
                  <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {perk}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Additional Details */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            {internship.type && (
              <div>
                <span className="text-sm font-medium">{t.type}:</span>
                <span className="text-sm text-muted-foreground ml-2">{internship.type}</span>
              </div>
            )}
            {internship.openings && (
              <div>
                <span className="text-sm font-medium">{t.openings}:</span>
                <span className="text-sm text-muted-foreground ml-2">{internship.openings}</span>
              </div>
            )}
            {internship.application_deadline && (
              <div>
                <span className="text-sm font-medium">{t.deadline}:</span>
                <span className="text-sm text-muted-foreground ml-2">
                  {new Date(internship.application_deadline).toLocaleDateString()}
                </span>
              </div>
            )}
            {internship.posted_date && (
              <div>
                <span className="text-sm font-medium">{t.posted}:</span>
                <span className="text-sm text-muted-foreground ml-2">
                  {new Date(internship.posted_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Apply Button */}
          <div className="flex gap-3 pt-4">
            <a 
              href={internship.apply_link || '#'} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex-1"
            >
              <Button className="w-full bg-primary hover:bg-primary-dark text-white rounded-full py-3">
                <span>{t.apply}</span>
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};