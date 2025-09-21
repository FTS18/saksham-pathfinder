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
import { NotificationSystem } from './NotificationSystem';
import GoogleTranslate from './GoogleTranslate';

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
    { href: '/live-jobs', label: 'Live Jobs' },
    { href: '/about', label: t.about },
    { 
      href: '#', 
      label: 'More',
      hasDropdown: true,
      dropdownItems: [
        { href: '/wishlist', label: `Wishlist (${wishlist.length})` },
        { href: '/dashboard/news-events', label: 'News & Events' },
        { href: '/dashboard/tutorials', label: 'Tutorials' },
        { href: '/referrals', label: 'Refer' },
        { href: '/profile', label: 'Settings' }
      ]
    }
  ];
  
  const mobileNavLinks = [
    { href: '/', label: t.home },
    { href: '/live-jobs', label: 'Live Jobs' },
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
          <div className="flex justify-between items-center h-16 sm:h-16">
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-racing font-bold text-xl text-foreground">
                Saksham AI
              </span>
            </Link>

            <div className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2 space-x-6 lg:space-x-8">
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
               <div className="hidden sm:flex items-center gap-1">
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => {
                     const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
                     if (combo) {
                       combo.value = 'en';
                       combo.dispatchEvent(new Event('change'));
                       localStorage.setItem('selectedLanguage', 'en');
                     }
                   }}
                   className="h-8 px-2 text-xs"
                 >
                   ENG
                 </Button>
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => {
                     const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
                     if (combo) {
                       combo.value = 'hi';
                       combo.dispatchEvent(new Event('change'));
                       localStorage.setItem('selectedLanguage', 'hi');
                     }
                   }}
                   className="h-8 px-2 text-xs"
                 >
                   हिंदी
                 </Button>
                 <div className="hidden">
                   <GoogleTranslate />
                 </div>
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
              {!currentUser && (
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
          <div className={`absolute left-0 top-0 h-full w-64 sm:w-72 shadow-2xl transform transition-transform duration-300 ease-out ${
            isOpen ? 'translate-x-0 animate-in slide-in-from-left' : '-translate-x-full animate-out slide-out-to-left'
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
                ))}
                
                {currentUser && (
                  <>
                    <Link
                      to="/wishlist"
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 text-sm font-medium hover:bg-muted rounded-lg transition-colors mb-2 ${
                        isActive('/wishlist') ? 'text-primary bg-primary/10' : 'text-foreground'
                      }`}
                    >
                      Wishlist ({wishlist.length})
                    </Link>
                    <Link
                      to="/dashboard/news-events"
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 text-sm font-medium hover:bg-muted rounded-lg transition-colors mb-2 ${
                        isActive('/dashboard/news-events') ? 'text-primary bg-primary/10' : 'text-foreground'
                      }`}
                    >
                      News & Events
                    </Link>
                    <Link
                      to="/dashboard/tutorials"
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 text-sm font-medium hover:bg-muted rounded-lg transition-colors mb-2 ${
                        isActive('/dashboard/tutorials') ? 'text-primary bg-primary/10' : 'text-foreground'
                      }`}
                    >
                      Tutorials
                    </Link>
                    <Link
                      to="/referrals"
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 text-sm font-medium hover:bg-muted rounded-lg transition-colors mb-2 ${
                        isActive('/referrals') ? 'text-primary bg-primary/10' : 'text-foreground'
                      }`}
                    >
                      Refer
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 text-sm font-medium hover:bg-muted rounded-lg transition-colors mb-2 ${
                        isActive('/profile') ? 'text-primary bg-primary/10' : 'text-foreground'
                      }`}
                    >
                      Settings
                    </Link>
                  </>
                )}
              </div>
              
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
                      if (combo) {
                        combo.value = 'en';
                        combo.dispatchEvent(new Event('change'));
                        localStorage.setItem('selectedLanguage', 'en');
                      }
                    }}
                    className="flex-1 text-xs h-8"
                  >
                    ENG
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
                      if (combo) {
                        combo.value = 'hi';
                        combo.dispatchEvent(new Event('change'));
                        localStorage.setItem('selectedLanguage', 'hi');
                      }
                    }}
                    className="flex-1 text-xs h-8"
                  >
                    हिंदी
                  </Button>
                </div>
                <div className="hidden">
                  <GoogleTranslate />
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
