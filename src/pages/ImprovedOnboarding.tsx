import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Confetti } from '@/components/Confetti';
import OnboardingService from '@/services/onboardingService';
import LocationService from '@/services/locationService';

const SECTORS = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Marketing', 
  'E-commerce', 'Manufacturing', 'Media', 'Gaming', 'Consulting', 
  'Banking', 'Automotive', 'Construction', 'Hospitality', 'Travel', 
  'NGO', 'Research', 'Sales', 'Operations', 'Electronics', 'Infrastructure'
];

const SKILLS_BY_SECTOR: Record<string, string[]> = {
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

const EDUCATION_LEVELS = [
  'High School',
  '12th Pass',
  'Diploma',
  'Bachelor\'s (1st Year)',
  'Bachelor\'s (2nd Year)',
  'Bachelor\'s (3rd Year)',
  'Bachelor\'s (Final Year)',
  'Master\'s (1st Year)',
  'Master\'s (Final Year)',
  'Other',
];

const ImprovedOnboarding = () => {
  const { currentUser, userType } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [saving, setSaving] = useState(false);
  const [states, setStates] = useState<any[]>([]);
  const [currentCities, setCurrentCities] = useState<any[]>([]);

  const isStudent = userType === 'student';
  const totalSteps = isStudent ? 7 : 3;

  const [formData, setFormData] = useState({
    username: '',
    sector: '',
    skills: [] as string[],
    education: { level: '', field: '', year: '' },
    location: { city: '', state: '', country: 'India' },
    minStipend: '',
    workMode: 'any',
    startDate: '',
    company: '',
    role: '',
    industry: '',
  });

  // Auto-save
  useEffect(() => {
    const draft = localStorage.getItem('improved_onboarding_sector_first');
    if (draft) {
      try {
        setFormData(JSON.parse(draft));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('improved_onboarding_sector_first', JSON.stringify(formData));
  }, [formData]);

  // Load states
  useEffect(() => {
    LocationService.getIndianStates().then(setStates);
  }, []);

  // Load cities
  useEffect(() => {
    if (formData.location.state) {
      const state = states.find(s => s.name === formData.location.state);
      if (state) {
        LocationService.getCitiesByState(state.iso2).then(setCurrentCities);
      }
    }
  }, [formData.location.state, states]);

  const validateStep = (): boolean => {
    if (!isStudent) return true;
    
    switch (currentStep) {
      case 1:
        if (!formData.sector) {
          toast({ title: 'Required', description: 'Please select a sector', variant: 'destructive' });
          return false;
        }
        return true;
      case 2:
        return true;
      case 3:
        if (!formData.education.level || !formData.education.field) {
          toast({ title: 'Required', description: 'Please complete education details', variant: 'destructive' });
          return false;
        }
        return true;
      case 4:
        if (!formData.location.state || !formData.location.city) {
          toast({ title: 'Required', description: 'Please select your location', variant: 'destructive' });
          return false;
        }
        return true;
      case 5:
        return true;
      case 6:
        return true;
      case 7:
        if (!formData.startDate) {
          toast({ title: 'Required', description: 'Please select start date', variant: 'destructive' });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = async () => {
    if (!currentUser) return;

    try {
      setSaving(true);

      if (isStudent) {
        await OnboardingService.completeStudentOnboarding(currentUser.uid, {
          sectors: formData.sector ? [formData.sector] : [],
          skills: formData.skills,
          education: formData.education,
          location: formData.location,
          minStipend: formData.minStipend ? parseInt(formData.minStipend) : 0,
          workMode: formData.workMode as any,
          preferredStartDate: formData.startDate,
        } as any);
      } else {
        await OnboardingService.completeRecruiterOnboarding(currentUser.uid, {
          company: formData.company,
          role: formData.role,
          industry: formData.industry,
        } as any);
      }

      localStorage.removeItem('improved_onboarding_sector_first');
      setShowConfetti(true);

      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('onboardingCompleted'));
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete onboarding. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  // Student Flow
  if (isStudent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 py-8">
        <Confetti active={showConfetti} />
        
        <div className="max-w-2xl mx-auto px-4">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-3xl font-bold">Let's Get Started 🚀</h1>
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>
                {currentStep === 1 && '🎯 What sector interests you?'}
                {currentStep === 2 && '💡 Select your skills'}
                {currentStep === 3 && '🎓 Education Details'}
                {currentStep === 4 && '📍 Where are you located?'}
                {currentStep === 5 && '💰 Stipend Expectations'}
                {currentStep === 6 && '🏢 Work Mode Preference'}
                {currentStep === 7 && '📅 Preferred Start Date'}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && 'Choose the industry that excites you most'}
                {currentStep === 2 && 'Top skills for ' + formData.sector}
                {currentStep === 3 && 'Tell us about your current education'}
                {currentStep === 4 && 'We\'ll show you internships in your area'}
                {currentStep === 5 && 'Leave blank if you\'re flexible'}
                {currentStep === 6 && 'Which work setup do you prefer?'}
                {currentStep === 7 && 'When can you start?'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1: Sector */}
              {currentStep === 1 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SECTORS.map((sector) => (
                    <button
                      key={sector}
                      onClick={() => setFormData({ ...formData, sector, skills: [] })}
                      className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                        formData.sector === sector
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {sector}
                      {formData.sector === sector && (
                        <Check className="w-4 h-4 inline ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Step 2: Skills */}
              {currentStep === 2 && formData.sector && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Popular skills for {formData.sector}:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(SKILLS_BY_SECTOR[formData.sector] || []).map((skill) => (
                      <button
                        key={skill}
                        onClick={() => {
                          const newSkills = formData.skills.includes(skill)
                            ? formData.skills.filter(s => s !== skill)
                            : [...formData.skills, skill];
                          setFormData({ ...formData, skills: newSkills });
                        }}
                        className={`p-2 rounded-lg border transition-all text-sm ${
                          formData.skills.includes(skill)
                            ? 'border-primary bg-primary/10 font-semibold'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Education */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="education-level">Education Level *</Label>
                    <Select
                      value={formData.education.level}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          education: { ...formData.education, level: value },
                        })
                      }
                    >
                      <SelectTrigger id="education-level">
                        <SelectValue placeholder="Select your education level" />
                      </SelectTrigger>
                      <SelectContent>
                        {EDUCATION_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="education-field">Field of Study *</Label>
                    <Input
                      id="education-field"
                      placeholder="e.g., Computer Science"
                      value={formData.education.field}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          education: { ...formData.education, field: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="education-year">Graduation Year</Label>
                    <Input
                      id="education-year"
                      placeholder="e.g., 2024"
                      value={formData.education.year}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          education: { ...formData.education, year: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Location */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Select
                      value={formData.location.state}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          location: { ...formData.location, state: value, city: '' },
                        })
                      }
                    >
                      <SelectTrigger id="state">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state.name} value={state.name}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Select
                      value={formData.location.city}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          location: { ...formData.location, city: value },
                        })
                      }
                    >
                      <SelectTrigger id="city" disabled={!formData.location.state}>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentCities.map((city: any) => (
                          <SelectItem key={city.name} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 5: Stipend */}
              {currentStep === 5 && (
                <div>
                  <Label htmlFor="stipend">Minimum Monthly Stipend (Optional)</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-muted-foreground">₹</span>
                    <Input
                      id="stipend"
                      type="number"
                      placeholder="e.g., 10000"
                      value={formData.minStipend}
                      onChange={(e) => setFormData({ ...formData, minStipend: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Leave blank if you're flexible
                  </p>
                </div>
              )}

              {/* Step 6: Work Mode */}
              {currentStep === 6 && (
                <div className="grid grid-cols-2 gap-3">
                  {['Remote', 'On-site', 'Hybrid', 'No Preference'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setFormData({ ...formData, workMode: mode.toLowerCase().replace(' ', '_') })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.workMode === mode.toLowerCase().replace(' ', '_')
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="font-semibold">{mode}</div>
                      {formData.workMode === mode.toLowerCase().replace(' ', '_') && (
                        <Check className="w-4 h-4 text-primary mt-2" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Step 7: Start Date */}
              {currentStep === 7 && (
                <div>
                  <Label htmlFor="start-date">Preferred Start Date *</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between gap-3 pt-6">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentStep === 1}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                {currentStep < totalSteps && (
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="text-muted-foreground"
                  >
                    Skip
                  </Button>
                )}

                <Button
                  onClick={handleNext}
                  disabled={saving}
                  className="gap-2 ml-auto"
                >
                  {currentStep === totalSteps ? (
                    <>
                      <Check className="w-4 h-4" />
                      Complete
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Recruiter Flow
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 py-8">
      <Confetti active={showConfetti} />

      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-3xl font-bold">Welcome 👋</h1>
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && '🏢 Company Information'}
              {currentStep === 2 && '👤 Your Role'}
              {currentStep === 3 && '🏭 Industry'}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <div>
                <Label htmlFor="company">Company Name *</Label>
                <Input
                  id="company"
                  placeholder="Enter company name"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <Label htmlFor="role">Your Role *</Label>
                <Input
                  id="role"
                  placeholder="e.g., HR Manager"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => setFormData({ ...formData, industry: value })}
                >
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-between gap-3 pt-6">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <Button
                onClick={handleNext}
                disabled={saving}
                className="gap-2 ml-auto"
              >
                {currentStep === totalSteps ? (
                  <>
                    <Check className="w-4 h-4" />
                    Complete
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImprovedOnboarding;
