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
  ChevronRight
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Link, useLocation } from 'react-router-dom';

export const RecruiterSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();
  const location = useLocation();

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/recruiter/dashboard', badge: null },
    { icon: Plus, label: 'Post Job', path: '/recruiter/post-job', badge: null },
    { icon: Briefcase, label: 'Manage Internships', path: '/recruiter/manage-internships', badge: null },
    { icon: Users, label: 'Candidates', path: '/recruiter/candidates', badge: null },
    { icon: FileText, label: 'Applications', path: '/recruiter/applications', badge: null },
    { icon: Calendar, label: 'Interviews', path: '/recruiter/interviews', badge: null },
    { icon: BarChart3, label: 'Analytics', path: '/recruiter/analytics', badge: null },
    { icon: Settings, label: 'Settings', path: '/recruiter/settings', badge: null },
  ];

  useEffect(() => {
    const handleToggle = () => setIsExpanded(!isExpanded);
    const handleCollapse = () => setIsExpanded(false);
    
    window.addEventListener('toggleRecruiterSidebar', handleToggle);
    window.addEventListener('collapseRecruiterSidebar', handleCollapse);
    
    return () => {
      window.removeEventListener('toggleRecruiterSidebar', handleToggle);
      window.removeEventListener('collapseRecruiterSidebar', handleCollapse);
    };
  }, [isExpanded]);

  return (
    <div className={`bg-background border-r border-border transition-all duration-300 h-full flex flex-col ${
      isExpanded ? 'w-[280px]' : 'w-[60px]'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {isExpanded && (
            <div className="flex items-center space-x-2">
              <Building2 className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg">Recruiter</span>
            </div>
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
      <nav className="flex-1 p-2 space-y-1">
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
    </div>
  );
};