import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogIn, LogOut, User, Menu, X, Home, Heart, Newspaper, Play, Users, Settings as SettingsIcon, LayoutDashboard, FileText, Bell, Plus, Calendar, Briefcase, BarChart3 } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useWishlistStore as useWishlist } from '@/store/useWishlistStore';
import { useAuth } from '@/contexts/AuthContext';

export const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const { theme, toggleTheme, increaseFontSize, decreaseFontSize } = useTheme();
  const { wishlist } = useWishlist();
  const { currentUser, userType, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      const notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
      const unread = notifs.filter((n: any) => !n.read).length;
      setNotificationsCount(unread);
    }
  }, [currentUser]);

  const isRecruiter = userType === 'recruiter';
  const navLinks = isRecruiter ? [
    { href: '/recruiter/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/recruiter/post-job', label: 'Post Job', icon: Plus },
    { href: '/recruiter/manage-internships', label: 'Manage Internships', icon: Briefcase },
    { href: '/recruiter/candidates', label: 'Candidates', icon: Users },
    { href: '/recruiter/applications', label: 'Applications', icon: FileText },
    { href: '/recruiter/interviews', label: 'Interviews', icon: Calendar },
    { href: '/recruiter/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/recruiter/settings', label: 'Settings', icon: SettingsIcon }
  ] : [
    { href: '/', label: 'Home', icon: Home },
    ...(currentUser ? [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
    { href: '/resume', label: 'Resume', icon: FileText },
    ...(currentUser ? [{ href: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlist.length > 0 ? wishlist.length : undefined }] : []),
    ...(currentUser ? [{ href: '/applications', label: 'Applications', icon: FileText }] : []),
    ...(currentUser ? [{ href: '/notifications', label: 'Notifications', icon: Bell, badge: notificationsCount > 0 ? notificationsCount : undefined }] : []),
    { href: '/news-events', label: 'News & Events', icon: Newspaper },
    { href: '/tutorials', label: 'Tutorials', icon: Play },
    ...(currentUser ? [{ href: '/referrals', label: 'Referrals', icon: Users }] : []),
    ...(currentUser ? [{ href: '/profile', label: 'Profile & Settings', icon: SettingsIcon }] : [])
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


  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Sidebar */}
      <div className={cn(
        "md:hidden fixed inset-0 z-50",
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      )}>
        <div 
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity duration-300 ease-out",
            isOpen ? "opacity-100" : "opacity-0"
          )} 
          onClick={() => setIsOpen(false)} 
        />
        <div className={cn(
          "absolute left-0 top-0 h-full w-72 bg-background border-r border-border shadow-xl transform transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
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
                      className={cn(
                        "w-full flex items-center justify-between gap-3 px-3 py-3 text-sm font-medium rounded-lg hover:translate-x-0.5 active:scale-[0.98] transition-all duration-300",
                        isActive(link.href) 
                          ? "text-primary bg-primary/10 font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-primary/10" 
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5" />
                        {link.label}
                      </div>
                      {(link as any).badge && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center font-bold">
                          {(link as any).badge}
                        </span>
                      )}
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
                </div>
              </div>

              {/* Auth */}
              {!currentUser ? (
                <div className="space-y-2">
                <Button onClick={() => handleNavClick('/login')} className="w-full">Login</Button>
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

    </>
  );
};