import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X, Globe, ZoomIn, ZoomOut, Heart, LogIn, LogOut, User } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LanguageSelector } from './LanguageSelector';

const translations = {
  en: { home: 'Home', dashboard: 'Dashboard', about: 'About', contact: 'Contact', brand: 'Saksham AI', wishlist: 'Wishlist' },
  hi: { home: 'होम', dashboard: 'डैशबोर्ड', about: 'हमारे बारे में', contact: 'संपर्क', brand: 'सक्षम AI', wishlist: 'इच्छा-सूची' },
  pa: { home: 'ਘਰ', dashboard: 'ਡੈਸ਼ਬੋਰਡ', about: 'ਸਾਡੇ ਬਾਰੇ', contact: 'ਸੰਪਰਕ', brand: 'ਸਕਸ਼ਮ AI', wishlist: 'ਇੱਛਾ-ਸੂਚੀ' },
  ur: { home: 'گھر', dashboard: 'ڈیش بورڈ', about: 'ہمارے بارے میں', contact: 'رابطہ', brand: 'سکشم AI', wishlist: 'خواہش کی فہرست' },
};

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, language, setLanguage, toggleTheme, increaseFontSize, decreaseFontSize } = useTheme();
  const { wishlist } = useWishlist();
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const t = translations[language] || translations.en;
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navLinks = [
    { href: '/', label: t.home },
    { href: '/dashboard', label: t.dashboard },
    { href: '/live-jobs', label: 'Live Jobs' },
    { href: '/about', label: t.about },
  ];
  
  const mobileNavLinks = [
    { href: '/', label: t.home },
    { href: '/dashboard', label: t.dashboard },
    { href: '/live-jobs', label: 'Live Jobs' },
    { href: '/profile', label: 'Profile' },
    { href: '/wishlist', label: t.wishlist },
    { href: '/about', label: t.about },
  ];

  const languages = [
    { code: 'en' as const, label: 'English', flag: '🇺🇸' },
    { code: 'hi' as const, label: 'हिंदी', flag: '🇮🇳' },
    { code: 'pa' as const, label: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'ur' as const, label: 'اردو', flag: '🇵🇰' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 nav-blur">
      <div className="container-responsive">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-racing font-bold text-xl text-foreground">
              {t.brand}
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`relative px-2 py-2 text-sm font-medium smooth-transition ${
                  isActive(link.href)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full smooth-transition" />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
             <div className="h-4 w-px bg-border mx-2 hidden md:block" />
             <div className="hidden sm:block">
               <LanguageSelector />
             </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-8 h-8 p-0">
                  {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={increaseFontSize} className="w-8 h-8 p-0 hidden sm:inline-flex"><ZoomIn className="w-4 h-4"/></Button>
              </TooltipTrigger>
              <TooltipContent>Increase font size</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={decreaseFontSize} className="w-8 h-8 p-0 hidden sm:inline-flex"><ZoomOut className="w-4 h-4"/></Button>
              </TooltipTrigger>
              <TooltipContent>Decrease font size</TooltipContent>
            </Tooltip>
            
            {/* Auth Section */}
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-2 h-8 px-2 rounded-md hover:bg-accent hover:text-accent-foreground">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">{currentUser.displayName || 'User'}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                  <Link to="/login">
                    <LogIn className="w-4 h-4 mr-1" />
                    Login
                  </Link>
                </Button>
                <Button size="sm" asChild className="hidden sm:flex">
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden w-8 h-8 p-0"
            >
              <div className="relative w-4 h-4">
                <Menu className={`w-4 h-4 absolute transition-all duration-300 ${isOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`} />
                <X className={`w-4 h-4 absolute transition-all duration-300 ${isOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`} />
              </div>
            </Button>
          </div>
        </div>

        <div className={`md:hidden overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border">
            {mobileNavLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 text-base font-medium rounded-lg transition-colors ${
                  isActive(link.href)
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {link.label}
                {link.href === '/wishlist' && wishlist.length > 0 && (
                  <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full h-4 w-4 inline-flex items-center justify-center">{wishlist.length}</span>
                )}
              </Link>
            ))}
            
            {/* Mobile Auth */}
            <div className="border-t border-border pt-2 mt-2">
              <div className="px-3 py-2">
                <LanguageSelector />
              </div>
              {currentUser ? (
                <>
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Welcome, {currentUser.displayName || 'User'}
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-base font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  >
                    <User className="w-4 h-4 mr-2 inline" />
                    Profile
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <div className="space-y-1">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-base font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-base font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
