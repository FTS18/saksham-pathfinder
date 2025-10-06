import { useState } from 'react';
import { SearchableSelect } from './SearchableSelect';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const SearchableSelectDemo = () => {
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const sectors = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Marketing', 
    'E-commerce', 'Manufacturing', 'Media', 'Gaming', 'Consulting', 
    'Banking', 'Automotive', 'Construction', 'Hospitality', 'Travel', 
    'NGO', 'Research', 'Sales', 'Operations', 'Electronics', 'Infrastructure'
  ];

  const skills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'Java', 'C++', 'HTML', 'CSS', 
    'SQL', 'AWS', 'MongoDB', 'TypeScript', 'Docker', 'Medical Research', 
    'Clinical Trials', 'Healthcare IT', 'Biotechnology', 'Patient Care',
    'Financial Analysis', 'Investment Banking', 'Risk Management', 'Accounting',
    'Digital Marketing', 'Content Marketing', 'Social Media Marketing', 'SEO'
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Improved SearchableSelect Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Sectors of Interest
            </label>
            <SearchableSelect
              options={sectors}
              selected={selectedSectors}
              onSelectionChange={setSelectedSectors}
              placeholder="Select sectors..."
              maxHeight="250px"
            />
            {selectedSectors.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Selected: {selectedSectors.join(', ')}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Your Skills
            </label>
            <SearchableSelect
              options={skills}
              selected={selectedSkills}
              onSelectionChange={setSelectedSkills}
              placeholder="Select skills..."
              maxHeight="300px"
            />
            {selectedSkills.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Selected: {selectedSkills.join(', ')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};