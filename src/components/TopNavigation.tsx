import { useState } from 'react';
import { Search, Bell, Menu, Sun, Moon } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { NotificationSystem } from './NotificationSystem';
import { SearchSuggestions } from './SearchSuggestions';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export const TopNavigation = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSearch = (e?: React.FormEvent, directQuery?: string) => {
    if (e) e.preventDefault();
    // Don't do anything - let suggestions handle navigation
  };

  const toggleMobileSidebar = () => {
    window.dispatchEvent(new CustomEvent('toggleMobileSidebar'));
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-background/95 dark:bg-background/95 backdrop-blur-md border-b border-border z-40 h-16 shadow-lg">
      <div className="w-full px-4 h-full">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-full">
          {/* Desktop Logo */}
          <div className="hidden md:flex items-center gap-2 absolute left-4">
            <a href="/" className="hover:opacity-80 transition-opacity">
              <img src="/logo.webp" alt="Saksham AI" className="w-8 h-8 rounded-lg invert dark:invert-0" />
            </a>
          </div>
          
          {/* Mobile Layout */}
          <div className="md:hidden flex items-center justify-between w-full">
            <a href="/" className="hover:opacity-80 transition-opacity">
              <img src="/logo.webp" alt="Saksham AI" className="w-8 h-8 rounded-lg invert dark:invert-0" />
            </a>
            
            <div className="flex-1 mx-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search internships..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full pl-8 pr-2 py-2 text-sm bg-muted border-border"
                />
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <SearchSuggestions
                  query={searchQuery}
                  onSelect={(suggestion) => {
                    setSearchQuery('');
                    setShowSuggestions(false);
                  }}
                  onSearch={() => {}}
                  isVisible={showSuggestions}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {currentUser && (
                <div className="text-foreground">
                  <NotificationSystem />
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileSidebar}
                className="p-2"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 justify-center px-8">
            <div className="w-full max-w-3xl">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search companies, locations, skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full pl-10 pr-4 py-2 bg-muted border-border text-foreground placeholder-muted-foreground"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <SearchSuggestions
                  query={searchQuery}
                  onSelect={(suggestion) => {
                    setSearchQuery('');
                    setShowSuggestions(false);
                  }}
                  onSearch={() => {}}
                  isVisible={showSuggestions}
                />
              </div>
            </div>
          </div>
          
          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-2 absolute right-4">
            {currentUser && (
              <div className="text-foreground">
                <NotificationSystem />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};