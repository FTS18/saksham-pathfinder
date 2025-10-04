import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';

interface QuickFiltersProps {
  onFilterSelect: (filter: string, value: string) => void;
  activeFilters: string[];
}

export const QuickFilters = ({ onFilterSelect, activeFilters }: QuickFiltersProps) => {
  const { colorTheme } = useTheme();
  
  const quickFilters = [
    { label: 'Remote', type: 'workMode', value: 'remote' },
    { label: 'High Stipend', type: 'minStipend', value: '20000' },
    { label: 'Tech', type: 'sector', value: 'Technology' },
    { label: 'Internship', type: 'type', value: 'internship' },
    { label: 'Full Time', type: 'type', value: 'full-time' },
    { label: 'Bangalore', type: 'location', value: 'bangalore' },
    { label: 'Mumbai', type: 'location', value: 'mumbai' },
    { label: 'Delhi', type: 'location', value: 'delhi' }
  ];

  const getThemeClasses = (isActive: boolean) => {
    if (isActive) {
      const activeClasses = {
        blue: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
        green: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
        red: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
        yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
        grey: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
      };
      return activeClasses[colorTheme] || activeClasses.blue;
    }
    return 'bg-background hover:bg-muted border-border text-muted-foreground hover:text-foreground';
  };

  return (
    <div className="flex flex-wrap gap-2 px-4 py-2">
      {quickFilters.map((filter) => {
        const isActive = activeFilters.includes(`${filter.type}:${filter.value}`);
        return (
          <Badge
            key={`${filter.type}-${filter.value}`}
            variant="outline"
            className={`cursor-pointer transition-all duration-200 hover:scale-105 rounded-full px-3 py-1 text-xs font-medium border ${getThemeClasses(isActive)}`}
            onClick={() => onFilterSelect(filter.type, filter.value)}
          >
            {filter.label}
          </Badge>
        );
      })}
    </div>
  );
};