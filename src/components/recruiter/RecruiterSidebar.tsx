import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  Plus,
  Briefcase,
  MessageSquare,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Link, useLocation } from 'react-router-dom';

export const RecruiterSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { theme } = useTheme();
  const location = useLocation();

  const [applicationCount, setApplicationCount] = useState(0);
  const [candidateCount, setCandidateCount] = useState(0);
  const [interviewCount, setInterviewCount] = useState(0);

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/recruiter/dashboard', badge: null },
    { icon: Plus, label: 'Post Job', path: '/recruiter/post-job', badge: null },
    { icon: Briefcase, label: 'Manage Internships', path: '/recruiter/manage-internships', badge: null },
    { icon: Users, label: 'Candidates', path: '/recruiter/candidates', badge: candidateCount > 0 ? candidateCount : null },
    { icon: FileText, label: 'Applications', path: '/recruiter/applications', badge: applicationCount > 0 ? applicationCount : null },
    { icon: Calendar, label: 'Interviews', path: '/recruiter/interviews', badge: interviewCount > 0 ? interviewCount : null },
    { icon: BarChart3, label: 'Analytics', path: '/recruiter/analytics', badge: null },
    { icon: Settings, label: 'Settings', path: '/recruiter/settings', badge: null },
  ];

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsExpanded(false);
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Mobile menu
  if (isMobile) {
    return (
      <>
        {/* Mobile header with hamburger on TOP-RIGHT */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border h-16 flex items-center px-4 md:hidden">
          <div className="flex-1 flex items-center justify-start">
            <img src="/logo.png" alt="Saksham AI" className="h-8 w-auto" onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = '<span class="font-bold">Recruiter</span>';
            }} />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 ml-auto"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile sidebar */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsMobileOpen(false)}>
            <div
              className="fixed left-0 top-16 bottom-0 w-64 bg-background border-r border-border overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="p-2 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link key={item.path} to={item.path}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={`w-full justify-start h-12 px-4 ${
                          isActive ? 'bg-primary/10 text-primary' : ''
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="ml-3 flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop sidebar
  return (
    <div className={`hidden md:flex bg-background border-r border-border transition-all duration-300 h-full flex-col ${
      isExpanded ? 'w-[280px]' : 'w-[70px]'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {isExpanded && (
            <Link to="/recruiter/dashboard" className="flex items-center space-x-2 hover:opacity-80">
              <img src="/logo.png" alt="Saksham AI" className="h-6 w-6" onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<building2 class="w-6 h-6 text-primary"></building2><span class="font-bold text-lg">Recruiter</span>';
              }} />
              <span className="font-bold text-lg">Recruiter</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2"
          >
            {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start h-12 ${
                  isExpanded ? 'px-4' : 'px-3'
                } ${isActive ? 'bg-primary/10 text-primary' : ''}`}
                title={!isExpanded ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isExpanded && (
                  <>
                    <span className="ml-3 flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        {isExpanded && (
          <p className="text-xs text-muted-foreground text-center">
            Recruiter Panel v1.0
          </p>
        )}
      </div>
    </div>
  );
};
