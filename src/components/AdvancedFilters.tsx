import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Filter, X } from 'lucide-react';
import { useState } from 'react';

interface FilterState {
  salaryRange: [number, number];
  companySize: string;
  workMode: string[];
  sectors: string[];
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  availableSectors: string[];
}

const workModes = ['Remote', 'Hybrid', 'On-site'];
const companySizes = ['Startup (1-50)', 'Medium (51-500)', 'Large (500+)', 'Any'];

export const AdvancedFilters = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  availableSectors 
}: AdvancedFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSalaryChange = (value: number[]) => {
    onFiltersChange({ ...filters, salaryRange: [value[0], value[1]] });
  };

  const handleCompanySizeChange = (value: string) => {
    onFiltersChange({ ...filters, companySize: value });
  };

  const handleWorkModeToggle = (mode: string) => {
    const newModes = filters.workMode.includes(mode)
      ? filters.workMode.filter(m => m !== mode)
      : [...filters.workMode, mode];
    onFiltersChange({ ...filters, workMode: newModes });
  };

  const handleSectorToggle = (sector: string) => {
    const newSectors = filters.sectors.includes(sector)
      ? filters.sectors.filter(s => s !== sector)
      : [...filters.sectors, sector];
    onFiltersChange({ ...filters, sectors: newSectors });
  };

  const hasActiveFilters = 
    filters.salaryRange[0] > 0 || 
    filters.salaryRange[1] < 100000 ||
    filters.companySize !== 'Any' ||
    filters.workMode.length > 0 ||
    filters.sectors.length > 0;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5 text-primary" />
            Advanced Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {[
                  filters.workMode.length,
                  filters.sectors.length,
                  filters.companySize !== 'Any' ? 1 : 0,
                  (filters.salaryRange[0] > 0 || filters.salaryRange[1] < 100000) ? 1 : 0
                ].reduce((a, b) => a + b, 0)}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                <X className="w-4 h-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Hide' : 'Show'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Salary Range */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Stipend Range: ₹{filters.salaryRange[0].toLocaleString()} - ₹{filters.salaryRange[1].toLocaleString()}
            </label>
            <Slider
              value={filters.salaryRange}
              onValueChange={handleSalaryChange}
              max={100000}
              min={0}
              step={5000}
              className="w-full"
            />
          </div>

          {/* Company Size */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Company Size</label>
            <Select value={filters.companySize} onValueChange={handleCompanySizeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select company size" />
              </SelectTrigger>
              <SelectContent>
                {companySizes.map(size => (
                  <SelectItem key={size} value={size}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Work Mode */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Work Mode</label>
            <div className="flex flex-wrap gap-2">
              {workModes.map(mode => (
                <Badge
                  key={mode}
                  variant={filters.workMode.includes(mode) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleWorkModeToggle(mode)}
                >
                  {mode}
                </Badge>
              ))}
            </div>
          </div>

          {/* Sectors */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Sectors</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {availableSectors.slice(0, 12).map(sector => (
                <Badge
                  key={sector}
                  variant={filters.sectors.includes(sector) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleSectorToggle(sector)}
                >
                  {sector}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};