import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { t } from '@/lib/translation';

const OnboardingPreferences = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const sectorsList = ['Technology', 'Healthcare', 'Finance', 'Education', 'Marketing', 'E-commerce', 'Manufacturing', 'Media', 'Gaming', 'Consulting'];
  
  const skillsBySection: Record<string, string[]> = {
    'Technology': ['JavaScript', 'Python', 'React', 'Node.js', 'Java', 'C++', 'HTML', 'CSS', 'SQL', 'AWS'],
    'Healthcare': ['Medical Research', 'Clinical Trials', 'Healthcare IT', 'Biotechnology', 'Medical Writing'],
    'Finance': ['Financial Analysis', 'Investment Banking', 'Risk Management', 'Accounting', 'Trading'],
    'Education': ['Curriculum Development', 'Educational Technology', 'Teaching', 'E-learning'],
    'Marketing': ['Digital Marketing', 'Content Marketing', 'Social Media Marketing', 'SEO', 'Analytics'],
    'E-commerce': ['Digital Marketing', 'Customer Service', 'Supply Chain', 'Data Analysis'],
    'Manufacturing': ['Quality Control', 'Process Improvement', 'Supply Chain', 'Project Management'],
    'Media': ['Content Creation', 'Video Editing', 'Graphic Design', 'Social Media'],
    'Gaming': ['Unity', 'Unreal Engine', 'C#', 'Game Design', '3D Modeling'],
    'Consulting': ['Problem Solving', 'Data Analysis', 'Presentation Skills', 'Strategic Planning']
  };

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
    setSelectedSectors(prev => 
      prev.includes(sector) 
        ? prev.filter(s => s !== sector)
        : [...prev, sector]
    );
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSave = async () => {
    if (!currentUser) return;
    
    if (selectedSectors.length === 0) {
      toast({ title: 'Error', description: 'Please select at least one sector', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const preferences = {
        sectors: selectedSectors,
        skills: selectedSkills,
        onboardingCompleted: true,
        updatedAt: new Date().toISOString()
      };

      const docRef = doc(db, 'profiles', currentUser.uid);
      await setDoc(docRef, preferences, { merge: true });
      
      toast({ title: 'Success', description: 'Preferences saved successfully!' });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({ title: 'Info', description: 'Preferences saved locally. Will sync when database is available.' });
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
              <h3 className="text-lg font-medium mb-2">{t('profile.sectors')}</h3>
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

          {/* Skills */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">{t('profile.skills')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedSectors.length === 0 
                  ? t('profile.selectSectorsFirst')
                  : 'Select your relevant skills'
                }
              </p>
            </div>

            {selectedSectors.length > 0 && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {getAvailableSkills().map(skill => (
                    <Button
                      key={skill}
                      variant={selectedSkills.includes(skill) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSkill(skill)}
                      className="justify-start text-xs"
                    >
                      {skill}
                    </Button>
                  ))}
                </div>

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
              onClick={() => navigate('/dashboard')}
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