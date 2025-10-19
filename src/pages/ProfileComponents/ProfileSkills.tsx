import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Edit2, Save, X, Plus, Trash2 } from 'lucide-react';

interface ProfileSkillsProps {
  data: string[];
  onUpdate?: (data: string[]) => void;
}

export const ProfileSkills = ({ data = [], onUpdate }: ProfileSkillsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [skills, setSkills] = useState(data);
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSave = () => {
    onUpdate?.(skills);
    setIsEditing(false);
  };

  const commonSkills = [
    'JavaScript', 'React', 'TypeScript', 'Node.js', 'Python',
    'Java', 'SQL', 'MongoDB', 'Firebase', 'AWS',
    'Docker', 'Git', 'REST API', 'GraphQL', 'CSS',
    'HTML', 'Vue.js', 'Angular', 'Express.js', 'PostgreSQL'
  ];

  const suggestedSkills = commonSkills.filter(
    (skill) => !skills.some((s) => s.toLowerCase() === skill.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Skills</CardTitle>
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
            <div className="flex gap-2">
              <Input
                placeholder="Enter a skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <Button
                variant="outline"
                onClick={handleAddSkill}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>

            {/* Current Skills */}
            {skills.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Your Skills</p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="gap-2 py-1.5 cursor-pointer hover:bg-destructive/80"
                      onClick={() => handleRemoveSkill(skill)}
                    >
                      {skill}
                      <Trash2 className="w-3 h-3" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Skills */}
            {suggestedSkills.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Suggested Skills</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedSkills.slice(0, 10).map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="gap-2 py-1.5 cursor-pointer hover:bg-primary/10"
                      onClick={() => {
                        setSkills([...skills, skill]);
                        handleAddSkill();
                      }}
                    >
                      {skill}
                      <Plus className="w-3 h-3" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={handleSave} className="w-full gap-2">
              <Save className="w-4 h-4" />
              Save Skills
            </Button>
          </>
        ) : (
          <>
            {skills.length === 0 ? (
              <p className="text-muted-foreground text-sm">No skills added yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileSkills;
