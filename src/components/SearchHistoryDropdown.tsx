import { Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

interface SearchHistoryDropdownProps {
  history: string[];
  onSelect: (query: string) => void;
  onRemove: (query: string) => void;
  onClear: () => void;
  isVisible: boolean;
}

export const SearchHistoryDropdown = ({ 
  history, 
  onSelect, 
  onRemove, 
  onClear, 
  isVisible 
}: SearchHistoryDropdownProps) => {
  const { colorTheme } = useTheme();

  if (!isVisible || history.length === 0) return null;

  const getThemeHover = () => {
    const hoverClasses = {
      blue: 'hover:bg-blue-50 dark:hover:bg-blue-950/30',
      green: 'hover:bg-green-50 dark:hover:bg-green-950/30',
      red: 'hover:bg-red-50 dark:hover:bg-red-950/30',
      yellow: 'hover:bg-yellow-50 dark:hover:bg-yellow-950/30',
      grey: 'hover:bg-gray-50 dark:hover:bg-gray-900'
    };
    return hoverClasses[colorTheme] || hoverClasses.blue;
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-black border border-border/50 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
      <div className="p-3 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            Recent Searches
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear All
          </Button>
        </div>
      </div>
      <div className="py-1">
        {history.map((query, index) => (
          <div
            key={index}
            className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${getThemeHover()}`}
            onClick={() => onSelect(query)}
          >
            <span className="text-sm text-foreground truncate flex-1">{query}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(query);
              }}
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};