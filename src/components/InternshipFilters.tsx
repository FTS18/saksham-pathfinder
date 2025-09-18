import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, SortAsc, X, ChevronDown } from 'lucide-react';

interface FilterState {
  search: string;
  sector: string;
  location: string;
  workMode: string;
  education: string;
  minStipend: string;
  sortBy: string;
}

interface InternshipFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  sectors: string[];
  locations: string[];
}

export const InternshipFilters = ({ filters, onFiltersChange, sectors, locations }: InternshipFiltersProps) => {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      sector: 'all',
      location: 'all',
      workMode: 'all',
      education: 'all',
      minStipend: 'all',
      sortBy: 'recent'
    });
  };

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'recent' && v !== 'all').length;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search internships, companies..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="w-full h-10 pl-10 pr-10 py-2 text-sm bg-background border border-input rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
            >
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-3">
          {/* Sector */}
          <div className="relative">
            <select
              value={filters.sector}
              onChange={(e) => updateFilter('sector', e.target.value)}
              className="w-full h-10 px-3 pr-10 py-2 text-sm bg-background border border-input rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Sectors</option>
              {sectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Location */}
          <div className="relative">
            <select
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
              className="w-full h-10 px-3 pr-10 py-2 text-sm bg-background border border-input rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Work Mode */}
          <div className="relative">
            <select
              value={filters.workMode}
              onChange={(e) => updateFilter('workMode', e.target.value)}
              className="w-full h-10 px-3 pr-10 py-2 text-sm bg-background border border-input rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
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
              className="w-full h-10 px-3 pr-10 py-2 text-sm bg-background border border-input rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
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
              className="w-full h-10 px-3 pr-10 py-2 text-sm bg-background border border-input rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Any Stipend</option>
              <option value="10000">₹10,000+</option>
              <option value="20000">₹20,000+</option>
              <option value="30000">₹30,000+</option>
              <option value="50000">₹50,000+</option>
              <option value="60000">₹60,000+</option>
              <option value="70000">₹70,000+</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Filter Toggle for Mobile */}
          <Button variant="outline" className="md:hidden">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};