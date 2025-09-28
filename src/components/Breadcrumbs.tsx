import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BreadcrumbItem {
  label: string;
  path: string;
  isLast: boolean;
}

export const Breadcrumbs = () => {
  const location = useLocation();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  useEffect(() => {
    const generateBreadcrumbs = () => {
      const pathnames = location.pathname.split('/').filter(x => x);
      
      if (pathnames.length === 0) {
        setBreadcrumbs([]);
        return;
      }

      const crumbs: BreadcrumbItem[] = [];
      let currentPath = '';

      // Add home
      crumbs.push({
        label: 'Home',
        path: '/',
        isLast: false
      });

      // Generate breadcrumbs dynamically
      pathnames.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const isLast = index === pathnames.length - 1;
        
        // Smart label generation
        let label = segment;
        
        // Handle special cases
        if (segment === 'news-events') {
          label = 'News & Events';
        } else if (segment === 'search-results' || segment === 'live-jobs') {
          label = 'Search Results';
        } else if (segment.includes('-')) {
          // Convert kebab-case to Title Case
          label = segment.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
        } else if (segment === 'u') {
          label = 'Profile';
        } else {
          // Capitalize first letter
          label = segment.charAt(0).toUpperCase() + segment.slice(1);
        }
        
        crumbs.push({
          label,
          path: currentPath,
          isLast
        });
      });

      setBreadcrumbs(crumbs);
    };

    generateBreadcrumbs();
  }, [location.pathname]);

  if (breadcrumbs.length === 0) return null;

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6 px-4 pt-2">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center">
          {index > 0 && <ChevronRight className="w-4 h-4 mx-1" />}
          {crumb.isLast ? (
            <span className="text-foreground font-medium">{crumb.label}</span>
          ) : (
            <Link 
              to={crumb.path} 
              className="hover:text-foreground transition-colors font-medium"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};