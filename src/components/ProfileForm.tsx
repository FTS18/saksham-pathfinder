import { useState, useMemo, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { GraduationCap, Lightbulb, Building, MapPin, HelpCircle, X, ChevronDown, Sparkles, Upload, Loader2, FileText } from 'lucide-react';
import { extractTextFromPdf } from '@/lib/pdfExtractor';
import aiQueueService from '@/services/aiQueueService';
import { useTheme } from '@/contexts/ThemeContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Progress } from './ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { fetchInternships } from '@/lib/dataExtractor';
import { ProfileData } from '@/types';

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


const educationLevels = ["Undergraduate", "Postgraduate"];

interface ProfileFormProps {
    initialData?: ProfileData;
    onProfileSubmit: (data: ProfileData) => void | Promise<void>;
    showTitle?: boolean
}

export const ProfileForm = ({ initialData, onProfileSubmit, showTitle = true }: ProfileFormProps) => {
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
  const [isParsingResume, setIsParsingResume] = useState(false);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsParsingResume(true);
      
      // 1. Extract text from PDF
      const text = await extractTextFromPdf(file);
      
      // 2. Ask Gemini to parse the resume text into a structured JSON profile
      const prompt = `You are an AI resume parser. Extract the following information from this resume text and return a STRICT JSON object. DO NOT wrap it in markdown block quotes like \`\`\`json. Return ONLY raw JSON.

Format Required:
{
  "education": "string (Pick ONE: 'Undergraduate' or 'Postgraduate'. Default to 'Undergraduate' if unknown)",
  "location": "string (The city where they live, e.g. 'Mumbai' or 'Delhi' or 'Remote')",
  "skills": ["string", "string"] (Array of their top technical or soft skills/keywords),
  "interests": ["string", "string"] (Array of broad sectors/industries they might be interested in based on their resume)
}

Resume Text:
${text}`;

      const aiResponse = await aiQueueService.generateResponse(prompt);
      
      // Clean up the response in case Gemini wrapped it in markdown
      const cleanedResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanedResponse);
      
      // 3. Update the form data with extracted details
      setFormData(prev => ({
        ...prev,
        education: parsedData.education || prev.education,
        location: parsedData.location || prev.location,
        // Merge AI skills with existing ones, removing duplicates
        skills: Array.from(new Set([...prev.skills, ...(parsedData.skills || [])])),
        // Merge AI interests with existing ones, removing duplicates
        interests: Array.from(new Set([...prev.interests, ...(parsedData.interests || [])]))
      }));
      
    } catch (error) {
      console.error('Error parsing resume with AI:', error);
      alert('Failed to parse resume. Please ensure it is a valid PDF and try again.');
    } finally {
      setIsParsingResume(false);
      // Clear the input so the same file can be uploaded again if needed
      e.target.value = '';
    }
  };
  
  // Load real data from Firebase or JSON fallback
  useEffect(() => {
    const loadData = async () => {
      try {
        const internships = await fetchInternships();
        processinternships(internships);
      } catch (error) {
        console.error('Failed to load data:', error);
        // Fallback to empty arrays on complete failure
        setSectors([]);
        setSkillsBySector({});
      }
    };

    const processinternships = (internships: any[]) => {
      const sectorsSet = new Set<string>();
      const sectorSkillsMap: Record<string, Set<string>> = {};
      
      internships.forEach((internship: any) => {
        const sectors = internship.sector_tags || [];
        const skills = internship.required_skills || [];
        
        sectors.forEach((sector: string) => {
          sectorsSet.add(sector);
          if (!sectorSkillsMap[sector]) sectorSkillsMap[sector] = new Set();
          skills.forEach((skill: string) => {
            sectorSkillsMap[sector].add(skill);
          });
        });
      });
      
      setSectors(Array.from(sectorsSet).sort());
      
      const finalSectorSkills: Record<string, string[]> = {};
      Object.keys(sectorSkillsMap).forEach(sector => {
        finalSectorSkills[sector] = Array.from(sectorSkillsMap[sector]).sort();
      });
      setSkillsBySector(finalSectorSkills);
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
        const isRemoving = currentValues.includes(value);
        const newValues = isRemoving
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        
        // If removing a sector, remove skills that are only in that sector
        if (field === 'interests' && isRemoving) {
            const removedSectorSkills = skillsBySector[value] || [];
            const remainingSectors = newValues;
            
            // Keep skills that exist in other selected sectors
            const skillsToKeep = prev.skills.filter(skill => {
                if (!removedSectorSkills.includes(skill)) return true;
                // Check if skill exists in any remaining sector
                return remainingSectors.some(sector => 
                    (skillsBySector[sector] || []).includes(skill)
                );
            });
            
            return { ...prev, [field]: newValues, skills: skillsToKeep };
        }
        
        return { ...prev, [field]: newValues };
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
          
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Autofill with AI</h4>
                <p className="text-xs text-muted-foreground">Upload your resume to automatically fill your profile.</p>
              </div>
            </div>
            <div className="relative">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleResumeUpload}
                disabled={isParsingResume}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full sm:w-auto bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 transition-all pointer-events-none"
                disabled={isParsingResume}
              >
                {isParsingResume ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scanning Resume...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload PDF Resume
                  </>
                )}
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
             <div className="space-y-2">
              <Label htmlFor="education" className="text-sm font-medium text-foreground flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" />
                Education
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
                Keywords & Interests
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between rounded-xl">
                    {formData.interests.length > 0 
                      ? `${formData.interests.length} keyword${formData.interests.length > 1 ? 's' : ''} selected`
                      : "Select keywords"
                    }
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <div className="max-h-60 overflow-y-auto p-4">
                    <div className="grid grid-cols-1 gap-2">
                      {sectors.map((sector) => (
                        <div key={sector} className="flex items-center space-x-2">
                          <Checkbox
                            id={`sector-${sector}`}
                            checked={formData.interests.includes(sector)}
                            onCheckedChange={() => handleMultiSelectChange('interests', sector)}
                          />
                          <Label htmlFor={`sector-${sector}`} className="text-sm font-normal cursor-pointer">
                            {sector}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              {/* Selected Sectors Tags */}
              {formData.interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.interests.map(sector => (
                    <Badge 
                      key={sector} 
                      variant="default" 
                      className="rounded-full cursor-pointer"
                      onClick={() => handleMultiSelectChange('interests', sector)}
                    >
                      {sector}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          
          
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Preferred Location
              </Label>
              <Input
                id="location"
                type="text"
                value={typeof formData.location === 'string' ? formData.location : formData.location?.city || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Mumbai, Delhi, Remote"
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