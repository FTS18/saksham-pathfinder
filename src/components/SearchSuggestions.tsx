import { useState, useEffect, useRef } from 'react';
import { Search, Building, MapPin } from 'lucide-react';

let internshipsData: any[] = [];

// Load internships data
const loadInternshipsData = async () => {
  if (internshipsData.length === 0) {
    try {
      const response = await fetch('/internships.json');
      if (response.ok) {
        internshipsData = await response.json();
      }
    } catch (error) {
      console.warn('Failed to load internships for suggestions:', error);
    }
  }
};

// Initialize data loading
loadInternshipsData();

interface SearchSuggestionsProps {
  query: string;
  onSelect: (suggestion: string) => void;
  isVisible: boolean;
  onSearch?: (query: string) => void;
}

interface Suggestion {
  type: string;
  value: string;
  count?: number;
}

export const SearchSuggestions = ({ query, onSelect, isVisible, onSearch }: SearchSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query || !query.trim() || query.length < 2) {
      setSuggestions([]);
      setSelectedIndex(-1);
      return;
    }

    // Ensure data is loaded
    if (internshipsData.length === 0) {
      loadInternshipsData().then(() => {
        // Retry after data is loaded
        if (internshipsData.length > 0) {
          generateSuggestions();
        }
      });
      return;
    }

    generateSuggestions();
    setSelectedIndex(-1);
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible || suggestions.length === 0) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            handleSuggestionClick(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          setSelectedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, suggestions, selectedIndex]);

  const generateSuggestions = () => {
    const companies = [...new Set(internshipsData.map(i => i.company))];
    const locations = [...new Set(internshipsData.map(i => i.location))];
    const titles = [...new Set(internshipsData.map(i => i.title))];
    const skills = [...new Set(internshipsData.flatMap(i => i.required_skills || []))];
    const sectors = [...new Set(internshipsData.flatMap(i => i.sector_tags || []))];

    // Group similar companies
    const groupCompanies = (companies: string[]) => {
      const groups: { [key: string]: string[] } = {};
      companies.forEach(company => {
        const baseCompany = company.toLowerCase()
          .replace(/\s+(india|limited|ltd|inc|corp|pvt|private|technologies|tech|solutions|services|consulting|consultancy)\b/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        if (!groups[baseCompany]) groups[baseCompany] = [];
        groups[baseCompany].push(company);
      });
      return groups;
    };

    const companyGroups = groupCompanies(companies);
    const companyMatches = Object.entries(companyGroups)
      .filter(([base, variants]) => base.includes(query.toLowerCase()) || variants.some(v => v.toLowerCase().includes(query.toLowerCase())))
      .slice(0, 3)
      .map(([base, variants]) => ({ 
        type: 'company', 
        value: variants[0], // Show main company name
        count: variants.length > 1 ? variants.length : undefined
      }));

    const locationMatches = locations
      .filter(l => l && l.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 2)
      .map(l => ({ type: 'location', value: l }));

    const titleMatches = titles
      .filter(t => t && t.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 2)
      .map(t => ({ type: 'title', value: t }));

    let skillMatches = skills
      .filter(s => s && s.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 2)
      .map(s => ({ type: 'skill', value: s }));

    // Filter out skills that are also titles
    skillMatches = skillMatches.filter(sm => !titleMatches.some(tm => tm.value.toLowerCase() === sm.value.toLowerCase()));

    const sectorMatches = sectors
      .filter(s => s && s.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 2)
      .map(s => ({ type: 'sector', value: s }));

    setSuggestions([...companyMatches, ...locationMatches, ...titleMatches, ...skillMatches, ...sectorMatches]);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.type === 'skill') {
      window.location.href = `/skill/${encodeURIComponent(suggestion.value)}`;
    } else if (suggestion.type === 'sector') {
      window.location.href = `/sector/${encodeURIComponent(suggestion.value)}`;
    } else if (suggestion.type === 'company') {
      window.location.href = `/company/${encodeURIComponent(suggestion.value.toLowerCase())}`;
    } else if (suggestion.type === 'location') {
      window.location.href = `/city/${encodeURIComponent(suggestion.value.toLowerCase())}`;
    } else if (suggestion.type === 'title') {
      window.location.href = `/title/${encodeURIComponent(suggestion.value)}`;
    } else {
      // For titles, just select the suggestion
      onSelect(suggestion.value);
    }
  };

  if (!isVisible || suggestions.length === 0) return null;

  return (
    <div 
      ref={suggestionsRef}
      className="absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg z-50 mt-1"
    >
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => handleSuggestionClick(suggestion)}
          className={`w-full px-3 py-2 text-left flex items-center gap-2 text-sm transition-colors ${
            index === selectedIndex ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
          }`}
        >
          {suggestion.type === 'company' && <Building className="w-4 h-4 text-muted-foreground" />}
          {suggestion.type === 'location' && <MapPin className="w-4 h-4 text-muted-foreground" />}
          {suggestion.type === 'title' && <Search className="w-4 h-4 text-muted-foreground" />}
          {suggestion.type === 'skill' && <Search className="w-4 h-4 text-primary" />}
          <span>{suggestion.value}</span>
          {suggestion.count && suggestion.count > 1 && (
            <span className="text-xs bg-primary/10 text-primary px-1 rounded">+{suggestion.count - 1}</span>
          )}
          <span className="text-xs text-muted-foreground ml-auto capitalize">{suggestion.type}</span>
        </button>
      ))}
    </div>
  );
};