import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Building2, GraduationCap, ExternalLink, IndianRupee, Tag, Lightbulb, Info } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Badge } from '@/components/ui/badge';

const translations = {
  en: {
    apply: 'Apply Now',
    eligibility: 'Eligibility',
    location: 'Location',
    company: 'Company',
    stipend: 'Stipend',
    sectors: 'Sectors',
    requiredSkills: 'Skills Required'
  },
  hi: {
    apply: 'अभी आवेदन करें',
    eligibility: 'योग्यता',
    location: 'स्थान',
    company: 'कंपनी',
    stipend: 'वजीफा',
    sectors: 'क्षेत्र',
    requiredSkills: 'आवश्यक कौशल'
  }
};

interface Internship {
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
}

export const InternshipCard = ({ internship }: InternshipCardProps) => {
  const {
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
  const t = translations[language];

  const locationText = typeof location === 'string' ? location : location.city;

  return (
    <Card className={`minimal-card flex flex-col h-full ${
      featured ? 'ring-2 ring-primary/50 bg-primary/5' : ''
    }`}>
      <CardContent className="padding-responsive flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              {logo ? (
                <img src={logo} alt={company} className="w-8 h-8 rounded" />
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
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
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

        <a href={apply_link} target="_blank" rel="noopener noreferrer" className="mt-4">
          <Button 
            className="w-full bg-primary hover:bg-primary-dark text-white py-2 sm:py-2.5 rounded-lg font-medium smooth-transition group"
          >
            <span className="text-sm sm:text-base">{t.apply}</span>
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-2 group-hover:translate-x-1 smooth-transition" />
          </Button>
        </a>
      </CardContent>
    </Card>
  );
};

