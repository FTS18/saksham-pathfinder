import { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { GraduationCap, Lightbulb, Building, MapPin, Info } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Progress } from './ui/progress';

const translations = {
  en: {
    title: 'Complete Your Profile',
    subtitle: 'Help us understand your background to provide better recommendations',
    education: 'Education',
    educationPlaceholder: 'e.g., Computer Science, BTech',
    skills: 'Skills',
    skillsPlaceholder: 'Select your skills',
    interests: 'Sector Interests',
    interestsPlaceholder: 'Select your interests',
    location: 'Preferred Location',
    locationPlaceholder: 'e.g., Mumbai, Delhi, Remote',
    submit: 'Get Recommendations',
    success: 'Profile updated successfully!',
    profileStrength: 'Profile Strength'
  },
  hi: {
    title: 'अपनी प्रोफाइल पूरी करें',
    subtitle: 'बेहतर सिफारिशें प्रदान करने के लिए हमें अपनी पृष्ठभूमि को समझने में मदद करें',
    education: 'शिक्षा',
    educationPlaceholder: 'जैसे, कंप्यूटर साइंस, BTech',
    skills: 'कौशल',
    skillsPlaceholder: 'अपने कौशल का चयन करें',
    interests: 'क्षेत्रीय रुचियां',
    interestsPlaceholder: 'अपनी रुचियों का चयन करें',
    location: 'पसंदीदा स्थान',
    locationPlaceholder: 'जैसे, मुंबई, दिल्ली, रिमोट',
    submit: 'सिफारिशें प्राप्त करें',
    success: 'प्रोफाइल सफलतापूर्वक अपडेट की गई!',
    profileStrength: 'प्रोफ़ाइल शक्ति'
  }
};

interface ProfileData {
  education: string;
  skills: string[];
  interests: string[];
  location: string;
}

const educationLevels = ["Class 12th", "Diploma", "Undergraduate", "Postgraduate"];
const skills = [
  "Python", "Data Structures", "Algorithms", "HTML", "CSS", "JavaScript", "Excel",
  "Machine Learning", "PyTorch", "Financial Modeling", "Verilog", "VHDL",
  "Circuit Design", "UI/UX Design", "Figma", "Adobe XD", "C++", "Embedded Systems",
  "Valuation", "SystemVerilog", "AWS", "Linux", "SQL", "Statistics", "Java",
  "Spring Boot", "5G", "React", "Public Speaking", "Android"
];
const sectors = ["Tech", "Finance", "Electronics", "Designing", "AI/ML", "Hardware", "E-commerce", "Telecommunication", "Automotive", "Healthcare", "Aerospace", "Defense"];


export const ProfileForm = () => {
  const { language } = useTheme();
  const { toast } = useToast();
  const t = translations[language];

  const [formData, setFormData] = useState<ProfileData>({
    education: '',
    skills: [],
    interests: [],
    location: ''
  });

  const profileStrength = useMemo(() => {
    const fields = [formData.education, formData.location];
    const filledFields = fields.filter(Boolean).length + formData.skills.length + formData.interests.length;
    const totalFields = fields.length + skills.length + sectors.length;
    return (filledFields / 4) * 100;
  }, [formData]);

  const handleMultiSelectChange = (field: 'skills' | 'interests', value: string) => {
    setFormData(prev => {
        const currentValues = prev[field];
        if (currentValues.includes(value)) {
            return { ...prev, [field]: currentValues.filter(v => v !== value) };
        } else {
            return { ...prev, [field]: [...currentValues, value] };
        }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('userProfile', JSON.stringify(formData));
    toast({
      title: t.success,
      description: "We'll now show you personalized internship recommendations.",
    });
    console.log('Profile Data:', formData);
  };
  
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <Card className="minimal-card">
          <CardHeader className="text-center padding-responsive">
            <CardTitle className="text-xl sm:text-2xl md:text-3xl font-poppins font-bold text-foreground">
              {t.title}
            </CardTitle>
            <p className="text-muted-foreground mt-2 text-responsive">
              {t.subtitle}
            </p>
          </CardHeader>
          
          <CardContent className="padding-responsive space-responsive">
             <div className="space-y-2">
              <Label className="text-sm font-medium">{t.profileStrength}</Label>
              <Progress value={profileStrength} className="w-full" />
            </div>
            <form onSubmit={handleSubmit} className="space-responsive">
               <div className="space-y-2">
                <Label htmlFor="education" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  {t.education}
                </Label>
                <Select onValueChange={(value) => setFormData(p => ({...p, education: value}))} value={formData.education}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t.educationPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {educationLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                 <Label htmlFor="skills" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  {t.skills}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      {formData.skills.length > 0 ? formData.skills.join(', ') : t.skillsPlaceholder}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-4 grid grid-cols-3 gap-2">
                      {skills.map(skill => (
                        <Button key={skill} variant={formData.skills.includes(skill) ? 'default' : 'outline'} onClick={() => handleMultiSelectChange('skills', skill)}>{skill}</Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                 <Label htmlFor="interests" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Building className="w-4 h-4 text-primary" />
                  {t.interests}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      {formData.interests.length > 0 ? formData.interests.join(', ') : t.interestsPlaceholder}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-4 grid grid-cols-3 gap-2">
                      {sectors.map(sector => (
                        <Button key={sector} variant={formData.interests.includes(sector) ? 'default' : 'outline'} onClick={() => handleMultiSelectChange('interests', sector)}>{sector}</Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                  <Label htmlFor='location' className="text-sm font-medium text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    {t.location}
                  </Label>
                  <Input
                    id='location'
                    type="text"
                    placeholder={t.locationPlaceholder}
                    value={formData.location}
                    onChange={(e) => setFormData(p => ({...p, location: e.target.value}))}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg border border-border bg-input focus:border-primary focus:ring-2 focus:ring-primary/20 smooth-transition"
                    required
                  />
                </div>
              
              <Button 
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 sm:py-3 text-base sm:text-lg font-semibold rounded-lg shadow-clean hover-lift"
                size="lg"
              >
                {t.submit}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
