import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useWishlistStore as useWishlist } from '@/store/useWishlistStore';
import { useAuth } from '@/contexts/AuthContext';
import { useUnreadNotificationCount } from '@/hooks/useNotifications';
import { NotificationSystem } from './NotificationSystem';
import { Home, LayoutDashboard, Heart, FileText, Briefcase, Bell, Newspaper, PlaySquare, Users, Settings as SettingsIcon, LogIn, LogOut, ChevronRight, ChevronLeft, Plus, Calendar, BarChart3 } from 'lucide-react';
import { useApplication } from '@/contexts/ApplicationContext';

interface CollapsibleSidebarProps {
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const CollapsibleSidebar = ({ isExpanded = false, onToggle }: CollapsibleSidebarProps) => {
  const { theme, toggleTheme, increaseFontSize, decreaseFontSize } = useTheme();
  const { wishlist } = useWishlist();
  const { currentUser, userType, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const { applications } = useApplication();

  // Use the existing React Query hook for real-time unread counts
  const { data: unreadNotifications = 0 } = useUnreadNotificationCount(currentUser?.uid || null);

  const applicationsCount = applications.length;

  const navSections = userType === 'recruiter' ? [
    {
      title: 'RECRUITER PORTAL',
      links: [
        { href: '/recruiter/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/recruiter/post-job', label: 'Post Job', icon: Plus },
        { href: '/recruiter/manage-internships', label: 'Manage Internships', icon: Briefcase },
      ]
    },
    {
      title: 'TALENT PIPELINE',
      links: [
        { href: '/recruiter/candidates', label: 'Candidates', icon: Users },
        { href: '/recruiter/applications', label: 'Applications', icon: FileText },
        { href: '/recruiter/interviews', label: 'Interviews', icon: Calendar },
        { href: '/recruiter/analytics', label: 'Analytics', icon: BarChart3 },
      ]
    },
    {
      title: 'ACCOUNT',
      links: [
        { href: '/recruiter/settings', label: 'Settings', icon: SettingsIcon }
      ]
    }
  ] : [
    {
      title: 'MAIN',
      links: [
        { href: '/', label: 'Home', icon: Home },
        ...(currentUser ? [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
        { href: '/resume', label: 'Resume', icon: FileText },
      ]
    },
    {
      title: 'RESOURCES',
      links: [
        { href: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlist.length > 0 ? wishlist.length : undefined },
        ...(currentUser ? [{ href: '/application-dashboard', label: 'Applications', icon: Briefcase, badge: applicationsCount > 0 ? applicationsCount : undefined }] : []),
        ...(currentUser ? [{ href: '/notifications', label: 'Notifications', icon: Bell, badge: unreadNotifications > 0 ? unreadNotifications : undefined }] : []),
        { href: '/news-events', label: 'News & Events', icon: Newspaper },
        { href: '/tutorials', label: 'Tutorials', icon: PlaySquare },
        ...(currentUser ? [{ href: '/referrals', label: 'Referrals', icon: Users }] : []),
      ]
    },
    {
      title: 'ACCOUNT',
      links: [
        ...(currentUser ? [{ href: '/profile', label: 'Profile & Settings', icon: SettingsIcon }] : [])
      ]
    }
  ];

  const isActive = (path: string) => location.pathname === path;
  
  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <>
      <div 
        className="w-[280px] h-full flex flex-col bg-transparent text-foreground"
      >
        {/* Header - Logo */}
        <div className="flex items-center justify-start px-5 h-16 shrink-0 mt-2">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img 
              src="/logo.webp" 
              alt="UpSkillers" 
              className="w-8 h-8 rounded-lg brightness-0 dark:invert shrink-0"
              loading="eager"
            />
            <span className={`font-racing text-xl font-bold tracking-widest hidden md:block transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>UpSkillers</span>
          </a>
        </div>

        {/* Navigation Links (Hidden Scrollbar) */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="space-y-4 mt-2">
            {navSections.map((section, idx) => (
              <div key={idx}>
                {/* Section Links */}
                <div className="space-y-1">
                  {section.links.map((link) => (
                    <button
                      key={link.href}
                      onClick={() => handleNavClick(link.href)}
                      className={`w-full flex items-center justify-between px-4 py-3 transition-all duration-200 relative ${
                        isActive(link.href) 
                          ? 'text-foreground font-bold bg-foreground/10 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
                          : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5 rounded-xl font-medium'
                      }`}
                      title={link.label}
                    >
                      {/* Active State Edge Highlight */}
                      {isActive(link.href) && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                      )}

                      <div className="flex items-center gap-3">
                        <link.icon className={`w-[20px] h-[20px] shrink-0 transition-colors ${isActive(link.href) ? 'text-foreground' : 'text-foreground/50 group-hover:text-foreground'}`} />
                        <span className={`text-sm tracking-wide whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          {link.label}
                        </span>
                      </div>
                      
                      {link.badge && (
                        <div className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          <span className="bg-foreground/10 text-foreground border border-border text-xs rounded-full min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center font-bold shadow-sm">
                            {link.badge}
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="p-4 space-y-3 mt-auto pb-6">
          {/* Auth & Profile Section */}
          {!currentUser ? (
            <div className="pt-4 border-t border-border">
              <button 
                onClick={() => handleNavClick('/login')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-foreground/70 hover:bg-foreground/10 hover:text-foreground rounded-xl transition-all duration-200"
                title="Login"
              >
                <LogIn className="w-[20px] h-[20px] shrink-0 text-foreground/50 group-hover:text-foreground transition-colors" />
                <span className={`font-semibold text-sm whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>Login</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-border/40">
              <div className="flex items-center justify-between hover:bg-foreground/10 rounded-xl p-1 mx-2 transition-all duration-200 group/profile">
                {/* Profile Item */}
                <button 
                  onClick={() => handleNavClick(userType === 'recruiter' ? '/recruiter/dashboard' : '/profile')}
                  className="flex items-center space-x-3 p-1 flex-1 min-w-0"
                  title="Profile"
                >
                  <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center flex-shrink-0 ring-1 ring-border">
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt="Profile" className="w-10 h-10 rounded-full" />
                    ) : (
                      <span className="font-bold text-foreground">
                        {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className={`min-w-0 flex-1 text-left transition-all duration-300 whitespace-nowrap overflow-hidden ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto'}`}>
                    <p className="font-semibold text-foreground truncate">
                      {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-foreground/70 capitalize truncate">
                      {userType || 'Student'}
                    </p>
                  </div>
                </button>

                {/* Logout Item */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogout();
                  }}
                  className={`p-2 rounded-lg text-foreground/50 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300 ${isExpanded ? 'opacity-100 block' : 'hidden opacity-0 group-hover:block group-hover:opacity-100'}`}
                  title="Logout"
                >
                  <LogOut className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>
          )}

          {/* Toggle Button */}
          {onToggle && (
            <div className="pt-2">
              <button
                onClick={onToggle}
                className="w-full flex items-center gap-3 px-4 py-3 text-foreground/50 hover:bg-foreground/5 hover:text-foreground rounded-xl transition-all duration-200"
                title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
              >
                {isExpanded ? (
                  <ChevronLeft className="w-[20px] h-[20px] shrink-0 transition-colors" />
                ) : (
                  <ChevronRight className="w-[20px] h-[20px] shrink-0 transition-colors" />
                )}
                <span className={`font-semibold text-sm tracking-wide whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  {isExpanded ? 'Collapse' : 'Expand'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};