import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Edit2, Save, X, Plus, Trash2 } from 'lucide-react';

interface Experience {
  id?: string;
  company?: string;
  position?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
}

interface ProfileExperienceProps {
  data: Experience[];
  onUpdate?: (data: Experience[]) => void;
}

export const ProfileExperience = ({ data = [], onUpdate }: ProfileExperienceProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(data);

  const handleAddExperience = () => {
    setFormData([...formData, { id: Date.now().toString() }]);
  };

  const handleRemoveExperience = (id: string | undefined) => {
    setFormData(formData.filter((exp) => exp.id !== id));
  };

  const handleUpdateExperience = (id: string | undefined, field: keyof Experience, value: any) => {
    setFormData(
      formData.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    );
  };

  const handleSave = () => {
    onUpdate?.(formData);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Experience</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            {formData.map((exp) => (
              <div key={exp.id} className="space-y-3 p-4 border rounded-lg">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Company"
                    value={exp.company || ''}
                    onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)}
                  />
                  <Input
                    placeholder="Position"
                    value={exp.position || ''}
                    onChange={(e) => handleUpdateExperience(exp.id, 'position', e.target.value)}
                  />
                </div>
                <textarea
                  placeholder="Description of your role"
                  value={exp.description || ''}
                  onChange={(e) => handleUpdateExperience(exp.id, 'description', e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                  rows={2}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Start Date"
                    type="month"
                    value={exp.startDate || ''}
                    onChange={(e) => handleUpdateExperience(exp.id, 'startDate', e.target.value)}
                  />
                  <Input
                    placeholder="End Date"
                    type="month"
                    value={exp.endDate || ''}
                    onChange={(e) => handleUpdateExperience(exp.id, 'endDate', e.target.value)}
                    disabled={exp.current}
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exp.current || false}
                    onChange={(e) => handleUpdateExperience(exp.id, 'current', e.target.checked)}
                  />
                  <span className="text-sm">Currently working here</span>
                </label>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveExperience(exp.id)}
                  className="w-full gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={handleAddExperience}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Experience
            </Button>
            <Button onClick={handleSave} className="w-full gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </>
        ) : (
          <>
            {formData.length === 0 ? (
              <p className="text-muted-foreground text-sm">No experience information provided</p>
            ) : (
              formData.map((exp, idx) => (
                <div key={idx} className="border-b pb-4">
                  <p className="font-medium">{exp.position}</p>
                  <p className="text-sm text-muted-foreground">{exp.company}</p>
                  <p className="text-xs text-muted-foreground">
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </p>
                  {exp.description && (
                    <p className="text-sm mt-2">{exp.description}</p>
                  )}
                </div>
              ))
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileExperience;
