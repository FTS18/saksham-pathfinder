import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X, Gift, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { extractAllSectors, extractSkillsBySector } from '@/lib/dataExtractor';
import { cn } from '@/lib/utils';


const OnboardingPreferences = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [referralCode, setReferralCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [skillsOpen, setSkillsOpen] = useState(false);

  const [sectorsList, setSectorsList] = useState<string[]>([]);
  const [skillsBySection, setSkillsBySection] = useState<Record<string, string[]>>({});
  
  // Load real data from internships.json
  useEffect(() => {
    const loadData = async () => {
      try {
        const [sectors, skillsMap] = await Promise.all([
          extractAllSectors(),
          extractSkillsBySector()
        ]);
        setSectorsList(sectors);
        setSkillsBySection(skillsMap);
      } catch (error) {
        console.error('Failed to load sectors/skills:', error);
        // Fallback data
        setSectorsList(['Technology', 'Finance', 'Healthcare', 'Marketing', 'Education']);
      }
    };
    loadData();
  }, []);

  const getAvailableSkills = () => {
    if (selectedSectors.length === 0) return [];
    const allSkills = new Set<string>();
    selectedSectors.forEach(sector => {
      const sectorSkills = skillsBySection[sector] || [];
      sectorSkills.forEach(skill => allSkills.add(skill));
    });
    return Array.from(allSkills);
  };

  const toggleSector = (sector: string) => {
    setSelectedSectors(prev => {
      const newSectors = prev.includes(sector) 
        ? prev.filter(s => s !== sector)
        : [...prev, sector];
      
      // If removing a sector, remove its skills too
      if (prev.includes(sector)) {
        const sectorSkills = skillsBySection[sector] || [];
        setSelectedSkills(prevSkills => 
          prevSkills.filter(skill => !sectorSkills.includes(skill))
        );
      }
      
      return newSectors;
    });
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const generateReferralCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSave = async () => {
    if (!currentUser) return;
    
    if (selectedSectors.length === 0) {
      toast({ title: 'Error', description: 'Please select at least one sector', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const userReferralCode = generateReferralCode();
      let referralProcessed = false;

      // Handle referral code if provided
      if (referralCode.trim()) {
        try {
          const referralCodeUpper = referralCode.trim().toUpperCase();
          const referrerQuery = await getDoc(doc(db, 'referrals', referralCodeUpper));
          
          if (referrerQuery.exists()) {
            const referrerUid = referrerQuery.data().userId;
            
            // Check if referrer exists and award points
            const referrerProfile = await getDoc(doc(db, 'profiles', referrerUid));
            if (referrerProfile.exists()) {
              await updateDoc(doc(db, 'profiles', referrerUid), {
                points: increment(100)
              });
              referralProcessed = true;
            }
          } else {
            toast({ 
              title: 'Invalid Referral Code', 
              description: 'The referral code you entered is not valid.',
              variant: 'destructive'
            });
          }
        } catch (error) {
          console.error('Referral processing failed:', error);
        }
      }

      const preferences = {
        sectors: selectedSectors,
        skills: selectedSkills,
        onboardingCompleted: true,
        referralCode: userReferralCode,
        points: 50,
        badges: ['Welcome'],
        referralUsed: referralCode.trim() || null,
        updatedAt: new Date().toISOString()
      };

      // Save user profile
      const docRef = doc(db, 'profiles', currentUser.uid);
      await setDoc(docRef, preferences, { merge: true });
      
      // Create referral code mapping
      await setDoc(doc(db, 'referrals', userReferralCode), {
        userId: currentUser.uid,
        createdAt: new Date().toISOString()
      });
      
      // Set onboarding completion in localStorage
      localStorage.setItem('onboardingCompleted', 'true');
      
      if (referralProcessed) {
        toast({ 
          title: '🎉 Referral Success!', 
          description: 'Your referrer earned 100 points! You earned 50 welcome points.',
          duration: 5000
        });
      } else {
        toast({ 
          title: 'Welcome to Saksham AI!', 
          description: `Setup complete! Your referral code: ${userReferralCode}`
        });
      }
      
      // Navigate after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error) {
      console.error('Error saving preferences:', error);
      localStorage.setItem('onboardingCompleted', 'true');
      localStorage.setItem('userSectors', JSON.stringify(selectedSectors));
      localStorage.setItem('userSkills', JSON.stringify(selectedSkills));
      toast({ title: 'Setup Complete', description: 'Preferences saved locally.' });
      navigate('/dashboard');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl pt-20">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome! Let's set up your preferences</CardTitle>
          <p className="text-muted-foreground">Help us find the perfect internships for you</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sectors */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Sector Interests</h3>
              <p className="text-sm text-muted-foreground mb-4">Select the sectors you're interested in</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {sectorsList.map(sector => (
                <Button
                  key={sector}
                  variant={selectedSectors.includes(sector) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSector(sector)}
                  className="justify-start"
                >
                  {sector}
                </Button>
              ))}
            </div>

            {selectedSectors.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedSectors.map(sector => (
                  <Badge key={sector} variant="outline" className="flex items-center gap-1">
                    {sector}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive"
                      onClick={() => toggleSector(sector)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Referral Code */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                Referral Code (Optional)
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Have a referral code? Enter it to give your friend 100 points!
              </p>
            </div>
            
            <div>
              <Label htmlFor="referralCode">Referral Code</Label>
              <Input
                id="referralCode"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="Enter referral code"
                className="mt-1"
              />
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Skills</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedSectors.length === 0 
                  ? 'Please select your sector interests first'
                  : 'Search and select your relevant skills'
                }
              </p>
            </div>

            {selectedSectors.length > 0 && (
              <>
                <Popover open={skillsOpen} onOpenChange={setSkillsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={skillsOpen}
                      className="w-full justify-between"
                    >
                      {selectedSkills.length > 0
                        ? `${selectedSkills.length} skills selected`
                        : "Search skills..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search skills..." />
                      <CommandEmpty>No skills found.</CommandEmpty>
                      <CommandGroup className="h-48 overflow-y-auto">
                        {getAvailableSkills().map((skill) => (
                          <CommandItem
                            key={skill}
                            onSelect={() => {
                              toggleSkill(skill);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedSkills.includes(skill) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {skill}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>

                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedSkills.map(skill => (
                      <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-destructive"
                          onClick={() => toggleSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                localStorage.setItem('onboardingCompleted', 'true');
                navigate('/dashboard');
              }}
              className="flex-1"
            >
              Skip for now
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving || selectedSectors.length === 0}
              className="flex-1"
            >
              {saving ? 'Saving...' : 'Save & Continue'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingPreferences;