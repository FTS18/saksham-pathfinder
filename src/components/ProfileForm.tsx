import { useState, useMemo, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { GraduationCap, Lightbulb, Building, MapPin, HelpCircle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocation } from '@/hooks/useLocation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Progress } from './ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Slider } from './ui/slider';

import { CurrencyInput } from './CurrencyInput';




const translations = {
  en: {
    title: 'Complete Your Profile',
    subtitle: 'Help us understand your background to provide better recommendations',
    education: 'Education',
    educationPlaceholder: 'e.g., Computer Science, BTech',
    educationTooltip: 'We ask for your education to match you with internships that fit your academic level!',
    skills: 'Skills',
    skillsPlaceholder: 'Select your skills',
    skillsTooltip: 'We ask for your skills to find internships that match what you\'re good at!',
    interests: 'Sector Interests',
    interestsPlaceholder: 'Select your interests',
    interestsTooltip: 'Tell us your interests so we can find internships in fields you\'re passionate about!',
    location: 'Preferred Location',
    locationPlaceholder: 'e.g., Mumbai, Delhi, Remote',
    locationTooltip: 'We use your location to find nearby internships and save your travel time!',
    searchRadius: 'Search Radius (km)',
    searchRadiusTooltip: 'How far are you willing to travel for an internship?',
    submit: 'Get AI Recommendations',
    success: 'Profile updated successfully!',
    profileStrength: 'Profile Strength'
  },
  hi: {
    title: 'अपनी प्रोफाइल पूरी करें',
    subtitle: 'बेहतर सिफारिशें प्रदान करने के लिए हमें अपनी पृष्ठभूमि को समझने में मदद करें',
    education: 'शिक्षा',
    educationPlaceholder: 'जैसे, कंप्यूटर साइंस, BTech',
    educationTooltip: 'हम आपकी शिक्षा के बारे में पूछते हैं ताकि आपके शैक्षणिक स्तर के अनुकूल इंटर्नशिप मिल सके!',
    skills: 'कौशल',
    skillsPlaceholder: 'अपने कौशल का चयन करें',
    skillsTooltip: 'हम आपके कौशल के बारे में पूछते हैं ताकि आप जिसमें अच्छे हैं उससे मेल खाने वाली इंटर्नशिप मिल सके!',
    interests: 'क्षेत्रीय रुचियां',
    interestsPlaceholder: 'अपनी रुचियों का चयन करें',
    interestsTooltip: 'अपनी रुचियां बताएं ताकि हम उन क्षेत्रों में इंटर्नशिप ढूंढ सकें जिनमें आपकी दिलचस्पी है!',
    location: 'पसंदीदा स्थान',
    locationPlaceholder: 'जैसे, मुंबई, दिल्ली, रिमोट',
    locationTooltip: 'हम आपके स्थान का उपयोग नजदीकी इंटर्नशिप खोजने और आपका यात्रा समय बचाने के लिए करते हैं!',
    searchRadius: 'खोज त्रिज्या (किमी)',
    searchRadiusTooltip: 'आप इंटर्नशिप के लिए कितनी दूर तक यात्रा करने को तैयार हैं?',
    submit: 'AI सिफारिशें प्राप्त करें',
    success: 'प्रोफाइल सफलतापूर्वक अपडेट की गई!',
    profileStrength: 'प्रोफ़ाइल शक्ति'
  }
};

export interface ProfileData {
  education: string;
  skills: string[];
  interests: string[];
  location: string;
  searchRadius: number;
  minStipend: number;
}

const educationLevels = ["Undergraduate", "Postgraduate"];
import { extractAllSectors, extractSkillsBySector } from '@/lib/dataExtractor';

interface ProfileFormProps {
    initialData?: ProfileData;
    onProfileSubmit: (data: ProfileData) => void;
    showTitle?: boolean
}

