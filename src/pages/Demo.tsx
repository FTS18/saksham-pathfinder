import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LocationSelector } from '@/components/LocationSelector';
import { PhoneInput } from '@/components/PhoneInput';
import { CurrencyInput } from '@/components/CurrencyInput';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import { t } from '@/lib/translation';

const Demo = () => {
  const [location, setLocation] = useState({ country: '', state: '', city: '' });
  const [phone, setPhone] = useState('');
  const [stipend, setStipend] = useState(0);
  const [sectors, setSectors] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSector, setNewSector] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const sectorsList = ['Technology', 'Healthcare', 'Finance', 'Education', 'Marketing', 'E-commerce', 'Manufacturing', 'Media', 'Gaming', 'Consulting'];
  
  const skillsBySection: Record<string, string[]> = {
    'Technology': ['JavaScript', 'Python', 'React', 'Node.js', 'Java', 'C++', 'HTML', 'CSS', 'SQL', 'AWS'],
    'Healthcare': ['Medical Research', 'Clinical Trials', 'Healthcare IT', 'Biotechnology', 'Medical Writing'],
    'Finance': ['Financial Analysis', 'Investment Banking', 'Risk Management', 'Accounting', 'Trading'],
    'Education': ['Curriculum Development', 'Educational Technology', 'Teaching', 'E-learning'],
    'Marketing': ['Digital Marketing', 'Content Marketing', 'Social Media Marketing', 'SEO', 'Analytics']
  };

  const getAvailableSkills = () => {
    if (sectors.length === 0) return [];
    const allSkills = new Set<string>();
    sectors.forEach(sector => {
      const sectorSkills = skillsBySection[sector] || [];
      sectorSkills.forEach(skill => allSkills.add(skill));
    });
    return Array.from(allSkills);
  };

  const addSector = (sector?: string) => {
    const sectorToAdd = sector || newSector.trim();
    if (sectorToAdd && !sectors.includes(sectorToAdd)) {
      setSectors(prev => [...prev, sectorToAdd]);
      setNewSector('');
    }
  };

  const addSkill = (skill?: string) => {
    const skillToAdd = skill || newSkill.trim();
    if (skillToAdd && !skills.includes(skillToAdd) && sectors.length > 0) {
      setSkills(prev => [...prev, skillToAdd]);
      setNewSkill('');
    }
  };

  const removeSector = (sector: string) => {
    setSectors(prev => prev.filter(s => s !== sector));
  };

  const removeSkill = (skill: string) => {
    setSkills(prev => prev.filter(s => s !== skill));
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl pt-20">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Feature Demo</h1>
          <LanguageSelector />
        </div>

        {/* Location Selector Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Location Selector with Cascading Dropdowns</CardTitle>
          </CardHeader>
          <CardContent>
            <LocationSelector
              value={location}
              onChange={setLocation}
              label="Select Location"
            />
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Selected:</strong> {location.country && `${location.country}`}
                {location.state && ` > ${location.state}`}
                {location.city && ` > ${location.city}`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Phone Input Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Phone Input with Auto Country Code</CardTitle>
          </CardHeader>
          <CardContent>
            <PhoneInput
              value={phone}
              onChange={setPhone}
              country={location.country}
              label="Phone Number"
              placeholder="1234567890"
            />
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Phone:</strong> {phone || 'Not entered'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Currency Input Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Currency Input with Auto Symbol</CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyInput
              value={stipend}
              onChange={setStipend}
              country={location.country}
              label="Expected Stipend"
              placeholder="15000"
            />
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Stipend:</strong> {stipend > 0 ? stipend.toLocaleString() : 'Not set'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sectors Before Skills Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Sectors Before Skills (Conditional Skills)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sectors */}
            <div className="space-y-4">
              <Label className="text-lg font-medium">{t('profile.sectors')}</Label>
              <div className="flex gap-2">
                <Input
                  value={newSector}
                  onChange={(e) => setNewSector(e.target.value)}
                  placeholder="Type sector name..."
                  onKeyPress={(e) => e.key === 'Enter' && addSector()}
                />
                <Button onClick={() => addSector()} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sectorsList.map((sector) => (
                  <Button
                    key={sector}
                    variant={sectors.includes(sector) ? "default" : "outline"}
                    size="sm"
                    onClick={() => sectors.includes(sector) ? removeSector(sector) : addSector(sector)}
                  >
                    {sector}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {sectors.map((sector, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {sector}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive"
                      onClick={() => removeSector(sector)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <Label className="text-lg font-medium">{t('profile.skills')}</Label>
              {sectors.length === 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {t('profile.selectSectorsFirst')}
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder={sectors.length > 0 ? "Type skill name..." : "Select sectors first"}
                  onKeyPress={(e) => e.key === 'Enter' && sectors.length > 0 && addSkill()}
                  disabled={sectors.length === 0}
                />
                <Button onClick={() => addSkill()} size="sm" disabled={sectors.length === 0}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {sectors.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {getAvailableSkills().map((skill) => (
                    <Button
                      key={skill}
                      variant={skills.includes(skill) ? "default" : "outline"}
                      size="sm"
                      onClick={() => skills.includes(skill) ? removeSkill(skill) : addSkill(skill)}
                    >
                      {skill}
                    </Button>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive"
                      onClick={() => removeSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Location:</strong> {location.city ? `${location.city}, ${location.state}, ${location.country}` : 'Not selected'}</p>
              <p><strong>Phone:</strong> {phone || 'Not entered'}</p>
              <p><strong>Stipend:</strong> {stipend > 0 ? `${stipend.toLocaleString()}` : 'Not set'}</p>
              <p><strong>Sectors:</strong> {sectors.length > 0 ? sectors.join(', ') : 'None selected'}</p>
              <p><strong>Skills:</strong> {skills.length > 0 ? skills.join(', ') : 'None selected'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Demo;