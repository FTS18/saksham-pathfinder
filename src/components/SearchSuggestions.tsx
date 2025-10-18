import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Building, MapPin, Briefcase, Code, Target } from 'lucide-react';
import { cache, CACHE_KEYS } from '@/lib/cache';
import { useTheme } from '@/contexts/ThemeContext';
import { fetchInternships } from '@/lib/dataExtractor';

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
  const { colorTheme } = useTheme();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchInternships();
        setInternshipsData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.warn('Failed to load internships for suggestions:', error);
        setInternshipsData([]);
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
      case 'company': return <Building className="w-5 h-5 md:w-4 md:h-4 text-blue-500" />;
      case 'location': return <MapPin className="w-5 h-5 md:w-4 md:h-4 text-green-500" />;
      case 'title': return <Briefcase className="w-5 h-5 md:w-4 md:h-4 text-purple-500" />;
      case 'skill': return <Code className="w-5 h-5 md:w-4 md:h-4 text-orange-500" />;
      case 'sector': return <Target className="w-5 h-5 md:w-4 md:h-4 text-red-500" />;
      default: return <Search className="w-5 h-5 md:w-4 md:h-4 text-muted-foreground" />;
    }
  };

  if (!isVisible || filteredSuggestions.length === 0) {
    return null;
  }

  return (
    <div 
      ref={suggestionsRef}
      className="fixed md:absolute top-16 md:top-full left-0 right-0 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-none shadow-lg z-50 mt-0 md:mt-1 max-h-80 overflow-y-auto w-screen md:w-auto"
    >
      {filteredSuggestions.map((suggestion, index) => {
        const getTypeStyles = () => {
          const themeHover = {
            blue: 'hover:bg-blue-50 dark:hover:bg-blue-950/30',
            green: 'hover:bg-green-50 dark:hover:bg-green-950/30',
            red: 'hover:bg-red-50 dark:hover:bg-red-950/30',
            yellow: 'hover:bg-yellow-50 dark:hover:bg-yellow-950/30',
            grey: 'hover:bg-gray-50 dark:hover:bg-gray-900'
          };
          return `bg-white dark:bg-black ${themeHover[colorTheme] || themeHover.blue}`;
        };
        
        return (
        <button
          key={`${suggestion.type}-${suggestion.value}`}
          onClick={() => onSelect(suggestion)}
          className={`w-full px-4 py-4 md:py-2 text-left flex items-center gap-3 text-base md:text-sm transition-all duration-200 border-b border-border/30 last:border-b-0 min-h-[48px] md:min-h-auto ${
            index === selectedIndex ? `${
              colorTheme === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
              colorTheme === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
              colorTheme === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
              colorTheme === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
              colorTheme === 'grey' ? 'bg-gray-100 dark:bg-gray-800' : 'bg-blue-100 dark:bg-blue-900/30'
            }` : getTypeStyles()
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
        );
      })}
    </div>
  );
};