export const ProfileForm = ({ initialData, onProfileSubmit, showTitle = true }: ProfileFormProps) => {
  const { location: detectedLocation } = useLocation();
  const [sectors, setSectors] = useState<string[]>([]);
  const [skillsBySector, setSkillsBySector] = useState<Record<string, string[]>>({});

  const [formData, setFormData] = useState<ProfileData>(initialData || {
    education: '',
    skills: [],
    interests: [],
    location: '',
    searchRadius: 50,
    minStipend: 0
  });
  const [isMobile, setIsMobile] = useState(false);
  
  // Load real data from internships.json
  useEffect(() => {
    const loadData = async () => {
      try {
        const [sectorsData, skillsData] = await Promise.all([
          extractAllSectors(),
          extractSkillsBySector()
        ]);
        setSectors(sectorsData);
        setSkillsBySector(skillsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if(initialData) {
        setFormData(initialData);
    }
  }, [initialData])

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);

  // Load saved form data on mount
  useEffect(() => {
    if (!initialData) {
      const savedData = localStorage.getItem('profileFormData');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setFormData(parsed);
        } catch (error) {
          console.error('Error loading saved form data:', error);
        }
      }
    }
  }, [initialData]);

  // Save form data on every change
  useEffect(() => {
    localStorage.setItem('profileFormData', JSON.stringify(formData));
  }, [formData]);

  const profileStrength = useMemo(() => {
    let score = 0;
    if (formData.education) score += 20;
    if (formData.skills.length > 0) score += 25;
    if (formData.interests.length > 0) score += 25;
    if (formData.location) score += 20;
    if (formData.searchRadius > 0) score += 5;
    if (formData.minStipend > 0) score += 5;
    return score;
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
    onProfileSubmit(formData);
  };
  
  return (
    <TooltipProvider>
      <div className="max-w-2xl mx-auto">
        <Card className="minimal-card">
            { showTitle && 
                <CardHeader className="text-center padding-responsive">
                    <CardTitle className="text-3xl font-racing font-bold text-foreground">
                    Complete Your Profile
                    </CardTitle>
                    <p className="text-muted-foreground mt-2 text-sm">
                    Help us understand your background to provide better recommendations
                    </p>
                </CardHeader>
            }
        
        <CardContent className="padding-responsive space-responsive">
           <div className="space-y-2">
            <Label className="text-sm font-medium">Profile Strength</Label>
            <Progress 
              value={profileStrength} 
              className="w-full" 
              style={{
                '--progress-background': profileStrength >= 80 ? '#22c55e' : profileStrength >= 50 ? '#eab308' : '#ef4444'
              } as React.CSSProperties}
            />
            <p className="text-xs text-muted-foreground">{profileStrength}% complete</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
             <div className="space-y-2">
              <Label htmlFor="education" className="text-sm font-medium text-foreground flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" />
                Education
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">We ask for your education to match you with internships that fit your academic level!</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Select onValueChange={(value) => setFormData(p => ({...p, education: value}))} value={formData.education}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="e.g., Computer Science, BTech" />
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
               <Label htmlFor="interests" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Building className="w-4 h-4 text-primary" />
                Sector Interests
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Tell us your interests so we can find internships in fields you're passionate about!</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
            {isMobile ? (
              <select 
                multiple
                className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                value={formData.interests}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setFormData(prev => ({...prev, interests: values}));
                }}
              >
                {sectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal h-auto min-h-10 py-2 whitespace-normal">
                    {formData.interests.length > 0 ? formData.interests.join(', ') : 'Select your interests'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {sectors.map(sector => (
                      <Button key={sector} variant={formData.interests.includes(sector) ? 'default' : 'outline'} onClick={() => handleMultiSelectChange('interests', sector)} className={formData.interests.includes(sector) ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-card text-foreground border-2 border-border hover:bg-muted hover:text-foreground'}>{sector}</Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
          
            <div className="space-y-2">
               <Label htmlFor="skills" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                Skills
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">We ask for your skills to find internships that match what you're good at!</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              {formData.interests.length === 0 && (
                <p className="text-sm text-muted-foreground italic">Please select your sector interests first</p>
              )}
            {isMobile ? (
              <select 
                multiple
                disabled={formData.interests.length === 0}
                className="w-full p-2 border border-border rounded-md bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                value={formData.skills}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setFormData(prev => ({...prev, skills: values}));
                }}
              >
                {(formData.interests.length > 0 
                  ? formData.interests.flatMap(interest => skillsBySector[interest] || []).filter((skill, index, arr) => arr.indexOf(skill) === index)
                  : []
                ).map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    disabled={formData.interests.length === 0}
                    className="w-full justify-start text-left font-normal h-auto min-h-10 py-2 whitespace-normal disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formData.interests.length === 0 
                      ? 'Select sector interests first' 
                      : formData.skills.length > 0 
                        ? formData.skills.join(', ') 
                        : 'Select your skills'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {(formData.interests.length > 0 
                      ? formData.interests.flatMap(interest => skillsBySector[interest] || []).filter((skill, index, arr) => arr.indexOf(skill) === index)
                      : []
                    ).map(skill => (
                      <Button key={skill} variant={formData.skills.includes(skill) ? 'default' : 'outline'} onClick={() => handleMultiSelectChange('skills', skill)} className={formData.skills.includes(skill) ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-card text-foreground border-2 border-border hover:bg-muted hover:text-foreground'}>{skill}</Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
          
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Preferred Location *
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">We use your location to find nearby internships and save your travel time!</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Mumbai, Delhi, Remote"
                required
              />
            </div>
            
            <div className="space-y-2">
              <CurrencyInput
                value={formData.minStipend}
                onChange={(minStipend) => setFormData(prev => ({ ...prev, minStipend }))}
                country="India"
                label="Minimum Expected Stipend (per month)"
                placeholder="15000"
              />
            </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Search Radius (km): {formData.searchRadius} km
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">How far are you willing to travel for an internship?</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Slider
                  value={[formData.searchRadius]}
                  onValueChange={(value) => setFormData(p => ({...p, searchRadius: value[0]}))}
                  max={500}
                  min={10}
                  step={10}
                  className="w-full"
                />
              </div>
          
          <Button 
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 sm:py-3 text-base sm:text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
            size="lg"
          >
            Get AI Recommendations
          </Button>
          </form>
        </CardContent>
        </Card>
        <div className="w-full h-px bg-border mt-8"></div>
      </div>
    </TooltipProvider>
  );
};
