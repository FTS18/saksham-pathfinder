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

  // Load skills data from Firebase with proper error handling
  useEffect(() => {
    const loadSkills = async () => {
      try {
        // Import Firebase service dynamically to handle quota errors
        const { extractAllSkills, extractSkillsBySector } = await import('@/lib/dataExtractor');
        
        // Extract skills from Firebase with caching
        const [allSkillsList, skillsMap] = await Promise.all([
          extractAllSkills(),
          extractSkillsBySector()
        ]);
        
        setAllSkills(allSkillsList || []);
        setSkillsBySector(skillsMap || {});
        
      } catch (error) {
        // Firebase quota exceeded or unavailable - use fallback static skills
        console.warn('Firebase unavailable or quota exceeded, using fallback skills:', error);
        
        // Provide default fallback skills by sector
        const fallbackSkills = {
          'Technology': ['JavaScript', 'Python', 'React', 'Node.js', 'Java', 'TypeScript', 'SQL', 'AWS', 'Docker'],
          'Finance': ['Excel', 'Financial Analysis', 'Accounting', 'Risk Management', 'Trading'],
          'Healthcare': ['Medical Research', 'Healthcare IT', 'Biotechnology', 'Clinical Trials'],
          'Marketing': ['Digital Marketing', 'SEO', 'Content Marketing', 'Analytics', 'Social Media'],
          'Education': ['Curriculum Development', 'E-learning', 'Teaching', 'Content Creation']
        };
        
        const allFallbackSkills = Object.values(fallbackSkills)
          .flat()
          .filter((skill, index, self) => self.indexOf(skill) === index)
          .sort();
        
        setAllSkills(allFallbackSkills);
        setSkillsBySector(fallbackSkills);
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
        <div className="flex flex-wrap items-center justify-start gap-4">
          {/* Sort */}
          <div className="relative flex-none min-w-[200px] max-w-xs">
            <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="w-full h-9 pl-9 pr-8 py-1 text-sm bg-background border border-input rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              aria-label="Sort internships by"
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
                        <span> My Profile Match</span>
                        <span className="text-xs text-muted-foreground">Based on your skills & interests</span>
                      </div>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-left"
                      onClick={() => applySmartFilters('high-paying')}
                    >
                       High-Paying (₹15k+)
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-left"
                      onClick={() => applySmartFilters('remote-friendly')}
                    >
                       Remote Work
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
            <Button 
              className="flex items-center gap-2"
              size="sm"
            >
              Apply Filters
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          {/* Multi-Select Keywords */}
          <div className="w-full sm:w-auto min-w-[140px]">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between text-left font-normal h-9 text-xs rounded-xl">
                  {(filters.selectedSectors?.length || 0) > 0 
                    ? `${filters.selectedSectors?.length} Keywords` 
                    : 'All Keywords'
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

          {/* Work Mode */}
          <div className="relative w-full sm:w-auto min-w-[130px]">
            <select
              value={filters.workMode}
              onChange={(e) => updateFilter('workMode', e.target.value)}
              className="w-full h-9 px-3 pr-8 py-1 text-xs bg-background border border-input rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              aria-label="Filter by work mode"
            >
              <option value="all">All Modes</option>
              <option value="Remote">Remote</option>
              <option value="Onsite">Onsite</option>
              <option value="Hybrid">Hybrid</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Education */}
          <div className="relative w-full sm:w-auto min-w-[130px]">
            <select
              value={filters.education}
              onChange={(e) => updateFilter('education', e.target.value)}
              className="w-full h-9 px-3 pr-8 py-1 text-xs bg-background border border-input rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              aria-label="Filter by education level"
            >
              <option value="all">All Levels</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Postgraduate">Postgraduate</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Min Stipend */}
          <div className="relative w-full sm:w-auto min-w-[130px]">
            <select
              value={filters.minStipend}
              onChange={(e) => updateFilter('minStipend', e.target.value)}
              className="w-full h-9 px-3 pr-8 py-1 text-xs bg-background border border-input rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              aria-label="Filter by minimum stipend"
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
          <div className="relative w-full sm:w-auto min-w-[130px]">
            <select
              value={filters.minAiScore || 'all'}
              onChange={(e) => updateFilter('minAiScore', e.target.value)}
              className="w-full h-9 px-3 pr-8 py-1 text-xs bg-background border border-input rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              aria-label="Filter by AI match score"
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
                     Smart Filters Active
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