import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, Filter, SortAsc, X, ChevronDown } from 'lucide-react';
import { SearchSuggestions } from './SearchSuggestions';
import { SmartFilterService } from '@/services/smartFilterService';

interface FilterState {
  search: string;
  sector: string;
  location: string;
  workMode: string;
  education: string;
  minStipend: string;
  minAiScore?: string;
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
      minAiScore: 'all',
      sortBy: 'ai-recommended',
      selectedSectors: [],
      selectedSkills: []
    });
  };

  const applySmartFilters = (preset?: 'high-paying' | 'remote-friendly' | 'skill-focused' | 'location-flexible') => {
    if (!userProfile) return;
    
    let smartFilters: FilterState;
    
    if (preset) {
      // Apply preset filters
      const presetFilters = SmartFilterService.getPresetFilters(preset);
      smartFilters = { ...filters, ...presetFilters };
    } else {
      // Generate smart filters based on user profile
      smartFilters = SmartFilterService.generateSmartFilters(userProfile, {
        prioritizeHighStipend: true,
        includeRemoteWork: true,
        strictSkillMatching: false,
        locationRadius: 'nearby'
      });
    }
    
    onFiltersChange(smartFilters);
  };

  const activeFiltersCount = [
    filters.search,
    ...(filters.selectedSectors || []),
    ...(filters.selectedSkills || []),
    filters.workMode !== 'all' ? filters.workMode : null,
    filters.education !== 'all' ? filters.education : null,
    filters.minStipend !== 'all' ? filters.minStipend : null,
    filters.minAiScore !== 'all' ? filters.minAiScore : null
  ].filter(Boolean).length;

  // Check if smart filters are active
  const hasSmartFilters = userProfile && (
    (filters.selectedSectors && filters.selectedSectors.length > 0) ||
    (filters.selectedSkills && filters.selectedSkills.length > 0) ||
    (filters.minStipend !== 'all' && parseInt(filters.minStipend) >= 10000)
  );

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
          {/* Search with Suggestions */}
          <div className="lg:col-span-2">
            <SearchSuggestions
              value={filters.search}
              onChange={(value) => updateFilter('search', value)}
              suggestions={[...sectors, ...allSkills, 'Remote', 'Hybrid', 'Full-time', 'Part-time']}
              placeholder="Search internships, skills, companies..."
              className="w-full"
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
              <option value="ai-recommended">AI Score (High to Low)</option>
              <option value="recent">Most Recent</option>
              <option value="stipend-high">Highest Stipend</option>
              <option value="stipend-low">Lowest Stipend</option>
              <option value="company">Company A-Z</option>
              <option value="deadline">Deadline Soon</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Smart Filters & Clear */}
          <div className="flex gap-2">
            {userProfile && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    className={`flex items-center gap-2 transition-all ${
                      hasSmartFilters 
                        ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-lg' 
                        : 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70'
                    }`}
                    size="sm"
                  >
                    <Filter className="w-4 h-4" />
                    {hasSmartFilters ? 'Smart Active' : 'Smart Filter'}
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="start">
                  <div className="space-y-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-left hover:bg-primary/10"
                      onClick={() => applySmartFilters()}
                    >
                      <div className="flex flex-col items-start">
                        <span>🎯 My Profile Match</span>
                        <span className="text-xs text-muted-foreground">Based on your skills & interests</span>
                      </div>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-left"
                      onClick={() => applySmartFilters('high-paying')}
                    >
                      💰 High-Paying (₹15k+)
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-left"
                      onClick={() => applySmartFilters('remote-friendly')}
                    >
                      🏠 Remote Work
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-left"
                      onClick={() => applySmartFilters('skill-focused')}
                    >
                      🛠️ Skill-Based
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 mt-3">
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

          {/* AI Score Filter */}
          <div className="relative">
            <select
              value={filters.minAiScore || 'all'}
              onChange={(e) => updateFilter('minAiScore', e.target.value)}
              className="w-full h-11 px-3 pr-10 py-2 text-sm bg-background border-2 border-input rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            >
              <option value="all">Any AI Score</option>
              <option value="90">90+ (Excellent)</option>
              <option value="85">85+ (AI Recommended)</option>
              <option value="80">80+ (Very Good)</option>
              <option value="75">75+ (Good Match)</option>
              <option value="70">70+ (Fair Match)</option>
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

        {/* Smart Filter Status & Mobile Filters */}
        {(hasSmartFilters || showMobileFilters) && (
          <div className="mt-4 p-4 border-t border-border">
            {/* Smart Filter Status */}
            {hasSmartFilters && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    🎯 Smart Filters Active
                  </p>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Showing personalized matches based on your profile preferences
                </p>
              </div>
            )}
            
            {/* Mobile Filters Expansion */}
            {showMobileFilters && (
              <div className="sm:hidden space-y-3">
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
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};