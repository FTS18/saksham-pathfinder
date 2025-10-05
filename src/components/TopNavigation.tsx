import { useState, useRef, useCallback, useEffect } from 'react';
import { Search, Menu, Sun, Moon, X, MessageCircle, Sparkles } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ReportIssue } from './ReportIssue';

import { SearchSuggestions } from './SearchSuggestions';
import { SearchHistoryDropdown } from './SearchHistoryDropdown';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationCenter } from './NotificationCenter';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';


export const TopNavigation = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const { searchHistory, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();
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
      // For companies, replace spaces with dashes and lowercase
      const companySlug = suggestion.value.replace(/\s+/g, '-').toLowerCase();
      navigate(`/company/${companySlug}`);
    } else if (suggestion.type === 'location') {
      // For locations, replace spaces with dashes and lowercase
      const locationSlug = suggestion.value.replace(/\s+/g, '-').toLowerCase();
      navigate(`/city/${locationSlug}`);
    } else if (suggestion.type === 'title') {
      navigate(`/title/${encodeURIComponent(suggestion.value)}`);
    }
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      addToHistory(query.trim());
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
    setShowSuggestions(false);
    setShowHistory(false);
  };

  const handleHistorySelect = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const toggleMobileSidebar = () => {
    window.dispatchEvent(new CustomEvent('toggleMobileSidebar'));
  };
  
  const toggleQuickActions = () => {
    setShowQuickActions(!showQuickActions);
    if (!showQuickActions) {
      window.dispatchEvent(new CustomEvent('openChatbot'));
    }
  };

  // Listen for global search events and keyboard shortcuts
  useEffect(() => {
    const handleGlobalSearch = (e: CustomEvent) => {
      setSearchQuery(e.detail.query);
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[role="searchbox"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    };
    
    window.addEventListener('globalSearch', handleGlobalSearch as EventListener);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('globalSearch', handleGlobalSearch as EventListener);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur-xl border-b border-border/50 z-50 h-16 shadow-2xl">
      <div className="w-full px-4 h-full">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-full">
          <div className="flex items-center gap-2">
            <a href="/" className="hover:opacity-80 transition-opacity">
              <img 
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
                placeholder="Try: 'Show Google internships' or 'Internships in Mumbai'..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  debouncedSearch(e.target.value);
                }}
                onFocus={() => {
                  if (searchQuery.length > 0) {
                    setShowSuggestions(true);
                  } else {
                    setShowHistory(searchHistory.length > 0);
                  }
                }}
                onBlur={() => {
                  blurTimeoutRef.current = setTimeout(() => {
                    setShowSuggestions(false);
                    setShowHistory(false);
                  }, 200);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch(searchQuery);
                  }
                }}
                className="w-full pl-10 pr-24 py-2 text-sm bg-muted border-border/30 text-foreground placeholder-muted-foreground rounded-md"
                aria-label="Search internships"
                role="searchbox"
                aria-expanded={showSuggestions}
                aria-autocomplete="list"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleQuickActions}
                  className="h-6 w-6 p-0 rounded-none hover:bg-muted-foreground/10"
                  title="Open AI Assistant"
                >
                  <Sparkles className="w-3 h-3" />
                </Button>
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setShowSuggestions(false);
                      setShowHistory(false);
                    }}
                    className="h-6 w-6 p-0 rounded-none hover:bg-muted-foreground/10"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.dispatchEvent(new CustomEvent('openChatbot'))}
                  className="h-6 w-6 p-0 rounded-none hover:bg-muted-foreground/10"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
              <SearchSuggestions
                query={searchQuery}
                onSelect={handleSuggestionSelect}
                onSearch={handleSearch}
                isVisible={showSuggestions}
              />
              <SearchHistoryDropdown
                history={searchHistory}
                onSelect={handleHistorySelect}
                onRemove={removeFromHistory}
                onClear={clearHistory}
                isVisible={showHistory}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
              className="hidden md:flex px-3 py-1.5 text-sm rounded-xl hover:bg-muted/50 transition-all duration-200"
            >
              Recruiter?
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="hidden md:flex p-2 rounded-xl hover:bg-muted/50 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 rotate-0 scale-100 transition-all" />
              ) : (
                <Moon className="w-5 h-5 rotate-0 scale-100 transition-all" />
              )}
            </Button>
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 text-foreground">
                <NotificationCenter />
              </div>
            )}

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