import { useState, useRef, useCallback, useEffect } from 'react';
import { Search, X, Clock, Mic, MicOff } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { SearchSuggestions } from './SearchSuggestions';

interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
}

interface EnhancedSearchProps {
  onSearch: (query: string) => void;
  onSuggestionSelect: (suggestion: any) => void;
  placeholder?: string;
  className?: string;
}

export const EnhancedSearch = ({ 
  onSearch, 
  onSuggestionSelect, 
  placeholder = "Search companies, locations, skills...",
  className = ""
}: EnhancedSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isListening, setIsListening] = useState(false);
  
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  }, []);

  // Save search history to localStorage
  const saveSearchHistory = useCallback((history: SearchHistoryItem[]) => {
    localStorage.setItem('searchHistory', JSON.stringify(history));
    setSearchHistory(history);
  }, []);

  // Add to search history
  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    
    const newItem: SearchHistoryItem = {
      id: Date.now().toString(),
      query: query.trim(),
      timestamp: Date.now()
    };

    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.query !== query.trim());
      const updated = [newItem, ...filtered].slice(0, 10); // Keep only 10 items
      saveSearchHistory(updated);
      return updated;
    });
  }, [saveSearchHistory]);

  // Remove from search history
  const removeFromHistory = useCallback((id: string) => {
    setSearchHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveSearchHistory(updated);
      return updated;
    });
  }, [saveSearchHistory]);

  // Clear all history
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  }, []);

  // Debounced search
  const debouncedSearch = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setShowSuggestions(query.length > 0 || searchHistory.length > 0);
    }, 300);
  }, [searchHistory.length]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    if (query.trim()) {
      addToHistory(query);
      onSearch(query.trim());
    }
    setShowSuggestions(false);
    setSearchQuery('');
  }, [addToHistory, onSearch]);

  // Voice search setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        handleSearch(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [handleSearch]);

  // Toggle voice search
  const toggleVoiceSearch = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            debouncedSearch(e.target.value);
          }}
          onFocus={() => setShowSuggestions(searchQuery.length > 0 || searchHistory.length > 0)}
          onBlur={() => {
            blurTimeoutRef.current = setTimeout(() => setShowSuggestions(false), 200);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch(searchQuery);
            }
          }}
          className="w-full pl-10 pr-20 py-2 text-sm bg-muted border-border text-foreground placeholder-muted-foreground"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {recognitionRef.current && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVoiceSearch}
              className={`p-1 h-6 w-6 ${isListening ? 'text-red-500' : 'text-muted-foreground'}`}
            >
              {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
            </Button>
          )}
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setShowSuggestions(false);
              }}
              className="p-1 h-6 w-6 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {/* Search History */}
          {searchHistory.length > 0 && !searchQuery && (
            <div className="p-2 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">Recent Searches</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
                >
                  Clear All
                </Button>
              </div>
              {searchHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between group hover:bg-muted rounded px-2 py-1 cursor-pointer"
                  onClick={() => {
                    setSearchQuery(item.query);
                    handleSearch(item.query);
                  }}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm text-foreground">{item.query}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromHistory(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 h-6 w-6 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Search Suggestions */}
          <SearchSuggestions
            query={searchQuery}
            onSelect={onSuggestionSelect}
            onSearch={handleSearch}
            isVisible={true}
          />
        </div>
      )}
    </div>
  );
};