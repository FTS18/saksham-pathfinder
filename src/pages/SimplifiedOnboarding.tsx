import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, MapPin, Briefcase, GraduationCap, CheckCircle, Upload, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Confetti } from '@/components/Confetti';
import { SearchableSelect } from '@/components/SearchableSelect';
import OnboardingService from '@/services/onboardingService';
import LocationService from '@/services/locationService';
import { Progress } from '@/components/ui/progress';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

const SimplifiedOnboarding = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [states, setStates] = useState<any[]>([]);
  const [currentCities, setCurrentCities] = useState<any[]>([]);
  const [desiredCities, setDesiredCities] = useState<any[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    photoURL: '',
    location: { city: '', state: '', country: 'India' },
    desiredLocation: { city: '', state: '', country: 'India' },
    minStipend: '',
    workMode: 'any' as 'remote' | 'hybrid' | 'onsite' | 'any',
    sectors: [] as string[],
    skills: [] as string[],
    education: {
      level: '',
      field: '',
      year: ''
    },
    referralCode: ''
  });

  // Auto-save to localStorage
  useEffect(() => {
    const draft = localStorage.getItem('onboarding_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData(parsed);
        if (parsed.photoURL) setPhotoPreview(parsed.photoURL);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('onboarding_draft', JSON.stringify(formData));
  }, [formData]);

  // Load states
  useEffect(() => {
    LocationService.getIndianStates().then(setStates);
  }, []);

  // Load cities when state changes
  useEffect(() => {
    if (formData.location.state) {
      const state = states.find(s => s.name === formData.location.state);
      if (state) {
        LocationService.getCitiesByState(state.iso2).then(setCurrentCities);
      }
    }
  }, [formData.location.state, states]);

  useEffect(() => {
    if (formData.desiredLocation.state) {
      const state = states.find(s => s.name === formData.desiredLocation.state);
      if (state) {
        LocationService.getCitiesByState(state.iso2).then(setDesiredCities);
      }
    }
  }, [formData.desiredLocation.state, states]);

  const sectorsList = ['Technology', 'Healthcare', 'Finance', 'Education', 'Marketing', 'E-commerce', 'Manufacturing', 'Media', 'Gaming', 'Consulting', 'Banking', 'Automotive', 'Construction', 'Hospitality', 'Travel', 'NGO', 'Research', 'Sales', 'Operations', 'Electronics', 'Infrastructure'];
  
  const skillsBySection: Record<string, string[]> = {
    'Technology': ['JavaScript', 'Python', 'React', 'Node.js', 'Java', 'C++', 'HTML', 'CSS', 'SQL', 'AWS', 'MongoDB', 'TypeScript', 'Docker'],
    'Healthcare': ['Medical Research', 'Clinical Trials', 'Healthcare IT', 'Biotechnology', 'Patient Care'],
    'Finance': ['Financial Analysis', 'Investment Banking', 'Risk Management', 'Accounting', 'Trading'],
    'Education': ['Curriculum Development', 'Educational Technology', 'Teaching', 'E-learning'],
    'Marketing': ['Digital Marketing', 'Content Marketing', 'Social Media Marketing', 'SEO', 'Analytics'],
    'E-commerce': ['Digital Marketing', 'Customer Service', 'Supply Chain', 'Data Analysis'],
    'Manufacturing': ['Quality Control', 'Process Improvement', 'Supply Chain', 'Project Management'],
    'Media': ['Content Creation', 'Video Editing', 'Graphic Design', 'Social Media'],
    'Gaming': ['Unity', 'Unreal Engine', 'C#', 'Game Design', '3D Modeling'],
    'Consulting': ['Problem Solving', 'Data Analysis', 'Presentation Skills', 'Strategic Planning'],
    'Banking': ['Financial Planning', 'Client Relations', 'Investment', 'Banking Operations'],
    'Automotive': ['Mechanical Design', 'AutoCAD', 'Quality Control', 'Manufacturing'],
    'Construction': ['Safety Regulations', 'Risk Assessment', 'Project Management'],
    'Hospitality': ['Culinary Arts', 'Food Preparation', 'Customer Service'],
    'Travel': ['Customer Service', 'Communication', 'Planning'],
    'NGO': ['Fundraising', 'Communication', 'Content Writing', 'Social Work'],
    'Research': ['Research Methods', 'Lab Techniques', 'Data Analysis'],
    'Sales': ['Retail Operations', 'Customer Service', 'Sales'],
    'Operations': ['Operations Management', 'Process Optimization', 'Logistics'],
    'Electronics': ['Embedded C', 'Microcontrollers', 'PCB Design'],
    'Infrastructure': ['Project Management', 'Construction', 'Safety']
  };

  const generateUsername = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = (currentUser?.displayName?.replace(/\s+/g, '') || 'User') + '_';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const getAvailableSkills = () => {
    if (formData.sectors.length === 0) return [];
    const allSkills = new Set<string>();
    formData.sectors.forEach(sector => {
      const sectorSkills = skillsBySection[sector] || [];
      sectorSkills.forEach(skill => allSkills.add(skill));
    });
    return Array.from(allSkills);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Error', description: 'Image must be less than 5MB', variant: 'destructive' });
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const uploadPhoto = async () => {
    if (!photoFile || !currentUser) return '';

    setUploadingPhoto(true);
    try {
      const storageRef = ref(storage, `profile-photos/${currentUser.uid}/${Date.now()}_${photoFile.name}`);
      await uploadBytes(storageRef, photoFile);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Photo upload failed:', error);
      toast({ title: 'Error', description: 'Failed to upload photo', variant: 'destructive' });
      return '';
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !formData.username.trim()) {
      setFormData(prev => ({ ...prev, username: generateUsername() }));
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleComplete = async () => {
    if (!currentUser) return;
    
    setSaving(true);
    try {
      let photoURL = formData.photoURL;
      if (photoFile) {
        photoURL = await uploadPhoto();
        if (photoURL) {
          setFormData(prev => ({ ...prev, photoURL }));
        }
      }

      await OnboardingService.completeStudentOnboarding(currentUser.uid, {
        ...formData,
        photoURL,
        experience: { hasExperience: false, projects: [] }
      } as any, null);
      
      localStorage.removeItem('onboarding_draft');
      setShowConfetti(true);
      window.dispatchEvent(new CustomEvent('onboardingCompleted'));
      
      toast({ title: 'Welcome to Saksham AI!', description: 'Your profile has been set up successfully.' });
      
      setTimeout(() => {
        setShowConfetti(false);
        navigate('/');
      }, 2000);
      
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      toast({ title: 'Error', description: 'Failed to complete setup. Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const progress = (currentStep / 4) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Basic Info</h2>
              <p className="text-muted-foreground">Let's start with your profile</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Username</Label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter username or leave empty to auto-generate"
                />
              </div>

              <div>
                <Label>Profile Photo (Optional)</Label>
                <div className="flex items-center gap-4 mt-2">
                  {photoPreview ? (
                    <div className="relative">
                      <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover" />
                      <button
                        onClick={() => {
                          setPhotoFile(null);
                          setPhotoPreview('');
                          setFormData(prev => ({ ...prev, photoURL: '' }));
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload">
                    <Button type="button" variant="outline" asChild>
                      <span>Choose Photo</span>
                    </Button>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Current State</Label>
                  <Select value={formData.location.state} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, location: { ...prev.location, state: value, city: '' } }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map(state => (
                        <SelectItem key={state.iso2} value={state.name}>{state.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Current City</Label>
                  <Select value={formData.location.city} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, location: { ...prev.location, city: value } }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentCities.map(city => (
                        <SelectItem key={city.name} value={city.name}>{city.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Career Preferences</h2>
              <p className="text-muted-foreground">Where and how would you like to work?</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Preferred State</Label>
                  <Select value={formData.desiredLocation.state} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, desiredLocation: { ...prev.desiredLocation, state: value, city: '' } }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Remote">Remote (Any Location)</SelectItem>
                      {states.map(state => (
                        <SelectItem key={state.iso2} value={state.name}>{state.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Preferred City</Label>
                  <Select 
                    value={formData.desiredLocation.city} 
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, desiredLocation: { ...prev.desiredLocation, city: value } }))
                    }
                    disabled={formData.desiredLocation.state === 'Remote'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {desiredCities.map(city => (
                        <SelectItem key={city.name} value={city.name}>{city.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Work Mode Preference</Label>
                <Select value={formData.workMode} onValueChange={(value: any) => 
                  setFormData(prev => ({ ...prev, workMode: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="onsite">Onsite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Minimum Stipend (₹/month)</Label>
                <Input
                  type="number"
                  value={formData.minStipend}
                  onChange={(e) => setFormData(prev => ({ ...prev, minStipend: e.target.value }))}
                  placeholder="e.g., 15000"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Briefcase className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Skills & Interests</h2>
              <p className="text-muted-foreground">Select your sectors and skills</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Sectors of Interest</Label>
                <SearchableSelect
                  options={sectorsList}
                  selected={formData.sectors}
                  onSelectionChange={(sectors) => setFormData(prev => ({ ...prev, sectors }))}
                  placeholder="Search and select sectors..."
                  maxHeight="200px"
                />
              </div>

              {formData.sectors.length > 0 && (
                <div>
                  <Label>Your Skills</Label>
                  <SearchableSelect
                    options={getAvailableSkills()}
                    selected={formData.skills}
                    onSelectionChange={(skills) => setFormData(prev => ({ ...prev, skills }))}
                    placeholder="Search and select skills..."
                    maxHeight="200px"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <GraduationCap className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Education & Referral</h2>
              <p className="text-muted-foreground">Tell us about your education</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Education Level</Label>
                  <Select value={formData.education.level} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, education: { ...prev.education, level: value } }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high-school">High School</SelectItem>
                      <SelectItem value="diploma">Diploma</SelectItem>
                      <SelectItem value="bachelors">Bachelor's</SelectItem>
                      <SelectItem value="masters">Master's</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Graduation Year</Label>
                  <Select value={formData.education.year} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, education: { ...prev.education, year: value } }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() + i - 2;
                        return <SelectItem key={year} value={year.toString()}>{year}</SelectItem>;
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Field of Study</Label>
                <Input
                  value={formData.education.field}
                  onChange={(e) => setFormData(prev => ({ ...prev, education: { ...prev.education, field: e.target.value } }))}
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div>
                <Label>Referral Code (Optional)</Label>
                <Input
                  value={formData.referralCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, referralCode: e.target.value.toUpperCase() }))}
                  placeholder="Enter referral code"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your friend will earn 100 points!
                </p>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 text-center">
            <Confetti active={showConfetti} />
            <div className="animate-bounce">
              <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
            </div>
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              🎉 Welcome to Saksham AI! 🎉
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Your journey begins here!
            </p>
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg border border-primary/20">
              <p className="font-bold text-lg text-primary mb-2">🎁 Welcome Bonus Unlocked!</p>
              <p className="font-medium">✨ 50 Welcome Points Added</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.location.state && formData.location.city;
      case 2:
        return formData.desiredLocation.state && (formData.desiredLocation.state === 'Remote' || formData.desiredLocation.city);
      case 3:
        return formData.sectors.length > 0 && formData.skills.length > 0;
      case 4:
        return formData.education.level && formData.education.field && formData.education.year;
      default:
        return true;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl pt-20">
      <Card>
        <CardHeader className="text-center">
          <Progress value={progress} className="mb-4" />
          <CardTitle className="text-xl">Step {currentStep} of 4</CardTitle>
          <p className="text-sm text-muted-foreground">Estimated time: {4 - currentStep + 1} minutes</p>
        </CardHeader>
        <CardContent>
          {renderStep()}
          
          {currentStep < 5 && (
            <div className="flex gap-4 pt-6">
              {currentStep > 1 && (
                <Button variant="outline" onClick={() => setCurrentStep(prev => prev - 1)} className="flex-1">
                  Back
                </Button>
              )}
              
              {currentStep < 4 ? (
                <Button onClick={handleNext} disabled={!canProceed()} className="flex-1">
                  Next
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={saving || uploadingPhoto || !canProceed()} className="flex-1">
                  {saving || uploadingPhoto ? 'Setting up...' : 'Complete Setup'}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplifiedOnboarding;
