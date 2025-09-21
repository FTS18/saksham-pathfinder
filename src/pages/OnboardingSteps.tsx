import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Gift, User, MapPin, Briefcase, Star, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Confetti } from '@/components/Confetti';
import { SearchableSelect } from '@/components/SearchableSelect';

const OnboardingSteps = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    username: '',
    location: { city: '', state: '', country: 'India' },
    desiredLocation: { city: '', state: '', country: 'India' },
    minStipend: '',
    sectors: [] as string[],
    skills: [] as string[],
    referralCode: ''
  });

  const [existingProfile, setExistingProfile] = useState<any>(null);

  // Load existing profile data
  useEffect(() => {
    const loadExistingProfile = async () => {
      if (!currentUser) return;
      
      try {
        const docRef = doc(db, 'profiles', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const profileData = docSnap.data();
          setExistingProfile(profileData);
          
          // Auto-fill form with existing data
          setFormData(prev => ({
            ...prev,
            username: profileData.username || currentUser.displayName || '',
            location: profileData.location || prev.location,
            desiredLocation: profileData.desiredLocation || prev.desiredLocation,
            minStipend: profileData.minStipend?.toString() || '',
            sectors: profileData.sectors || [],
            skills: profileData.skills || []
          }));
        }
      } catch (error) {
        const sanitizedError = error instanceof Error ? error.message.replace(/[\r\n]/g, ' ') : 'Unknown error';
        console.warn('Failed to load profile data:', sanitizedError);
      }
    };

    loadExistingProfile();
  }, [currentUser]);

  const sectorsList = ['Technology', 'Healthcare', 'Finance', 'Education', 'Marketing', 'E-commerce', 'Manufacturing', 'Media', 'Gaming', 'Consulting', 'Banking', 'Automotive', 'Construction', 'Hospitality', 'Travel', 'NGO', 'Research', 'Sales', 'Operations', 'Electronics', 'Infrastructure'];
  
  const skillsBySection: Record<string, string[]> = {
    'Technology': ['JavaScript', 'Python', 'React', 'Node.js', 'Java', 'C++', 'HTML', 'CSS', 'SQL', 'AWS', 'MongoDB', 'Express.js', 'TypeScript', 'Angular', 'Vue.js', 'Docker', 'Kubernetes'],
    'Healthcare': ['Medical Research', 'Clinical Trials', 'Healthcare IT', 'Biotechnology', 'Medical Writing', 'Patient Care', 'Laboratory Skills'],
    'Finance': ['Financial Analysis', 'Investment Banking', 'Risk Management', 'Accounting', 'Trading', 'Financial Modeling', 'Credit Analysis', 'Corporate Finance'],
    'Education': ['Curriculum Development', 'Educational Technology', 'Teaching', 'E-learning', 'Training'],
    'Marketing': ['Digital Marketing', 'Content Marketing', 'Social Media Marketing', 'SEO', 'Analytics', 'Brand Management', 'Campaign Management'],
    'E-commerce': ['Digital Marketing', 'Customer Service', 'Supply Chain', 'Data Analysis', 'Inventory Management'],
    'Manufacturing': ['Quality Control', 'Process Improvement', 'Supply Chain', 'Project Management', 'Lean Manufacturing', 'Robotics'],
    'Media': ['Content Creation', 'Video Editing', 'Graphic Design', 'Social Media', 'Video Production', 'Photography'],
    'Gaming': ['Unity', 'Unreal Engine', 'C#', 'Game Design', '3D Modeling', 'Animation'],
    'Consulting': ['Problem Solving', 'Data Analysis', 'Presentation Skills', 'Strategic Planning', 'Business Intelligence'],
    'Banking': ['Financial Planning', 'Client Relations', 'Investment', 'Communication', 'Banking Operations'],
    'Automotive': ['Mechanical Design', 'AutoCAD', 'Thermodynamics', 'Quality Control', 'Manufacturing'],
    'Construction': ['Safety Regulations', 'Risk Assessment', 'First Aid', 'Communication', 'Project Management'],
    'Hospitality': ['Culinary Arts', 'Food Preparation', 'Hygiene', 'Teamwork', 'Customer Service'],
    'Travel': ['Customer Service', 'Communication', 'Planning', 'Coordination'],
    'NGO': ['Fundraising', 'Communication', 'Content Writing', 'Social Work'],
    'Research': ['Research Methods', 'Lab Techniques', 'Data Analysis', 'Scientific Writing'],
    'Sales': ['Retail Operations', 'Customer Service', 'Sales', 'Communication'],
    'Operations': ['Operations Management', 'Process Optimization', 'Supply Chain', 'Logistics'],
    'Electronics': ['Embedded C', 'Microcontrollers', 'PCB Design', 'Circuit Design'],
    'Infrastructure': ['Project Management', 'Construction', 'Safety', 'Quality Assurance']
  };

  const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'];
  const states = ['Delhi', 'Maharashtra', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal', 'Gujarat', 'Rajasthan', 'Uttar Pradesh'];

  const generateUsername = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = (currentUser?.displayName?.replace(/\s+/g, '') || 'User') + '_';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateReferralCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
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

  const toggleSector = (sector: string) => {
    setFormData(prev => ({
      ...prev,
      sectors: prev.sectors.includes(sector) 
        ? prev.sectors.filter(s => s !== sector)
        : [...prev.sectors, sector]
    }));
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) 
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
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
      const userReferralCode = existingProfile?.referralCode || generateReferralCode();
      
      // Handle referral code if provided
      if (formData.referralCode.trim()) {
        try {
          const referralCode = formData.referralCode.trim().toUpperCase();
          console.log('Looking up referral code:', referralCode);
          
          const referrerQuery = await getDoc(doc(db, 'referrals', referralCode));
          if (referrerQuery.exists()) {
            const referrerUid = referrerQuery.data().userId;
            console.log('Found referrer:', referrerUid);
            
            // Update referrer points
            await updateDoc(doc(db, 'profiles', referrerUid), {
              points: increment(100),
              referralEarnings: increment(100),
              lastReferralAt: new Date().toISOString()
            });
            
            // Create notification for referrer
            await setDoc(doc(db, 'notifications', `${referrerUid}_${Date.now()}`), {
              userId: referrerUid,
              type: 'referral_reward',
              title: 'Referral Reward Earned!',
              message: `You earned 100 points for referring ${formData.username || currentUser.displayName}!`,
              points: 100,
              createdAt: new Date().toISOString(),
              read: false
            });
            
            toast({ 
              title: 'Referral Success!', 
              description: `Your referrer earned 100 points! Code: ${referralCode}` 
            });
          } else {
            console.log('Referral code not found:', referralCode);
            toast({ 
              title: 'Invalid Referral Code', 
              description: 'The referral code you entered was not found.',
              variant: 'destructive'
            });
          }
        } catch (error) {
          const sanitizedError = error instanceof Error ? error.message.replace(/[\r\n]/g, ' ') : 'Unknown error';
          console.warn('Referral processing failed:', sanitizedError);
          toast({ 
            title: 'Referral Error', 
            description: 'Failed to process referral code. Please try again.',
            variant: 'destructive'
          });
        }
      }

      const profileData = {
        username: formData.username || generateUsername(),
        email: currentUser.email,
        location: formData.location,
        desiredLocation: formData.desiredLocation,
        minStipend: parseInt(formData.minStipend) || 0,
        sectors: formData.sectors,
        skills: formData.skills,
        onboardingCompleted: true,
        referralCode: userReferralCode,
        points: (existingProfile?.points || 0) + 50,
        badges: [...(existingProfile?.badges || []), 'Welcome'],
        updatedAt: new Date().toISOString()
      };

      // Save to Firebase
      const docRef = doc(db, 'profiles', currentUser.uid);
      await setDoc(docRef, profileData, { merge: true });
      
      // Create referral code mapping if new
      if (!existingProfile?.referralCode) {
        await setDoc(doc(db, 'referrals', userReferralCode), {
          userId: currentUser.uid,
          createdAt: new Date().toISOString()
        });
      }

      // Save to localStorage for immediate use
      localStorage.setItem('userProfile', JSON.stringify({
        ...profileData,
        searchRadius: 50
      }));
      localStorage.setItem('onboardingCompleted', 'true');
      
      // Show confetti and success
      setShowConfetti(true);
      
      // Update onboarding status in AuthContext
      window.dispatchEvent(new CustomEvent('onboardingCompleted'));
      
      // Force navigation after a short delay
      setTimeout(() => {
        setShowConfetti(false);
        // Force reload to ensure auth context updates
        window.location.href = '/dashboard';
      }, 2000);
      
    } catch (error) {
      const sanitizedError = error instanceof Error ? error.message.replace(/[\r\n]/g, ' ') : 'Unknown error';
      console.warn('Failed to save profile data:', sanitizedError);
      toast({ title: 'Error', description: 'Failed to save profile', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Create Your Username</h2>
              <p className="text-muted-foreground">Choose a unique username for your profile</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter your username"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to auto-generate: {generateUsername()}
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Location Preferences</h2>
              <p className="text-muted-foreground">Tell us where you are and where you'd like to work</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium">Current Location</h3>
                <div className="space-y-2">
                  <Label>City</Label>
                  {isDesktop ? (
                    <Select value={formData.location.city} onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, location: { ...prev.location, city: value } }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <select 
                      value={formData.location.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: { ...prev.location, city: e.target.value } }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select city</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  {isDesktop ? (
                    <Select value={formData.location.state} onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, location: { ...prev.location, state: value } }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <select 
                      value={formData.location.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: { ...prev.location, state: e.target.value } }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select state</option>
                      {states.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Preferred Work Location</h3>
                <div className="space-y-2">
                  <Label>City</Label>
                  {isDesktop ? (
                    <Select value={formData.desiredLocation.city} onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, desiredLocation: { ...prev.desiredLocation, city: value } }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Remote">Remote</SelectItem>
                        {cities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <select 
                      value={formData.desiredLocation.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, desiredLocation: { ...prev.desiredLocation, city: e.target.value } }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select city</option>
                      <option value="Remote">Remote</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="space-y-2">
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
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Briefcase className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Choose Your Interests</h2>
              <p className="text-muted-foreground">Select sectors you're interested in</p>
            </div>
            
            <SearchableSelect
              options={sectorsList}
              selected={formData.sectors}
              onSelectionChange={(sectors) => setFormData(prev => ({ ...prev, sectors }))}
              placeholder="Search and select sectors..."
              maxHeight="250px"
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Star className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Your Skills</h2>
              <p className="text-muted-foreground">
                {formData.sectors.length === 0 ? 'Please select sectors first' : 'Select your relevant skills'}
              </p>
            </div>
            
            {formData.sectors.length > 0 ? (
              <SearchableSelect
                options={getAvailableSkills()}
                selected={formData.skills}
                onSelectionChange={(skills) => setFormData(prev => ({ ...prev, skills }))}
                placeholder="Search and select skills..."
                maxHeight="250px"
              />
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p>Please select sectors first to see relevant skills</p>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Gift className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Referral Code</h2>
              <p className="text-muted-foreground">Have a friend's referral code? Enter it here!</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                <Input
                  id="referralCode"
                  value={formData.referralCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, referralCode: e.target.value.toUpperCase() }))}
                  placeholder="Enter referral code"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your friend will earn 100 points when you enter their code!
                </p>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6 text-center">
            <Confetti active={showConfetti} />
            <div className="animate-bounce">
              <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
            </div>
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              🎉 Yaay! You Have Access to the World of Internships Now! 🎉
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Your journey begins here! Discover thousands of internship opportunities perfectly matched to your skills and interests.
            </p>
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg border border-primary/20">
              <p className="font-bold text-lg text-primary mb-2">🎁 Welcome Bonus Unlocked!</p>
              <p className="font-medium">✨ 50 Welcome Points Added</p>
              <p className="text-sm text-muted-foreground mt-2">Start applying to internships and earn more rewards!</p>
            </div>
            <div className="pt-4">
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold px-8 py-3"
              >
                Start Exploring Internships 🚀
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return true; // Username is optional
      case 2: return formData.location.city && formData.desiredLocation.city;
      case 3: return formData.sectors.length > 0;
      case 4: return true; // Skills are optional
      case 5: return true; // Referral code is optional
      default: return false;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl pt-20">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full ${
                    step <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
          <CardTitle className="text-xl">Step {currentStep} of 5</CardTitle>
        </CardHeader>
        <CardContent>
          {renderStep()}
          
          {currentStep < 6 && (
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
              
              {currentStep < 5 ? (
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
                  disabled={saving || !canProceed()}
                  className="flex-1"
                >
                  {saving ? 'Setting up...' : 'Complete Setup'}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingSteps;