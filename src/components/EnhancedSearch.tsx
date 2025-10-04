import React, { useState, useRef, useEffect } from 'react';
import { Search, Clock, X, TrendingUp, Mic, MicOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { useAnalytics } from '@/hooks/useAnalytics';

interface EnhancedSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  suggestions?: string[];
}

export const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search companies, locations, skills...",
  suggestions = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const { searchHistory, addToHistory, removeFromHistory } = useSearchHistory();
  const { trackSearch } = useAnalytics();

  const trendingSearches = [
    'React Developer',
    'Data Science',
    'UI/UX Design',
    'Machine Learning',
    'Full Stack',
    'Digital Marketing'
  ];

  const allSuggestions = [
    ...searchHistory.slice(0, 3),
    ...suggestions.slice(0, 3),
    ...trendingSearches.slice(0, 2)
  ].filter((item, index, arr) => arr.indexOf(item) === index);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      addToHistory(query);
      trackSearch(query, 0); // Will be updated with actual results count
      onSearch(query);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < allSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          const selectedQuery = allSuggestions[selectedIndex];
          onChange(selectedQuery);
          handleSearch(selectedQuery);
        } else {
          handleSearch(value);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onChange(transcript);
      handleSearch(transcript);
    };

    recognitionRef.current.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10 rounded-none"
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 rounded-none"
            onClick={() => {
              onChange('');
              onSearch('');
            }}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-none shadow-lg z-50 max-h-80 overflow-y-auto">
          {searchHistory.length > 0 && (
            <div className="p-2 border-b">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Clock className="w-3 h-3" />
                Recent Searches
              </div>
              {searchHistory.slice(0, 3).map((query, index) => (
                <div
                  key={`history-${index}`}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-muted ${
                    selectedIndex === index ? 'bg-muted' : ''
                  }`}
                  onClick={() => {
                    onChange(query);
                    handleSearch(query);
                  }}
                >
                  <span className="text-sm">{query}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromHistory(query);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="p-2 border-b">
              <div className="text-xs text-muted-foreground mb-2">Suggestions</div>
              {suggestions.slice(0, 3).map((suggestion, index) => {
                const adjustedIndex = searchHistory.length + index;
                return (
                  <div
                    key={`suggestion-${index}`}
                    className={`p-2 rounded cursor-pointer hover:bg-muted text-sm ${
                      selectedIndex === adjustedIndex ? 'bg-muted' : ''
                    }`}
                    onClick={() => {
                      onChange(suggestion);
                      handleSearch(suggestion);
                    }}
                  >
                    {suggestion}
                  </div>
                );
              })}
            </div>
          )}

          <div className="p-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <TrendingUp className="w-3 h-3" />
              Trending
            </div>
            {trendingSearches.slice(0, 2).map((trend, index) => {
              const adjustedIndex = searchHistory.length + suggestions.length + index;
              return (
                <div
                  key={`trend-${index}`}
                  className={`p-2 rounded cursor-pointer hover:bg-muted text-sm ${
                    selectedIndex === adjustedIndex ? 'bg-muted' : ''
                  }`}
                  onClick={() => {
                    onChange(trend);
                    handleSearch(trend);
                  }}
                >
                  {trend}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};