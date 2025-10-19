import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SkillsSectionProps {
  profile: any;
  onUpdate: (key: string, value: any) => Promise<void>;
  isLoading: boolean;
}

const COMMON_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Vue.js', 'Angular',
  'Node.js', 'Express', 'Django', 'Flask', 'SQL', 'MongoDB', 'Firebase',
  'HTML', 'CSS', 'Tailwind CSS', 'Git', 'Docker', 'AWS', 'Azure',
  'Machine Learning', 'Data Analysis', 'UI/UX Design', 'Product Management',
  'Leadership', 'Communication', 'Problem Solving', 'Critical Thinking',
];

export const SkillsSection = ({ profile, onUpdate, isLoading }: SkillsSectionProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const currentSkills = profile?.skills || [];

  const handleAddSkill = async (skill: string) => {
    if (!skill.trim()) return;
    
    if (currentSkills.includes(skill)) {
      toast({ title: 'Skill already added', variant: 'destructive' });
      return;
    }

    try {
      setIsSaving(true);
      const updated = [...currentSkills, skill];
      await onUpdate('skills', updated);
      setNewSkill('');
      setShowSuggestions(false);
      toast({ title: `${skill} added` });
    } catch (error) {
      toast({ title: 'Failed to add skill', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    try {
      setIsSaving(true);
      const updated = currentSkills.filter((skill: string) => skill !== skillToRemove);
      await onUpdate('skills', updated);
      toast({ title: `${skillToRemove} removed` });
    } catch (error) {
      toast({ title: 'Failed to remove skill', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSuggestions = COMMON_SKILLS.filter(
    (skill) => 
      !currentSkills.includes(skill) &&
      skill.toLowerCase().includes(newSkill.toLowerCase())
  );

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-5 h-5" />
          Skills
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Skill Input */}
        <div className="space-y-2">
          <Label htmlFor="skill">Add a Skill</Label>
          <div className="relative">
            <Input
              id="skill"
              placeholder="Type to search or add new skill"
              value={newSkill}
              onChange={(e) => {
                setNewSkill(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              disabled={isSaving}
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && newSkill && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 border rounded-lg bg-popover shadow-lg z-10">
                {filteredSuggestions.slice(0, 8).map((skill) => (
                  <button
                    key={skill}
                    className="w-full text-left px-3 py-2 hover:bg-muted transition-colors text-sm"
                    onClick={() => handleAddSkill(skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Add Custom Skill Button */}
          {newSkill && !filteredSuggestions.includes(newSkill) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddSkill(newSkill)}
              disabled={isSaving}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add "{newSkill}"
            </Button>
          )}
        </div>

        {/* Skills Display */}
        {currentSkills.length > 0 ? (
          <div className="space-y-3">
            <Label>Your Skills</Label>
            <div className="flex flex-wrap gap-2">
              {currentSkills.map((skill: string) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1.5 text-sm"
                >
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    disabled={isSaving}
                    className="ml-1 hover:text-destructive transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No skills added yet
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillsSection;
