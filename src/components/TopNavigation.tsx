import { useState, useRef, useCallback } from 'react';
import { Search, Menu, Sun, Moon } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { NotificationSystem } from './NotificationSystem';
import { SearchSuggestions } from './SearchSuggestions';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { OptimizedImage } from './OptimizedImage';

export const TopNavigation = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSearch = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setShowSuggestions(query.length > 0);
    }, 300);
  }, []);

  const handleSuggestionSelect = (suggestion: any) => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    setSearchQuery('');
    setShowSuggestions(false);
    
    if (suggestion.type === 'skill') {
      navigate(`/skill/${encodeURIComponent(suggestion.value)}`);
    } else if (suggestion.type === 'sector') {
      navigate(`/sector/${encodeURIComponent(suggestion.value)}`);
    } else if (suggestion.type === 'company') {
      navigate(`/company/${encodeURIComponent(suggestion.value.toLowerCase())}`);
    } else if (suggestion.type === 'location') {
      navigate(`/city/${encodeURIComponent(suggestion.value.toLowerCase())}`);
    } else if (suggestion.type === 'title') {
      navigate(`/title/${encodeURIComponent(suggestion.value)}`);
    }
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
    setShowSuggestions(false);
  };

  const toggleMobileSidebar = () => {
    window.dispatchEvent(new CustomEvent('toggleMobileSidebar'));
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur-xl border-b border-border/50 z-50 h-16 shadow-2xl">
      <div className="w-full px-4 h-full">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-full">
          <div className="flex items-center gap-2">
            <a href="/" className="hover:opacity-80 transition-opacity">
              <OptimizedImage 
                src="/logo.webp" 
                alt="Saksham AI" 
                className="w-8 h-8 rounded-lg invert dark:invert-0"
                loading="eager"
              />
            </a>
          </div>
          
          <div className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search companies, locations, skills..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  debouncedSearch(e.target.value);
                }}
                onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                onBlur={() => {
                  blurTimeoutRef.current = setTimeout(() => setShowSuggestions(false), 200);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch(searchQuery);
                  }
                }}
                className="w-full pl-10 pr-4 py-2 text-sm bg-muted border-border text-foreground placeholder-muted-foreground"
                aria-label="Search internships"
                role="searchbox"
                aria-expanded={showSuggestions}
                aria-autocomplete="list"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <SearchSuggestions
                query={searchQuery}
                onSelect={handleSuggestionSelect}
                onSearch={handleSearch}
                isVisible={showSuggestions}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {currentUser && (
              <div className="hidden sm:block text-foreground">
                <NotificationSystem />
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-muted/50 transition-all duration-200"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileSidebar}
              className="md:hidden p-2 rounded-xl hover:bg-muted/50 transition-all duration-200"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};