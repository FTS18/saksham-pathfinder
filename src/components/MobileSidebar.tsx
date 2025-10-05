import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogIn, LogOut, User, Menu, X, ChevronDown, Home, Info, Heart, Newspaper, Play, Users, Settings as SettingsIcon, LayoutDashboard, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import GoogleTranslate from './GoogleTranslate';
import { GoogleTranslateErrorBoundary } from './GoogleTranslateErrorBoundary';

export const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme, increaseFontSize, decreaseFontSize } = useTheme();
  const { wishlist } = useWishlist();
  const { currentUser, userType, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    ...(currentUser ? [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
    { href: '/about', label: 'About', icon: Info },
    ...(currentUser ? [{ href: '/wishlist', label: `Wishlist (${wishlist.length})`, icon: Heart }] : []),
    ...(currentUser ? [{ href: '/applications', label: 'Applications', icon: FileText }] : []),
    { href: '/news-events', label: 'News & Events', icon: Newspaper },
    { href: '/tutorials', label: 'Tutorials', icon: Play },
    ...(currentUser ? [{ href: '/referrals', label: 'Refer', icon: Users }] : []),
    ...(currentUser ? [{ href: '/profile', label: 'Settings', icon: SettingsIcon }] : [])
  ];

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener('toggleMobileSidebar', handleToggle);
    return () => window.removeEventListener('toggleMobileSidebar', handleToggle);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavClick = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const toggleLanguage = () => {
    const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    const currentLang = localStorage.getItem('selectedLanguage') || 'en';
    const newLang = currentLang === 'en' ? 'hi' : 'en';
    
    if (combo) {
      combo.value = newLang;
      combo.dispatchEvent(new Event('change'));
      localStorage.setItem('selectedLanguage', newLang);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Sidebar */}
      <div className={`md:hidden fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="absolute inset-0 bg-black/20" onClick={() => setIsOpen(false)} />
        <div className="absolute left-0 top-0 h-full w-72 bg-background border-r border-border shadow-xl transform transition-transform duration-300 ease-in-out">
          <div className="flex flex-col h-full pt-16 overflow-hidden">
            {/* User Profile */}
            {currentUser && (
              <div className="p-4 border-b border-border">
                <button 
                  onClick={() => handleNavClick(userType === 'recruiter' ? '/recruiter/dashboard' : '/profile')}
                  className="w-full flex items-center space-x-3 hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt="Profile" className="w-10 h-10 rounded-full" />
                    ) : (
                      <User className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {userType || 'Student'}
                    </p>
                  </div>
                </button>
              </div>
            )}

            {/* Navigation - Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              <div className="space-y-1">
                {navLinks.map((link) => {
                  const IconComponent = link.icon;
                  return (
                    <button
                      key={link.href}
                      onClick={() => handleNavClick(link.href)}
                      className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium hover:bg-muted rounded-lg transition-colors ${
                        isActive(link.href) ? 'text-primary bg-primary/10' : 'text-foreground'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      {link.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fixed Controls at Bottom */}
            <div className="p-4 border-t border-border bg-background">
              {/* Accessibility */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Accessibility</h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={toggleTheme}>
                    {theme === 'light' ? 'Dark' : 'Light'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={increaseFontSize}>
                    A+
                  </Button>
                  <Button variant="outline" size="sm" onClick={decreaseFontSize}>
                    A-
                  </Button>
                  <Button variant="outline" size="sm" onClick={toggleLanguage}>
                    <span className="text-sm">
                      {localStorage.getItem('selectedLanguage') === 'hi' ? 'EN' : 'हि'}
                    </span>
                  </Button>
                </div>
              </div>

              {/* Auth */}
              {!currentUser ? (
                <div className="space-y-2">
                  <Button onClick={() => handleNavClick('/login')} className="w-full">Login</Button>
                  <Button variant="outline" onClick={() => handleNavClick('/register')} className="w-full">Sign Up</Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full text-destructive hover:bg-destructive/10"
                >
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Google Translate */}
      <div className="hidden">
        <GoogleTranslateErrorBoundary>
          <GoogleTranslate />
        </GoogleTranslateErrorBoundary>
      </div>
    </>
  );
};