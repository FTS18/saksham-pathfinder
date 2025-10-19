import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Experience {
  title: string;
  company: string;
  duration: string;
  description?: string;
}

interface ExperienceSectionProps {
  profile: any;
  onUpdate: (key: string, value: any) => Promise<void>;
  isLoading: boolean;
}

export const ExperienceSection = ({ profile, onUpdate, isLoading }: ExperienceSectionProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newExperience, setNewExperience] = useState<Experience>({
    title: '',
    company: '',
    duration: '',
    description: '',
  });

  const handleAddExperience = async () => {
    if (!newExperience.title || !newExperience.company) {
      toast({ title: 'Please fill in required fields', variant: 'destructive' });
      return;
    }

    try {
      setIsSaving(true);
      const updated = [...(profile?.experience || []), newExperience];
      await onUpdate('experience', updated);
      setNewExperience({ title: '', company: '', duration: '', description: '' });
      setIsAdding(false);
      toast({ title: 'Experience added' });
    } catch (error) {
      toast({ title: 'Failed to add experience', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveExperience = async (index: number) => {
    try {
      setIsSaving(true);
      const updated = (profile?.experience || []).filter((_: any, i: number) => i !== index);
      await onUpdate('experience', updated);
      toast({ title: 'Experience removed' });
    } catch (error) {
      toast({ title: 'Failed to remove experience', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Experience
        </CardTitle>
        {!isAdding && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            disabled={isSaving}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Experience */}
        {isAdding && (
          <div className="p-4 border rounded-lg space-y-3 bg-muted/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Software Engineer"
                  value={newExperience.title}
                  onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="Company name"
                  value={newExperience.company}
                  onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                placeholder="e.g., 3 months (Jan - Mar 2024)"
                value={newExperience.duration}
                onChange={(e) => setNewExperience({ ...newExperience, duration: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe your work and achievements"
                value={newExperience.description || ''}
                onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddExperience}
                disabled={isSaving}
              >
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewExperience({ title: '', company: '', duration: '', description: '' });
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Experience List */}
        <div className="space-y-3">
          {profile?.experience && profile.experience.length > 0 ? (
            profile.experience.map((exp: Experience, index: number) => (
              <div key={index} className="p-4 border rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-base">{exp.title}</p>
                    <p className="text-sm text-muted-foreground">{exp.company}</p>
                    <p className="text-xs text-muted-foreground mt-1">{exp.duration}</p>
                    {exp.description && (
                      <p className="text-sm text-foreground mt-2">{exp.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveExperience(index)}
                    disabled={isSaving}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No experience added yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExperienceSection;
