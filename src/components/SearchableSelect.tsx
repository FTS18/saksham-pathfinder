import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchableSelectProps {
  options: string[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  placeholder?: string;
  maxHeight?: string;
  multiple?: boolean;
}

export const SearchableSelect = ({ 
  options, 
  selected, 
  onSelectionChange, 
  placeholder = "Search and select...",
  maxHeight = "200px",
  multiple = true 
}: SearchableSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (option: string) => {
    if (multiple) {
      const newSelected = selected.includes(option)
        ? selected.filter(item => item !== option)
        : [...selected, option];
      onSelectionChange(newSelected);
    } else {
      onSelectionChange([option]);
      setIsOpen(false);
    }
  };

  const removeSelected = (option: string) => {
    onSelectionChange(selected.filter(item => item !== option));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div 
        className="min-h-[40px] w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1 flex-1">
            {selected.length > 0 ? (
              selected.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-xs"
                >
                  {item}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSelected(item);
                    }}
                  />
                </span>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-input rounded-md shadow-lg">
          <div className="p-2">
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8"
            />
          </div>
          <ScrollArea style={{ maxHeight }}>
            <div className="p-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option}
                    className={cn(
                      "flex items-center justify-between px-2 py-2 text-sm cursor-pointer rounded hover:bg-accent",
                      selected.includes(option) && "bg-accent"
                    )}
                    onClick={() => toggleOption(option)}
                  >
                    <span>{option}</span>
                    {selected.includes(option) && <Check className="h-4 w-4 text-primary" />}
                  </div>
                ))
              ) : (
                <div className="px-2 py-2 text-sm text-muted-foreground">
                  No options found
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};