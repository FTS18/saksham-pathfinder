import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X, Globe, ZoomIn, ZoomOut, Heart, LogIn, LogOut, User, ChevronDown } from 'lucide-react';
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
import { NotificationSystem } from './NotificationSystem';

const translations = {
  en: { home: 'Home', dashboard: 'Dashboard', about: 'About', contact: 'Contact', brand: 'Saksham AI', wishlist: 'Wishlist' }
};

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const { theme, language, setLanguage, toggleTheme, increaseFontSize, decreaseFontSize } = useTheme();
  const { wishlist } = useWishlist();
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const t = translations.en;
  
  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      const isScrolled = window.scrollY > heroHeight;
      if (isScrolled && !hasAnimated) {
        setHasAnimated(true);
      }
      setScrolled(isScrolled);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasAnimated]);
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navLinks = [
    { href: '/', label: t.home },
    { 
      href: '#', 
      label: t.dashboard,
      hasDropdown: true,
      dropdownItems: [
        { href: '/wishlist', label: `Wishlist (${wishlist.length})` },
        { href: '/dashboard/news-events', label: 'News & Events' },
        { href: '/dashboard/tutorials', label: 'Tutorials' },
        { href: '/referrals', label: 'Refer' },
        { href: '/dashboard/settings', label: 'Settings' }
      ]
    },
    { href: '/live-jobs', label: 'Live Jobs' },
    { href: '/about', label: t.about },
  ];
  
  const mobileNavLinks = [
    { href: '/', label: t.home },
    { href: '/wishlist', label: t.dashboard },
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
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 nav-blur">
        <div className="container-responsive">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-racing font-bold text-xl text-foreground">
                Saksham AI
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {navLinks.map((link) => (
                link.hasDropdown ? (
                  <div key={link.href} className="relative group">
                    <div
                      className={`relative px-2 py-2 text-sm font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                        isActive(link.href)
                          ? 'text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {link.label}
                      <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                      {isActive(link.href) && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                      )}
                    </div>
                    <div className="absolute top-full left-0 mt-1 w-48 bg-background border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      {link.dropdownItems?.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`relative px-2 py-2 text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {link.label}
                    {isActive(link.href) && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </Link>
                )
              ))}
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2">
               <div className="h-4 w-px bg-border mx-2 hidden md:block" />
               <NotificationSystem />
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
                      <Link to="/wishlist" className="flex items-center">
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
        </div>
      </nav>
      
      {/* Blur overlay for main content */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-[90] bg-black/10 backdrop-blur-[2px]" />
      )}
      
      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-black/5" onClick={() => setIsOpen(false)} />
          <div className={`absolute left-0 top-0 h-full w-64 sm:w-72 shadow-2xl transform transition-transform duration-300 ease-out animate-in slide-in-from-left ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          } bg-background border-r border-border`}>
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => window.location.href = '/'} className="w-8 h-8 p-0">
                    <ChevronDown className="w-4 h-4 rotate-90" />
                  </Button>
                  <span className="font-racing font-bold text-xl text-foreground">Menu</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="w-8 h-8 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {currentUser && (
                <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center justify-between pb-6 border-b border-border hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {currentUser.photoURL ? (
                        <img src={currentUser.photoURL} alt="Profile" className="w-12 h-12 rounded-full" />
                      ) : (
                        <User className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-8 h-8 p-0 text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </Link>
              )}
              
              <div className="flex-1 py-6">
                {mobileNavLinks.map((link) => (
                  link.href === '/dashboard' ? (
                    <div key={link.href}>
                      <button
                        onClick={() => {
                          const dropdown = document.getElementById('mobile-dashboard-dropdown');
                          if (dropdown) {
                            dropdown.classList.toggle('hidden');
                          }
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted rounded-lg transition-colors mb-2 ${
                          isActive(link.href) ? 'text-primary bg-primary/10' : 'text-foreground'
                        }`}
                      >
                        {link.label}
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <div id="mobile-dashboard-dropdown" className="hidden ml-4 space-y-1">
                        <Link to="/wishlist" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded mb-1">
                          Wishlist ({wishlist.length})
                        </Link>
                        <Link to="/dashboard/news-events" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded mb-1">
                          News & Events
                        </Link>
                        <Link to="/dashboard/tutorials" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded mb-1">
                          Tutorials
                        </Link>
                        <Link to="/referrals" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded mb-1">
                          Refer
                        </Link>
                        <Link to="/dashboard/settings" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded mb-1">
                          Settings
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 text-sm font-medium hover:bg-muted rounded-lg transition-colors mb-2 ${
                        isActive(link.href) ? 'text-primary bg-primary/10' : 'text-foreground'
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                ))}
              </div>
              
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Language</span>
                  <div className="flex gap-2">
                    <Button
                      variant={language === 'en' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setLanguage('en')}
                      className="text-xs px-3 py-1"
                    >
                      EN
                    </Button>
                    <Button
                      variant={language === 'hi' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setLanguage('hi')}
                      className="text-xs px-3 py-1"
                    >
                      हिं
                    </Button>
                  </div>
                </div>
                {!currentUser && (
                  <div className="space-y-2">
                    <Link to="/login" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-center bg-muted rounded-lg text-foreground hover:bg-muted/80 transition-colors">
                      Login
                    </Link>
                    <Link to="/register" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-center bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
