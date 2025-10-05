import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogIn, LogOut, User, Home, Briefcase, Info, Heart, Newspaper, Play, Users, Settings as SettingsIcon, Menu, ChevronLeft, ChevronRight, LayoutDashboard, FileText, Bug, Bell } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip';
import { NotificationSystem } from './NotificationSystem';
import GoogleTranslate from './GoogleTranslate';
import { GoogleTranslateErrorBoundary } from './GoogleTranslateErrorBoundary';

export const CollapsibleSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHamburgerArea, setIsHamburgerArea] = useState(false);
  
  // Add global collapse handler and emit sidebar state
  useEffect(() => {
    const handleCollapse = () => setIsExpanded(false);
    window.addEventListener('collapseSidebar', handleCollapse);
    return () => window.removeEventListener('collapseSidebar', handleCollapse);
  }, []);
  
  // Emit sidebar state changes
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { expanded: isExpanded } }));
  }, [isExpanded]);

  const { theme, toggleTheme, increaseFontSize, decreaseFontSize } = useTheme();
  const { wishlist } = useWishlist();
  const { currentUser, userType, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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

  const [applicationsCount, setApplicationsCount] = useState(0);
  const [notificationsCount, setNotificationsCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      const apps = JSON.parse(localStorage.getItem('applications') || '[]');
      setApplicationsCount(apps.length);
      
      const notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
      const unread = notifs.filter((n: any) => !n.read).length;
      setNotificationsCount(unread);
    }
  }, [currentUser]);

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    ...(currentUser ? [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
    { href: '/about', label: 'About', icon: Info },
    { href: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlist.length > 0 ? wishlist.length : undefined },
    ...(currentUser ? [{ href: '/applications', label: 'Applications', icon: FileText, badge: applicationsCount > 0 ? applicationsCount : undefined }] : []),
    ...(currentUser ? [{ href: '/notifications', label: 'Notifications', icon: Bell, badge: notificationsCount > 0 ? notificationsCount : undefined }] : []),
    { href: '/dashboard/news-events', label: 'News & Events', icon: Newspaper },
    { href: '/dashboard/tutorials', label: 'Tutorials', icon: Play },
    { href: '/referrals', label: 'Refer', icon: Users },
    { href: '/report-issue', label: 'Report Issue', icon: Bug },
    { href: '/profile', label: 'Settings', icon: SettingsIcon }
  ];



  const isActive = (path: string) => location.pathname === path;
  
  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <TooltipProvider>
      <div 
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur-xl border-r border-border/50 z-30 transition-all duration-300 flex flex-col shadow-2xl ${
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
        <div className="flex items-center justify-center p-3 border-b border-border cursor-pointer hover:bg-muted/30 transition-colors rounded-t-xl">
          <Menu className="w-5 h-5 text-primary" />
        </div>

        {/* User Profile */}
        {currentUser && (
          <div className="p-4 border-b border-border">
            <button 
              onClick={() => handleNavClick(userType === 'recruiter' ? '/recruiter/dashboard' : '/profile')}
              className="w-full flex items-center space-x-3 hover:bg-muted/50 rounded-2xl p-2 -m-2 transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 ring-2 ring-primary/20">
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
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">

            
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              const linkContent = (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={`w-full flex items-center px-3 py-2.5 rounded-2xl transition-all duration-200 hover-scale-sm btn-press ${
                    isActive(link.href) 
                      ? 'text-primary bg-primary/15 shadow-md ring-2 ring-primary/30' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:shadow-md hover:ring-2 hover:ring-muted/30'
                  } ${isExpanded ? 'space-x-3' : 'justify-center'}`}
                >
                  {!isExpanded ? (
                    <div className="relative">
                      <IconComponent className="w-5 h-5 flex-shrink-0" />
                      {link.badge && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {link.badge}
                        </span>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <IconComponent className="w-5 h-5 flex-shrink-0" />
                        {link.badge && (
                          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            {link.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium truncate">{link.label}</span>
                    </>
                  )}
                </button>
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

          {/* Auth Section */}
          {!currentUser ? (
            <div className={`${isExpanded ? 'space-y-2' : 'flex flex-col space-y-2'}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleNavClick('/login')}
                    className={`rounded-2xl transition-all duration-200 hover:scale-105 ${isExpanded ? 'w-full justify-start' : 'w-8 h-8 p-0'}`}
                  >
                    <LogIn className="w-5 h-5" />
                    {isExpanded && <span className="ml-2">Login</span>}
                  </Button>
                </TooltipTrigger>
                {!isExpanded && <TooltipContent side="right">Login</TooltipContent>}
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    onClick={() => handleNavClick('/register')}
                    className={`rounded-2xl transition-all duration-200 hover:scale-105 ${isExpanded ? 'w-full' : 'w-8 h-8 p-0 text-xs'}`}
                  >
                    {isExpanded ? 'Sign Up' : 'S'}
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
                  className={`text-destructive hover:bg-destructive/10 rounded-2xl transition-all duration-200 hover:scale-105 ${
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
        <GoogleTranslateErrorBoundary>
          <GoogleTranslate />
        </GoogleTranslateErrorBoundary>
      </div>
    </TooltipProvider>
  );
};