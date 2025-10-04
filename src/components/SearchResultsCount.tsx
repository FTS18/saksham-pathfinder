import { Search } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface SearchResultsCountProps {
  count: number;
  query?: string;
  isLoading?: boolean;
}

export const SearchResultsCount = ({ count, query, isLoading }: SearchResultsCountProps) => {
  const { colorTheme } = useTheme();

  const getThemeClasses = () => {
    const themeClasses = {
      blue: 'text-blue-600 dark:text-blue-400',
      green: 'text-green-600 dark:text-green-400',
      red: 'text-red-600 dark:text-red-400',
      yellow: 'text-yellow-600 dark:text-yellow-400',
      grey: 'text-gray-600 dark:text-gray-400'
    };
    return themeClasses[colorTheme] || themeClasses.blue;
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
        <Search className="w-4 h-4" />
        <span>Searching...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <Search className={`w-4 h-4 ${getThemeClasses()}`} />
      <span className="text-muted-foreground">
        {query ? (
          <>
            <span className={`font-medium ${getThemeClasses()}`}>{count}</span> results found
            {query && <span> for "{query}"</span>}
          </>
        ) : (
          <>
            <span className={`font-medium ${getThemeClasses()}`}>{count}</span> internships available
          </>
        )}
      </span>
    </div>
  );
};