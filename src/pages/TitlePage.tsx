import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { InternshipCard } from '@/components/InternshipCard';
import { LazyComponent } from '@/components/LazyComponent';
import { SkeletonCard } from '@/components/SkeletonLoaders';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Briefcase, AlertCircle } from 'lucide-react';
import { FirestoreService } from '@/services/firestoreService';
import { fetchInternships } from '@/lib/dataExtractor';

export const TitlePage = () => {
  const { title } = useParams<{ title: string }>();
  const navigate = useNavigate();
  const [allInternships, setAllInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const decodedTitle = (title || '').replace(/-/g, ' ');
  const displayTitle = decodedTitle.charAt(0).toUpperCase() + decodedTitle.slice(1);
  
  useEffect(() => {
    const loadInternships = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchInternships();
        setAllInternships(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load internships:', error);
        setError('Failed to load internships data');
      } finally {
        setLoading(false);
      }
    };
    
    loadInternships();
    
    // Set search value to title when page loads
    if (decodedTitle) {
      const searchEvent = new CustomEvent('globalSearch', {
        detail: { query: decodedTitle }
      });
      window.dispatchEvent(searchEvent);
    }
  }, [decodedTitle]);

  const internships = useMemo(() => {
    if (!decodedTitle || allInternships.length === 0) {
      return allInternships;
    }
    
    const normalizedTitle = decodedTitle.toLowerCase().trim();
    
    // Only match if title or role contains the exact search term
    return allInternships.filter((internship: any) => {
      const title = (internship.title || '').toLowerCase().trim();
      const role = (internship.role || '').toLowerCase().trim();
      
      return title.includes(normalizedTitle) || role.includes(normalizedTitle);
    });
  }, [decodedTitle, allInternships]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground animate-pulse">Loading {displayTitle} internships...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4 p-2 hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Button>
        
        <div className="flex items-center gap-3 mb-2">
          <Briefcase className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            {displayTitle} Internships
          </h1>
        </div>
        
        <p className="text-muted-foreground mb-8">
          Found {internships.length} internships for {displayTitle} positions
        </p>

        {error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Error Loading Internships
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : internships.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Data Temporarily Unavailable
            </h3>
            <p className="text-muted-foreground mb-4">
              We're optimizing our database. Please try again in a few moments, or check out our other internships.
            </p>
            <Button onClick={() => navigate('/')} className="mr-2">
              Browse All Internships
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        ) : internships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internships.map((internship, index) => (
              <div key={internship.id || index} className="animate-in fade-in-50 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                <LazyComponent 
                  fallback={<SkeletonCard />}
                  rootMargin="200px"
                >
                  <InternshipCard 
                    internship={internship}
                    matchExplanation=""
                    aiTags={[]}
                    aiScore={0}
                  />
                </LazyComponent>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No internships found
            </h3>
            <p className="text-muted-foreground mb-4">
              No internships found for {displayTitle}
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/')} className="hover:scale-105 transition-transform mr-2">
                Browse All Internships
              </Button>
              <p className="text-sm text-muted-foreground">
                also same for profiles do make like example lets say username is ananay then site/profiles/ananay show up all about him
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TitlePage;