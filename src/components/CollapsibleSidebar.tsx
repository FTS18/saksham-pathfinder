import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, LogOut, User, Home, Briefcase, Info, Heart, Newspaper, Play, Users, Settings as SettingsIcon } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip';
import { NotificationSystem } from './NotificationSystem';
import GoogleTranslate from './GoogleTranslate';

export const CollapsibleSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHamburgerArea, setIsHamburgerArea] = useState(false);
  
  // Add global collapse handler
  useEffect(() => {
    const handleCollapse = () => setIsExpanded(false);
    window.addEventListener('collapseSidebar', handleCollapse);
    return () => window.removeEventListener('collapseSidebar', handleCollapse);
  }, []);
  const { theme, toggleTheme, increaseFontSize, decreaseFontSize } = useTheme();
  const { wishlist } = useWishlist();
  const { currentUser, userType, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', isExpanded ? '280px' : '60px');
  }, [isExpanded]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/about', label: 'About', icon: Info },
    { href: '/wishlist', label: `Wishlist (${wishlist.length})`, icon: Heart },
    { href: '/dashboard/news-events', label: 'News & Events', icon: Newspaper },
    { href: '/dashboard/tutorials', label: 'Tutorials', icon: Play },
    { href: '/referrals', label: 'Refer', icon: Users },
    { href: '/profile', label: 'Settings', icon: SettingsIcon }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <TooltipProvider>
      <div 
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-accent/10 dark:bg-accent/5 border-r border-border z-20 transition-all duration-300 flex flex-col hover-scale-sm ${
          isExpanded ? 'w-[280px]' : 'w-[60px]'
        }`}
        onClick={(e) => {
          // Check if click is on content area (not header)
          const rect = e.currentTarget.getBoundingClientRect();
          const y = e.clientY - rect.top;
          if (y < 60) {
            setIsExpanded(!isExpanded);
          }
        }}
        data-sidebar-toggle={isExpanded}
      >
        {/* Header */}
        <div className="flex items-center justify-center p-3 border-b border-border cursor-pointer hover:bg-muted/30 transition-colors">
          <div className="flex flex-col space-y-1">
            <div className="w-4 h-0.5 bg-primary rounded"></div>
            <div className="w-4 h-0.5 bg-primary rounded"></div>
            <div className="w-4 h-0.5 bg-primary rounded"></div>
          </div>
        </div>

        {/* User Profile */}
        {currentUser && (
          <div className="p-4 border-b border-border">
            <Link 
              to={userType === 'recruiter' ? '/recruiter/dashboard' : '/profile'} 
              className="flex items-center space-x-3 hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="Profile" className="w-10 h-10 rounded-full" />
                ) : (
                  <User className="w-5 h-5 text-primary" />
                )}
              </div>
              {isExpanded && (
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground truncate">
                    {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {userType || 'Student'}
                  </p>
                </div>
              )}
            </Link>
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              const linkContent = (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 hover-scale-sm btn-press ${
                    isActive(link.href) 
                      ? 'text-primary bg-primary/10 shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:shadow-sm'
                  } ${isExpanded ? 'space-x-3' : 'justify-center'}`}
                >
                  {!isExpanded ? (
                    <IconComponent className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <>
                      <IconComponent className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{link.label}</span>
                    </>
                  )}
                </Link>
              );
              
              return !isExpanded ? (
                <Tooltip key={link.href}>
                  <TooltipTrigger asChild>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right">{link.label}</TooltipContent>
                </Tooltip>
              ) : linkContent;
            })}
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="p-4 border-t border-border space-y-2">
          {/* Expand Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full justify-center"
              >
                {isExpanded ? '←' : '→'}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{isExpanded ? 'Collapse' : 'Expand'}</TooltipContent>
          </Tooltip>

          {/* Auth Section */}
          {!currentUser ? (
            <div className={`${isExpanded ? 'space-y-2' : 'flex flex-col space-y-2'}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" asChild className={isExpanded ? 'w-full justify-start' : 'w-8 h-8 p-0'}>
                    <Link to="/login">
                      <LogIn className="w-5 h-5" />
                      {isExpanded && <span className="ml-2">Login</span>}
                    </Link>
                  </Button>
                </TooltipTrigger>
                {!isExpanded && <TooltipContent side="right">Login</TooltipContent>}
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" asChild className={isExpanded ? 'w-full' : 'w-8 h-8 p-0 text-xs'}>
                    <Link to="/register">
                      {isExpanded ? 'Sign Up' : 'S'}
                    </Link>
                  </Button>
                </TooltipTrigger>
                {!isExpanded && <TooltipContent side="right">Sign Up</TooltipContent>}
              </Tooltip>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className={`text-destructive hover:bg-destructive/10 ${
                    isExpanded ? 'w-full justify-start' : 'w-8 h-8 p-0'
                  }`}
                >
                  <LogOut className="w-5 h-5" />
                  {isExpanded && <span className="ml-2">Logout</span>}
                </Button>
              </TooltipTrigger>
              {!isExpanded && <TooltipContent side="right">Logout</TooltipContent>}
            </Tooltip>
          )}
        </div>
      </div>

      {/* Hidden Google Translate */}
      <div className="hidden">
        <GoogleTranslate />
      </div>
    </TooltipProvider>
  );
};