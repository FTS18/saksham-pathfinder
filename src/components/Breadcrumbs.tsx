import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path: string;
  isLast: boolean;
}

export const Breadcrumbs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  useEffect(() => {
    const generateBreadcrumbs = () => {
      const pathnames = location.pathname.split('/').filter(x => x);
      
      if (pathnames.length === 0) {
        setBreadcrumbs([]);
        return;
      }

      const crumbs: BreadcrumbItem[] = [];
      let buildPath = '';

      // Add home
      crumbs.push({
        label: 'Home',
        path: '/',
        isLast: false
      });

      // Generate breadcrumbs dynamically
      pathnames.forEach((segment, index) => {
        buildPath += `/${segment}`;
        const isLast = index === pathnames.length - 1;
        
        // Smart label generation
        let label = segment;
        
        // Handle special cases
        if (segment === 'news-events') {
          label = 'News & Events';
        } else if (segment === 'search-results' || segment === 'live-jobs') {
          label = 'Search Results';
        } else if (segment === 'u') {
          label = 'Profile';
        } else if (index > 0) {
          // For URL parameters (like skill names), decode and format them
          const decoded = decodeURIComponent(segment);
          if (pathnames[index - 1] === 'skill') {
            label = `${decoded.charAt(0).toUpperCase() + decoded.slice(1)} Skills`;
          } else if (pathnames[index - 1] === 'sector') {
            label = `${decoded.charAt(0).toUpperCase() + decoded.slice(1)} Sector`;
          } else if (pathnames[index - 1] === 'city') {
            label = `${decoded.charAt(0).toUpperCase() + decoded.slice(1)} Jobs`;
          } else if (pathnames[index - 1] === 'company') {
            label = `${decoded.charAt(0).toUpperCase() + decoded.slice(1)} Internships`;
          } else if (pathnames[index - 1] === 'title') {
            label = `${decoded} Positions`;
          } else if (segment.includes('-')) {
            // Convert kebab-case to Title Case
            label = segment.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
          } else {
            // Capitalize first letter
            label = decoded.charAt(0).toUpperCase() + decoded.slice(1);
          }
        } else if (segment.includes('-')) {
          // Convert kebab-case to Title Case
          label = segment.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
        } else {
          // Capitalize first letter
          label = segment.charAt(0).toUpperCase() + segment.slice(1);
        }
        
        crumbs.push({
          label,
          path: buildPath,
          isLast
        });
      });

      setBreadcrumbs(crumbs);
    };

    generateBreadcrumbs();
  }, [location.pathname]);

  if (breadcrumbs.length === 0) return null;

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-1 px-4">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center">
          {index > 0 && <ChevronRight className="w-4 h-4 mx-1" />}
          {crumb.isLast ? (
            <span className="text-foreground font-medium">{crumb.label}</span>
          ) : (
            <button 
              onClick={() => navigate(crumb.path)}
              className="hover:text-foreground transition-colors font-medium text-left"
            >
              {crumb.label}
            </button>
          )}
        </div>
      ))}
    </nav>
  );
};