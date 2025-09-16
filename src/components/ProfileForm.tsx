import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { GraduationCap, Lightbulb, Building, MapPin } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';

const translations = {
  en: {
    title: 'Complete Your Profile',
    subtitle: 'Help us understand your background to provide better recommendations',
    education: 'Education',
    educationPlaceholder: 'e.g., Computer Science, BTech',
    skills: 'Skills',
    skillsPlaceholder: 'e.g., React, Python, Machine Learning',
    interests: 'Sector Interests',
    interestsPlaceholder: 'e.g., Technology, Finance, Healthcare',
    location: 'Preferred Location',
    locationPlaceholder: 'e.g., Mumbai, Delhi, Remote',
    submit: 'Get Recommendations',
    success: 'Profile updated successfully!'
  },
  hi: {
    title: 'अपनी प्रोफाइल पूरी करें',
    subtitle: 'बेहतर सिफारिशें प्रदान करने के लिए हमें अपनी पृष्ठभूमि को समझने में मदद करें',
    education: 'शिक्षा',
    educationPlaceholder: 'जैसे, कंप्यूटर साइंस, BTech',
    skills: 'कौशल',
    skillsPlaceholder: 'जैसे, React, Python, मशीन लर्निंग',
    interests: 'क्षेत्रीय रुचियां',
    interestsPlaceholder: 'जैसे, प्रौद्योगिकी, वित्त, स्वास्थ्य सेवा',
    location: 'पसंदीदा स्थान',
    locationPlaceholder: 'जैसे, मुंबई, दिल्ली, रिमोट',
    submit: 'सिफारिशें प्राप्त करें',
    success: 'प्रोफाइल सफलतापूर्वक अपडेट की गई!'
  }
};

interface ProfileData {
  education: string;
  skills: string;
  interests: string;
  location: string;
}

export const ProfileForm = () => {
  const { language } = useTheme();
  const { toast } = useToast();
  const t = translations[language];
  
  const [formData, setFormData] = useState<ProfileData>({
    education: '',
    skills: '',
    interests: '',
    location: ''
  });

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store profile data in localStorage for demo
    localStorage.setItem('userProfile', JSON.stringify(formData));
    
    toast({
      title: t.success,
      description: "We'll now show you personalized internship recommendations.",
    });
    
    // In a real app, this would redirect to dashboard
    console.log('Profile Data:', formData);
  };

  const formFields = [
    {
      key: 'education' as keyof ProfileData,
      label: t.education,
      placeholder: t.educationPlaceholder,
      icon: GraduationCap
    },
    {
      key: 'skills' as keyof ProfileData,
      label: t.skills,
      placeholder: t.skillsPlaceholder,
      icon: Lightbulb
    },
    {
      key: 'interests' as keyof ProfileData,
      label: t.interests,
      placeholder: t.interestsPlaceholder,
      icon: Building
    },
    {
      key: 'location' as keyof ProfileData,
      label: t.location,
      placeholder: t.locationPlaceholder,
      icon: MapPin
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card className="glass-card border-white/10 hover-lift">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl md:text-3xl font-poppins font-bold text-foreground">
              {t.title}
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {t.subtitle}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {formFields.map(({ key, label, placeholder, icon: Icon }) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key} className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary" />
                    {label}
                  </Label>
                  <Input
                    id={key}
                    type="text"
                    placeholder={placeholder}
                    value={formData[key]}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>
              ))}
              
              <Button 
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white py-3 text-lg font-semibold rounded-lg shadow-button hover-lift"
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