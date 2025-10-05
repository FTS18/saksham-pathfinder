import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Building, MapPin, Users, Briefcase, Phone, Globe, CheckCircle, Upload } from 'lucide-react';
import OnboardingService from '@/services/onboardingService';
import { RecruiterOnboardingData } from '@/types/onboarding';
import { Confetti } from '@/components/Confetti';

const RecruiterOnboarding = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [existingProfile, setExistingProfile] = useState<any>(null);
  const [formData, setFormData] = useState<RecruiterOnboardingData>({
    company: '',
    position: '',
    companySize: '',
    industry: '',
    location: '',
    website: '',
    phone: '',
    description: '',
    hiringNeeds: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      facebook: ''
    }
  });

  // Load existing profile data
  useEffect(() => {
    const loadExistingProfile = async () => {
      if (!currentUser) return;
      
      try {
        const profileData = await OnboardingService.getExistingProfile(currentUser.uid, 'recruiter');
        
        if (profileData) {
          setExistingProfile(profileData);
          setFormData(prev => ({
            ...prev,
            ...profileData,
            socialLinks: profileData.socialLinks || prev.socialLinks
          }));
        }
      } catch (error) {
        console.warn('Failed to load recruiter profile data:', error);
      }
    };

    loadExistingProfile();
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleComplete = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      await OnboardingService.completeRecruiterOnboarding(
        currentUser.uid,
        formData,
        existingProfile
      );

      setShowConfetti(true);
      window.dispatchEvent(new CustomEvent('onboardingCompleted'));

      toast({
        title: "Welcome to Saksham AI!",
        description: "Your recruiter profile has been set up successfully!"
      });

      setTimeout(() => {
        setShowConfetti(false);
        navigate('/recruiter/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error completing recruiter onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    return OnboardingService.validateRecruiterStep(currentStep, formData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Building className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Company Information</h2>
              <p className="text-muted-foreground">Tell us about your company</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name *</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="company"
                      name="company"
                      placeholder="Enter your company name"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Your Position *</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="position"
                      name="position"
                      placeholder="e.g., HR Manager, Talent Acquisition"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Select value={formData.companySize} onValueChange={(value) => setFormData(prev => ({ ...prev, companySize: value }))}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-1000">201-1000 employees</SelectItem>
                        <SelectItem value="1000+">1000+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="pl-10"
                    />
                  </div>
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
              <h2 className="text-2xl font-bold mb-2">Business Details</h2>
              <p className="text-muted-foreground">Industry and location information</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Select value={formData.industry} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Consulting">Consulting</SelectItem>
                      <SelectItem value="Media">Media & Entertainment</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      name="location"
                      placeholder="e.g., Bangalore, India"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Company Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    placeholder="https://company.com"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Company Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Brief description of your company and what you do..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Users className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Hiring & Social</h2>
              <p className="text-muted-foreground">Tell us about your hiring needs and social presence</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hiringNeeds">Current Hiring Needs</Label>
                <Textarea
                  id="hiringNeeds"
                  name="hiringNeeds"
                  placeholder="What types of roles are you looking to fill? What skills are you seeking?"
                  value={formData.hiringNeeds}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Social Media Links (Optional)</h3>
                <div className="space-y-3">
                  <div>
                    <Label>LinkedIn</Label>
                    <Input
                      placeholder="https://linkedin.com/company/yourcompany"
                      value={formData.socialLinks?.linkedin || ''}
                      onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Twitter</Label>
                    <Input
                      placeholder="https://twitter.com/yourcompany"
                      value={formData.socialLinks?.twitter || ''}
                      onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Facebook</Label>
                    <Input
                      placeholder="https://facebook.com/yourcompany"
                      value={formData.socialLinks?.facebook || ''}
                      onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
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
              Your recruiter profile is now set up. Start posting internships and find the best talent!
            </p>
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg border border-primary/20">
              <p className="font-bold text-lg text-primary mb-2">🚀 Ready to Hire!</p>
              <p className="font-medium">Your profile is under review for verification</p>
              <p className="text-sm text-muted-foreground mt-2">You can start posting internships immediately</p>
            </div>
            <div className="pt-4">
              <Button 
                onClick={() => navigate('/recruiter/dashboard')}
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold px-8 py-3"
              >
                Go to Dashboard 🎯
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-racing font-bold text-xl text-foreground">Saksham AI</span>
          </div>
          
          {currentStep < 4 && (
            <>
              <div className="flex justify-center mb-4">
                <div className="flex space-x-2">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`w-3 h-3 rounded-full ${
                        step <= currentStep ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <CardTitle className="text-xl">Step {currentStep} of 3</CardTitle>
            </>
          )}
        </CardHeader>
        <CardContent>
          {renderStep()}
          
          {currentStep < 4 && (
            <div className="flex gap-4 pt-6">
              {currentStep > 1 && (
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              
              {currentStep < 3 ? (
                <Button 
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1"
                >
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={handleComplete}
                  disabled={loading || !canProceed()}
                  className="flex-1"
                >
                  {loading ? 'Setting up...' : 'Complete Setup'}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

};

export default RecruiterOnboarding;