import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

export default function PostJob() {
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');

  const addSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Post New Job</h1>
        <p className="text-muted-foreground">Create a new internship opportunity</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" placeholder="e.g. Frontend Developer Intern" />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input id="company" placeholder="Your company name" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="e.g. Mumbai, India" />
            </div>
            <div>
              <Label htmlFor="workMode">Work Mode</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select work mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="stipend">Stipend</Label>
              <Input id="stipend" placeholder="e.g. ₹25,000/month" />
            </div>
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input id="duration" placeholder="e.g. 6 months" />
            </div>
            <div>
              <Label htmlFor="openings">Number of Openings</Label>
              <Input id="openings" type="number" placeholder="e.g. 5" />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Job Description</Label>
            <Textarea 
              id="description" 
              placeholder="Describe the role, responsibilities, and what the intern will learn..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="skills">Required Skills</Label>
            <div className="flex gap-2 mb-2">
              <Input 
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
              <Button type="button" onClick={addSkill}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="deadline">Application Deadline</Label>
            <Input id="deadline" type="date" />
          </div>

          <div className="flex gap-4 pt-4">
            <Button className="flex-1">Post Job</Button>
            <Button variant="outline" className="flex-1">Save as Draft</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}