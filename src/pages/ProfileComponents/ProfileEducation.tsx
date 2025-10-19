import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Edit2, Save, X, Plus, Trash2 } from 'lucide-react';

interface Education {
  id?: string;
  institution?: string;
  degree?: string;
  field?: string;
  startYear?: string;
  endYear?: string;
  gpa?: string;
}

interface ProfileEducationProps {
  data: Education[];
  onUpdate?: (data: Education[]) => void;
}

export const ProfileEducation = ({ data = [], onUpdate }: ProfileEducationProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(data);

  const handleAddEducation = () => {
    setFormData([...formData, { id: Date.now().toString() }]);
  };

  const handleRemoveEducation = (id: string | undefined) => {
    setFormData(formData.filter((edu) => edu.id !== id));
  };

  const handleUpdateEducation = (id: string | undefined, field: keyof Education, value: string) => {
    setFormData(
      formData.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
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
        <CardTitle>Education</CardTitle>
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
            {formData.map((edu) => (
              <div key={edu.id} className="space-y-3 p-4 border rounded-lg">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Institution"
                    value={edu.institution || ''}
                    onChange={(e) => handleUpdateEducation(edu.id, 'institution', e.target.value)}
                  />
                  <Input
                    placeholder="Degree"
                    value={edu.degree || ''}
                    onChange={(e) => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                  />
                </div>
                <Input
                  placeholder="Field of Study"
                  value={edu.field || ''}
                  onChange={(e) => handleUpdateEducation(edu.id, 'field', e.target.value)}
                />
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    placeholder="Start Year"
                    type="number"
                    value={edu.startYear || ''}
                    onChange={(e) => handleUpdateEducation(edu.id, 'startYear', e.target.value)}
                  />
                  <Input
                    placeholder="End Year"
                    type="number"
                    value={edu.endYear || ''}
                    onChange={(e) => handleUpdateEducation(edu.id, 'endYear', e.target.value)}
                  />
                  <Input
                    placeholder="GPA"
                    value={edu.gpa || ''}
                    onChange={(e) => handleUpdateEducation(edu.id, 'gpa', e.target.value)}
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveEducation(edu.id)}
                  className="w-full gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={handleAddEducation}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Education
            </Button>
            <Button onClick={handleSave} className="w-full gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </>
        ) : (
          <>
            {formData.length === 0 ? (
              <p className="text-muted-foreground text-sm">No education information provided</p>
            ) : (
              formData.map((edu, idx) => (
                <div key={idx} className="border-b pb-4">
                  <p className="font-medium">{edu.degree} in {edu.field}</p>
                  <p className="text-sm text-muted-foreground">{edu.institution}</p>
                  <p className="text-xs text-muted-foreground">
                    {edu.startYear} - {edu.endYear} {edu.gpa && `• GPA: ${edu.gpa}`}
                  </p>
                </div>
              ))
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileEducation;
