import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import InternshipMigrationService, { FirebaseInternship } from '@/services/internshipMigrationService';

interface InternshipFormProps {
  internship?: FirebaseInternship | null;
  onSave: () => void;
  onCancel: () => void;
}

export const InternshipForm = ({ internship, onSave, onCancel }: InternshipFormProps) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    role: '',
    company: '',
    location: '',
    stipend: '',
    duration: '',
    description: '',
    work_mode: 'Onsite',
    type: 'Internship',
    openings: 1,
    application_deadline: '',
    posted_date: new Date().toISOString().split('T')[0],
    apply_link: '',
    featured: false,
    status: 'active' as 'active' | 'inactive' | 'expired',
    required_skills: [] as string[],
    sector_tags: [] as string[],
    preferred_education_levels: [] as string[],
    responsibilities: [] as string[],
    perks: [] as string[],
    recruiterId: currentUser?.uid || ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [newSector, setNewSector] = useState('');
  const [newEducation, setNewEducation] = useState('');
  const [newResponsibility, setNewResponsibility] = useState('');
  const [newPerk, setNewPerk] = useState('');

  useEffect(() => {
    if (internship) {
      setFormData({
        title: internship.title || '',
        role: internship.role || '',
        company: internship.company || '',
        location: typeof internship.location === 'string' ? internship.location : internship.location?.city || '',
        stipend: internship.stipend || '',
        duration: internship.duration || '',
        description: internship.description || '',
        work_mode: internship.work_mode || 'Onsite',
        type: internship.type || 'Internship',
        openings: internship.openings || 1,
        application_deadline: internship.application_deadline || '',
        posted_date: internship.posted_date || new Date().toISOString().split('T')[0],
        apply_link: internship.apply_link || '',
        featured: internship.featured || false,
        status: internship.status || 'active',
        required_skills: internship.required_skills || [],
        sector_tags: internship.sector_tags || [],
        preferred_education_levels: internship.preferred_education_levels || [],
        responsibilities: internship.responsibilities || [],
        perks: internship.perks || [],
        recruiterId: internship.recruiterId || currentUser?.uid || ''
      });
    }
  }, [internship, currentUser?.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const internshipData = {
        ...formData,
        pmis_id: internship?.pmis_id || `PMIS-${new Date().getFullYear()}-${Date.now()}`
      };

      if (internship?.id) {
        // Update existing internship
        await InternshipMigrationService.updateInternship(internship.id, internshipData);
      } else {
        // Create new internship
        await InternshipMigrationService.createInternship(internshipData);
      }
      
      onSave();
    } catch (error) {
      console.error('Failed to save internship:', error);
    }
  };

  const addItem = (field: keyof typeof formData, value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()]
      }));
      setter('');
    }
  };

  const removeItem = (field: keyof typeof formData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Job Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="role">Role *</Label>
          <Input
            id="role"
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="company">Company *</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="stipend">Stipend *</Label>
          <Input
            id="stipend"
            value={formData.stipend}
            onChange={(e) => setFormData(prev => ({ ...prev, stipend: e.target.value }))}
            placeholder="₹15,000"
            required
          />
        </div>
        <div>
          <Label htmlFor="duration">Duration *</Label>
          <Input
            id="duration"
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
            placeholder="6 months"
            required
          />
        </div>
        <div>
          <Label htmlFor="work_mode">Work Mode</Label>
          <Select value={formData.work_mode} onValueChange={(value) => setFormData(prev => ({ ...prev, work_mode: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Onsite">Onsite</SelectItem>
              <SelectItem value="Remote">Remote</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Internship">Internship</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
              <SelectItem value="Full-time">Full-time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="openings">Number of Openings</Label>
          <Input
            id="openings"
            type="number"
            value={formData.openings}
            onChange={(e) => setFormData(prev => ({ ...prev, openings: parseInt(e.target.value) || 1 }))}
            min="1"
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value: 'active' | 'inactive' | 'expired') => setFormData(prev => ({ ...prev, status: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="application_deadline">Application Deadline</Label>
          <Input
            id="application_deadline"
            type="date"
            value={formData.application_deadline}
            onChange={(e) => setFormData(prev => ({ ...prev, application_deadline: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="apply_link">Apply Link</Label>
          <Input
            id="apply_link"
            type="url"
            value={formData.apply_link}
            onChange={(e) => setFormData(prev => ({ ...prev, apply_link: e.target.value }))}
            placeholder="https://company.com/apply"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          required
        />
      </div>

      {/* Required Skills */}
      <div>
        <Label>Required Skills</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a skill"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('required_skills', newSkill, setNewSkill))}
          />
          <Button type="button" onClick={() => addItem('required_skills', newSkill, setNewSkill)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.required_skills.map((skill, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {skill}
              <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem('required_skills', index)} />
            </Badge>
          ))}
        </div>
      </div>

      {/* Sector Tags */}
      <div>
        <Label>Sector Tags</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newSector}
            onChange={(e) => setNewSector(e.target.value)}
            placeholder="Add a sector"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('sector_tags', newSector, setNewSector))}
          />
          <Button type="button" onClick={() => addItem('sector_tags', newSector, setNewSector)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.sector_tags.map((sector, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-1">
              {sector}
              <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem('sector_tags', index)} />
            </Badge>
          ))}
        </div>
      </div>

      {/* Education Levels */}
      <div>
        <Label>Preferred Education Levels</Label>
        <div className="flex gap-2 mb-2">
          <Select value={newEducation} onValueChange={setNewEducation}>
            <SelectTrigger>
              <SelectValue placeholder="Select education level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Undergraduate">Undergraduate</SelectItem>
              <SelectItem value="Postgraduate">Postgraduate</SelectItem>
              <SelectItem value="Diploma">Diploma</SelectItem>
              <SelectItem value="PhD">PhD</SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" onClick={() => addItem('preferred_education_levels', newEducation, setNewEducation)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.preferred_education_levels.map((level, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-1">
              {level}
              <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem('preferred_education_levels', index)} />
            </Badge>
          ))}
        </div>
      </div>

      {/* Responsibilities */}
      <div>
        <Label>Responsibilities</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newResponsibility}
            onChange={(e) => setNewResponsibility(e.target.value)}
            placeholder="Add a responsibility"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('responsibilities', newResponsibility, setNewResponsibility))}
          />
          <Button type="button" onClick={() => addItem('responsibilities', newResponsibility, setNewResponsibility)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-1">
          {formData.responsibilities.map((resp, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
              <span className="flex-1 text-sm">{resp}</span>
              <X className="w-4 h-4 cursor-pointer" onClick={() => removeItem('responsibilities', index)} />
            </div>
          ))}
        </div>
      </div>

      {/* Perks */}
      <div>
        <Label>Perks</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newPerk}
            onChange={(e) => setNewPerk(e.target.value)}
            placeholder="Add a perk"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('perks', newPerk, setNewPerk))}
          />
          <Button type="button" onClick={() => addItem('perks', newPerk, setNewPerk)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.perks.map((perk, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {perk}
              <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem('perks', index)} />
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="featured"
          checked={formData.featured}
          onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
        />
        <Label htmlFor="featured">Featured Internship</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {internship ? 'Update' : 'Create'} Internship
        </Button>
      </div>
    </form>
  );
};