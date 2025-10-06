import { useState, useMemo } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ChevronDown, Search } from 'lucide-react';

interface SearchableSelectProps {
  options: string[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  placeholder?: string;
  maxHeight?: string;
  multiple?: boolean;
  disabled?: boolean;
  groupedOptions?: Record<string, string[]>;
  selectedGroups?: string[];
}

export const SearchableSelect = ({ 
  options, 
  selected, 
  onSelectionChange, 
  placeholder = "Select options...",
  maxHeight = "240px",
  multiple = true,
  disabled = false,
  groupedOptions,
  selectedGroups
}: SearchableSelectProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(option =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const toggleOption = (option: string) => {
    if (disabled) return;
    
    if (multiple) {
      const newSelected = selected.includes(option)
        ? selected.filter(item => item !== option)
        : [...selected, option];
      onSelectionChange(newSelected);
    } else {
      onSelectionChange([option]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between" 
          disabled={disabled}
        >
          {selected.length > 0 
            ? `${selected.length} ${selected.length === 1 ? 'item' : 'items'} selected`
            : placeholder
          }
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>
        
        <div className="max-h-60 overflow-y-auto p-4">
          {groupedOptions && selectedGroups ? (
            <div className="space-y-4">
              {selectedGroups.map(group => {
                const groupOptions = groupedOptions[group] || [];
                const filteredGroupOptions = groupOptions.filter(option =>
                  !searchTerm || option.toLowerCase().includes(searchTerm.toLowerCase())
                );
                const allGroupSelected = filteredGroupOptions.length > 0 && 
                  filteredGroupOptions.every(option => selected.includes(option));
                
                if (filteredGroupOptions.length === 0) return null;
                
                return (
                  <div key={group}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-primary">{group}</h4>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`select-all-${group}`}
                          checked={allGroupSelected}
                          onCheckedChange={() => {
                            if (allGroupSelected) {
                              onSelectionChange(selected.filter(item => !filteredGroupOptions.includes(item)));
                            } else {
                              onSelectionChange([...new Set([...selected, ...filteredGroupOptions])]);
                            }
                          }}
                        />
                        <Label htmlFor={`select-all-${group}`} className="text-xs text-muted-foreground cursor-pointer">
                          Select All
                        </Label>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {filteredGroupOptions.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox
                            id={`option-${option}`}
                            checked={selected.includes(option)}
                            onCheckedChange={() => toggleOption(option)}
                          />
                          <Label 
                            htmlFor={`option-${option}`} 
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`option-${option}`}
                      checked={selected.includes(option)}
                      onCheckedChange={() => toggleOption(option)}
                    />
                    <Label 
                      htmlFor={`option-${option}`} 
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {option}
                    </Label>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  {searchTerm ? 'No results found' : 'No options available'}
                </div>
              )}
            </div>
          )}
        </div>
        
        {selected.length > 0 && (
          <div className="p-3 border-t bg-muted/30">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {selected.length} item{selected.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectionChange([]);
                }}
                className="text-destructive hover:underline"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};