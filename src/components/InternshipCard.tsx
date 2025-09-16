import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { MapPin, Building2, GraduationCap, ExternalLink } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const translations = {
  en: {
    apply: 'Apply Now',
    eligibility: 'Eligibility',
    location: 'Location',
    company: 'Company'
  },
  hi: {
    apply: 'अभी आवेदन करें',
    eligibility: 'योग्यता',
    location: 'स्थान',
    company: 'कंपनी'
  }
};

interface InternshipCardProps {
  role: string;
  company: string;
  location: string;
  eligibility: string;
  logo?: string;
  featured?: boolean;
  onApply?: () => void;
}

export const InternshipCard = ({
  role,
  company,
  location,
  eligibility,
  logo,
  featured = false,
  onApply
}: InternshipCardProps) => {
  const { language } = useTheme();
  const t = translations[language];

  const handleApply = () => {
    if (onApply) {
      onApply();
    } else {
      // Default action - show toast or redirect
      console.log(`Applying for ${role} at ${company}`);
    }
  };

  return (
    <Card className={`minimal-card ${
      featured ? 'ring-2 ring-primary/50 bg-primary/5' : ''
    }`}>
      <CardContent className="padding-responsive">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Company Logo */}
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              {logo ? (
                <img src={logo} alt={company} className="w-8 h-8 rounded" />
              ) : (
                <Building2 className="w-6 h-6 text-primary" />
              )}
            </div>
            
            <div>
              <h3 className="font-poppins font-semibold text-lg text-foreground mb-1">
                {role}
              </h3>
              <p className="text-muted-foreground text-sm flex items-center">
                <Building2 className="w-3 h-3 mr-1" />
                {company}
              </p>
            </div>
          </div>
          
          {featured && (
            <div className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
              Featured
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2 text-primary" />
            <span className="font-medium mr-2">{t.location}:</span>
            <span>{location}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <GraduationCap className="w-4 h-4 mr-2 text-primary" />
            <span className="font-medium mr-2">{t.eligibility}:</span>
            <span>{eligibility}</span>
          </div>
        </div>

        {/* Apply Button */}
        <Button 
          onClick={handleApply}
          className="w-full bg-primary hover:bg-primary-dark text-white py-2 sm:py-2.5 rounded-lg font-medium smooth-transition group"
        >
          <span className="text-sm sm:text-base">{t.apply}</span>
          <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-2 group-hover:translate-x-1 smooth-transition" />
        </Button>
      </CardContent>
    </Card>
  );
};