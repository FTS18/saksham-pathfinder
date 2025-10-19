import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EducationSelector } from '@/components/EducationSelector';

interface Education {
  degree: string;
  institution: string;
  year: string;
}

interface EducationSectionProps {
  profile: any;
  onUpdate: (key: string, value: any) => Promise<void>;
  isLoading: boolean;
}

export const EducationSection = ({ profile, onUpdate, isLoading }: EducationSectionProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newEducation, setNewEducation] = useState<Education>({
    degree: '',
    institution: '',
    year: new Date().getFullYear().toString(),
  });

  const handleAddEducation = async () => {
    if (!newEducation.degree || !newEducation.institution) {
      toast({ title: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    try {
      setIsSaving(true);
      const updated = [...(profile?.education || []), newEducation];
      await onUpdate('education', updated);
      setNewEducation({ degree: '', institution: '', year: new Date().getFullYear().toString() });
      setIsAdding(false);
      toast({ title: 'Education added' });
    } catch (error) {
      toast({ title: 'Failed to add education', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveEducation = async (index: number) => {
    try {
      setIsSaving(true);
      const updated = (profile?.education || []).filter((_: any, i: number) => i !== index);
      await onUpdate('education', updated);
      toast({ title: 'Education removed' });
    } catch (error) {
      toast({ title: 'Failed to remove education', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          Education
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
        {/* Add New Education */}
        {isAdding && (
          <div className="p-4 border rounded-lg space-y-3 bg-muted/50">
            <div className="space-y-2">
              <Label htmlFor="degree">Degree</Label>
              <EducationSelector
                degree={newEducation.degree}
                year={newEducation.year}
                onDegreeChange={(degree) => setNewEducation({ ...newEducation, degree })}
                onYearChange={(year) => setNewEducation({ ...newEducation, year })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution">Institution</Label>
              <Input
                id="institution"
                placeholder="University/Institute name"
                value={newEducation.institution}
                onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddEducation}
                disabled={isSaving}
              >
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewEducation({ degree: '', institution: '', year: new Date().getFullYear().toString() });
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Education List */}
        <div className="space-y-3">
          {profile?.education && profile.education.length > 0 ? (
            profile.education.map((edu: Education, index: number) => (
              <div key={index} className="p-4 border rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-base">{edu.degree}</p>
                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                    <p className="text-xs text-muted-foreground mt-1">Graduation: {edu.year}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveEducation(index)}
                    disabled={isSaving}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No education added yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EducationSection;
