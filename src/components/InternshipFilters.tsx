import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, Filter, SortAsc, X, ChevronDown } from 'lucide-react';

interface FilterState {
  search: string;
  sector: string;
  location: string;
  workMode: string;
  education: string;
  minStipend: string;
  sortBy: string;
  selectedSectors?: string[];
  selectedSkills?: string[];
}

interface InternshipFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  sectors: string[];
  locations: string[];
  userProfile?: any;
}

export const InternshipFilters = ({ filters, onFiltersChange, sectors, locations, userProfile }: InternshipFiltersProps) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleMultiSelectToggle = (field: 'selectedSectors' | 'selectedSkills', value: string) => {
    const currentValues = filters[field] || [];
    const isRemoving = currentValues.includes(value);
    const newValues = isRemoving
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    // If removing a sector, also remove skills that are no longer available
    if (field === 'selectedSectors' && isRemoving) {
      // Keep only skills that belong to remaining selected sectors
      const remainingSectors = newValues;
      const availableSkillsForRemainingSectors = userProfile?.skills || [];
      const filteredSkills = (filters.selectedSkills || []).filter(skill => 
        availableSkillsForRemainingSectors.includes(skill)
      );
      onFiltersChange({ ...filters, [field]: newValues, selectedSkills: filteredSkills });
    } else {
      onFiltersChange({ ...filters, [field]: newValues });
    }
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      sector: 'all',
      location: 'all',
      workMode: 'all',
      education: 'all',
      minStipend: userProfile?.minStipend ? userProfile.minStipend.toString() : 'all',
      sortBy: 'ai-recommended',
      selectedSectors: [],
      selectedSkills: []
    });
  };

  const activeFiltersCount = [
    filters.search,
    ...(filters.selectedSectors || []),
    ...(filters.selectedSkills || []),
    filters.workMode !== 'all' ? filters.workMode : null,
    filters.education !== 'all' ? filters.education : null,
    filters.minStipend !== 'all' ? filters.minStipend : null
  ].filter(Boolean).length;

  // Get all available skills from internships data
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const [skillsBySector, setSkillsBySector] = useState<Record<string, string[]>>({});

  // Load skills data
  useEffect(() => {
    const loadSkills = async () => {
      try {
        const response = await fetch('/internships.json');
        if (!response.ok) throw new Error('Failed to fetch internships');
        
        const internships = await response.json();
        
        const skillsSet = new Set<string>();
        const sectorSkillsMap: Record<string, Set<string>> = {};
        
        internships.forEach((internship: any) => {
          const sectors = internship.sector_tags || [];
          const skills = internship.required_skills || [];
          
          skills.forEach((skill: string) => {
            skillsSet.add(skill);
            sectors.forEach((sector: string) => {
              if (!sectorSkillsMap[sector]) sectorSkillsMap[sector] = new Set();
              sectorSkillsMap[sector].add(skill);
            });
          });
        });
        
        setAllSkills(Array.from(skillsSet).sort());
        
        const finalSectorSkills: Record<string, string[]> = {};
        Object.keys(sectorSkillsMap).forEach(sector => {
          finalSectorSkills[sector] = Array.from(sectorSkillsMap[sector]).sort();
        });
        setSkillsBySector(finalSectorSkills);
      } catch (error) {
        console.error('Failed to load skills:', error);
        // Fallback to empty arrays
        setAllSkills([]);
        setSkillsBySector({});
      }
    };
    loadSkills();
  }, []);

  // Get available skills based on selected sectors
  const availableSkills = useMemo(() => {
    if (!filters.selectedSectors || filters.selectedSectors.length === 0) {
      return allSkills;
    }
    const sectorSkills = new Set<string>();
    filters.selectedSectors.forEach(sector => {
      (skillsBySector[sector] || []).forEach(skill => sectorSkills.add(skill));
    });
    return Array.from(sectorSkills).sort();
  }, [filters.selectedSectors, allSkills, skillsBySector]);

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search internships"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10 border-2 rounded-lg h-11 transition-colors focus:border-ring"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="w-full h-11 pl-10 pr-10 py-2 text-sm bg-background border-2 border-input rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            >
              <option value="ai-recommended">AI Recommended</option>
              <option value="recent">Most Recent</option>
              <option value="stipend-high">Highest Stipend</option>
              <option value="stipend-low">Lowest Stipend</option>
              <option value="company">Company A-Z</option>
              <option value="deadline">Deadline Soon</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Clear Filters */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="flex items-center gap-2"
              disabled={activeFiltersCount === 0}
              size="sm"
            >
              <X className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 mt-3">
          {/* Multi-Select Sectors */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal h-10">
                  {(filters.selectedSectors?.length || 0) > 0 
                    ? `${filters.selectedSectors?.length} Sectors` 
                    : 'All Sectors'
                  }
                  <ChevronDown className="ml-auto w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <div className="p-4 max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-1 gap-2">
                    {sectors.map(sector => (
                      <div key={sector} className="flex items-center space-x-2">
                        <Checkbox
                          id={`filter-sector-${sector}`}
                          checked={(filters.selectedSectors || []).includes(sector)}
                          onCheckedChange={() => handleMultiSelectToggle('selectedSectors', sector)}
                        />
                        <Label htmlFor={`filter-sector-${sector}`} className="text-sm font-normal cursor-pointer">
                          {sector}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Multi-Select Skills */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal h-10">
                  {(filters.selectedSkills?.length || 0) > 0 
                    ? `${filters.selectedSkills?.length} Skills` 
                    : 'All Skills'
                  }
                  <ChevronDown className="ml-auto w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0" align="start">
                <div className="p-4 max-h-80 overflow-y-auto">
                  {filters.selectedSectors && filters.selectedSectors.length > 0 ? (
                    filters.selectedSectors.map(sector => {
                      const sectorSkills = skillsBySector[sector] || [];
                      const allSectorSkillsSelected = sectorSkills.length > 0 && sectorSkills.every(skill => (filters.selectedSkills || []).includes(skill));
                      
                      return (
                        <div key={sector} className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-primary">{sector}</h4>
                            {sectorSkills.length > 0 && (
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`select-all-filter-${sector}`}
                                  checked={allSectorSkillsSelected}
                                  onCheckedChange={() => {
                                    if (allSectorSkillsSelected) {
                                      // Remove all sector skills
                                      const newSkills = (filters.selectedSkills || []).filter(skill => !sectorSkills.includes(skill));
                                      onFiltersChange({ ...filters, selectedSkills: newSkills });
                                    } else {
                                      // Add all sector skills
                                      const newSkills = [...new Set([...(filters.selectedSkills || []), ...sectorSkills])];
                                      onFiltersChange({ ...filters, selectedSkills: newSkills });
                                    }
                                  }}
                                />
                                <Label htmlFor={`select-all-filter-${sector}`} className="text-xs text-muted-foreground cursor-pointer">
                                  Select All
                                </Label>
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {sectorSkills.map((skill: string) => (
                              <div key={skill} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`filter-skill-${skill}`}
                                  checked={(filters.selectedSkills || []).includes(skill)}
                                  onCheckedChange={() => handleMultiSelectToggle('selectedSkills', skill)}
                                />
                                <Label htmlFor={`filter-skill-${skill}`} className="text-sm font-normal cursor-pointer">
                                  {skill}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {availableSkills.map((skill: string) => (
                        <div key={skill} className="flex items-center space-x-2">
                          <Checkbox
                            id={`filter-skill-all-${skill}`}
                            checked={(filters.selectedSkills || []).includes(skill)}
                            onCheckedChange={() => handleMultiSelectToggle('selectedSkills', skill)}
                          />
                          <Label htmlFor={`filter-skill-all-${skill}`} className="text-sm font-normal cursor-pointer">
                            {skill}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Work Mode */}
          <div className="relative">
            <select
              value={filters.workMode}
              onChange={(e) => updateFilter('workMode', e.target.value)}
              className="w-full h-11 px-3 pr-10 py-2 text-sm bg-background border-2 border-input rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            >
              <option value="all">All Modes</option>
              <option value="Remote">Remote</option>
              <option value="Onsite">Onsite</option>
              <option value="Hybrid">Hybrid</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Education */}
          <div className="relative">
            <select
              value={filters.education}
              onChange={(e) => updateFilter('education', e.target.value)}
              className="w-full h-11 px-3 pr-10 py-2 text-sm bg-background border-2 border-input rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            >
              <option value="all">All Levels</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Postgraduate">Postgraduate</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Min Stipend */}
          <div className="relative">
            <select
              value={filters.minStipend}
              onChange={(e) => updateFilter('minStipend', e.target.value)}
              className="w-full h-11 px-3 pr-10 py-2 text-sm bg-background border-2 border-input rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            >
              <option value="all">Any Stipend</option>
              {userProfile?.minStipend && (
                <option value={userProfile.minStipend.toString()}>₹{userProfile.minStipend.toLocaleString()}+ (Your Min)</option>
              )}
              <option value="10000">₹10,000+</option>
              <option value="15000">₹15,000+</option>
              <option value="20000">₹20,000+</option>
              <option value="25000">₹25,000+</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Filter Toggle for Mobile */}
          <Button 
            variant="outline" 
            className="sm:hidden" 
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters ({activeFiltersCount})
          </Button>
        </div>

        {/* Mobile Filters Expansion */}
        {showMobileFilters && (
          <div className="sm:hidden mt-4 p-4 border-t border-border">
            <div className="space-y-3">
              {/* Selected Filters Display */}
              {(filters.selectedSectors?.length || 0) > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Selected Sectors:</p>
                  <div className="flex flex-wrap gap-1">
                    {filters.selectedSectors?.map(sector => (
                      <Badge key={sector} variant="default" className="text-xs">
                        {sector}
                        <X 
                          className="w-3 h-3 ml-1 cursor-pointer" 
                          onClick={() => handleMultiSelectToggle('selectedSectors', sector)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {(filters.selectedSkills?.length || 0) > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Selected Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {filters.selectedSkills?.map(skill => (
                      <Badge key={skill} variant="default" className="text-xs">
                        {skill}
                        <X 
                          className="w-3 h-3 ml-1 cursor-pointer" 
                          onClick={() => handleMultiSelectToggle('selectedSkills', skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};