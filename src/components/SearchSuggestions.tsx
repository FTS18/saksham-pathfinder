import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Building, MapPin, Briefcase, Code, Target } from 'lucide-react';
import { cache, CACHE_KEYS } from '@/lib/cache';

interface SearchSuggestionsProps {
  query: string;
  onSelect: (suggestion: Suggestion) => void;
  onSearch: (query: string) => void;
  isVisible: boolean;
}

interface Suggestion {
  type: 'company' | 'location' | 'title' | 'skill' | 'sector';
  value: string;
  count?: number;
  matchCount?: number;
}

interface InternshipData {
  company: string;
  location: string | { city: string };
  title: string;
  required_skills: string[];
  sector_tags: string[];
}

export const SearchSuggestions = ({ query, onSelect, onSearch, isVisible }: SearchSuggestionsProps) => {
  const [internshipsData, setInternshipsData] = useState<InternshipData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await cache.fetchWithCache(
          CACHE_KEYS.INTERNSHIPS,
          async () => {
            const response = await fetch('/internships.json');
            if (!response.ok) throw new Error('Failed to fetch');
            return response.json();
          },
          5 * 60 * 1000
        );
        setInternshipsData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.warn('Failed to load internships for suggestions:', error);
        // Try direct fetch as fallback
        try {
          const response = await fetch('/internships.json');
          if (response.ok) {
            const data = await response.json();
            setInternshipsData(Array.isArray(data) ? data : []);
          }
        } catch (fallbackError) {
          console.error('Fallback fetch also failed:', fallbackError);
        }
      }
    };
    loadData();
  }, []);

  const filteredSuggestions = useMemo(() => {
    if (!query || query.trim().length < 2 || internshipsData.length === 0) {
      return [];
    }

    const queryLower = query.toLowerCase().trim();
    const suggestions: Suggestion[] = [];
    
    const companies = new Map<string, number>();
    const locations = new Map<string, number>();
    const titles = new Map<string, number>();
    const skills = new Map<string, number>();
    const sectors = new Map<string, number>();

    internshipsData.forEach(internship => {
      if (internship.company?.toLowerCase().includes(queryLower)) {
        companies.set(internship.company, (companies.get(internship.company) || 0) + 1);
      }
      
      const location = typeof internship.location === 'string' 
        ? internship.location 
        : internship.location?.city || '';
      if (location.toLowerCase().includes(queryLower)) {
        locations.set(location, (locations.get(location) || 0) + 1);
      }
      
      if (internship.title?.toLowerCase().includes(queryLower)) {
        titles.set(internship.title, (titles.get(internship.title) || 0) + 1);
      }
      
      (internship.required_skills || []).forEach(skill => {
        if (skill.toLowerCase().includes(queryLower)) {
          skills.set(skill, (skills.get(skill) || 0) + 1);
        }
      });
      
      (internship.sector_tags || []).forEach(sector => {
        if (sector.toLowerCase().includes(queryLower)) {
          sectors.set(sector, (sectors.get(sector) || 0) + 1);
        }
      });
    });

    const addSuggestions = (map: Map<string, number>, type: Suggestion['type'], limit: number) => {
      Array.from(map.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, limit)
        .forEach(([value, count]) => {
          suggestions.push({ type, value, matchCount: count });
        });
    };

    addSuggestions(companies, 'company', 3);
    addSuggestions(titles, 'title', 2);
    addSuggestions(locations, 'location', 2);
    addSuggestions(skills, 'skill', 3);
    addSuggestions(sectors, 'sector', 2);

    return suggestions.slice(0, 8);
  }, [query, internshipsData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible || filteredSuggestions.length === 0) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredSuggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredSuggestions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          e.stopPropagation();
          if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
            const suggestion = filteredSuggestions[selectedIndex];
            onSelect(suggestion);
          } else if (query.trim()) {
            onSearch(query.trim());
          }
          break;
        case 'Escape':
          setSelectedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, filteredSuggestions, selectedIndex, query, onSelect, onSearch]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [filteredSuggestions]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'company': return <Building className="w-4 h-4 text-blue-500" />;
      case 'location': return <MapPin className="w-4 h-4 text-green-500" />;
      case 'title': return <Briefcase className="w-4 h-4 text-purple-500" />;
      case 'skill': return <Code className="w-4 h-4 text-orange-500" />;
      case 'sector': return <Target className="w-4 h-4 text-red-500" />;
      default: return <Search className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (!isVisible || filteredSuggestions.length === 0) {
    return null;
  }

  return (
    <div 
      ref={suggestionsRef}
      className="absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg z-50 mt-1 max-h-80 overflow-y-auto"
    >
      {filteredSuggestions.map((suggestion, index) => (
        <button
          key={`${suggestion.type}-${suggestion.value}`}
          onClick={() => onSelect(suggestion)}
          className={`w-full px-3 py-2 text-left flex items-center gap-3 text-sm transition-colors border-b border-border/50 last:border-b-0 ${
            index === selectedIndex ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'
          }`}
        >
          {getIcon(suggestion.type)}
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{suggestion.value}</div>
            <div className="text-xs text-muted-foreground capitalize flex items-center gap-1">
              {suggestion.type}
              {suggestion.matchCount && suggestion.matchCount > 1 && (
                <span className="bg-primary/20 text-primary px-1 rounded text-xs">
                  {suggestion.matchCount} matches
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};