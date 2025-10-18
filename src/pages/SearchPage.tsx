import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { InternshipCard } from '@/components/InternshipCard';
import { LazyComponent } from '@/components/LazyComponent';
import { SkeletonCard } from '@/components/SkeletonLoaders';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, AlertCircle } from 'lucide-react';
import { fetchInternships } from '@/lib/dataExtractor';

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [allInternships, setAllInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const query = searchParams.get('q') || '';
  const decodedQuery = decodeURIComponent(query);
  
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
  }, []);

  const internships = useMemo(() => {
    if (!decodedQuery || allInternships.length === 0) {
      return [];
    }
    
    const normalizedQuery = decodedQuery.toLowerCase().trim();
    
    return allInternships.filter((internship: any) => {
      const title = (internship.title || '').toLowerCase();
      const role = (internship.role || '').toLowerCase();
      const company = (internship.company || '').toLowerCase();
      const location = (internship.location || '').toLowerCase();
      const skills = (internship.required_skills || []).map((s: string) => s.toLowerCase());
      const sectors = (internship.sector_tags || []).map((s: string) => s.toLowerCase());
      
      return title.includes(normalizedQuery) ||
             role.includes(normalizedQuery) ||
             company.includes(normalizedQuery) ||
             location.includes(normalizedQuery) ||
             skills.some((skill: string) => skill.includes(normalizedQuery)) ||
             sectors.some((sector: string) => sector.includes(normalizedQuery));
    });
  }, [decodedQuery, allInternships]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground animate-pulse">Searching internships...</p>
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
          onClick={() => navigate(-1)}
          className="mb-4 p-2 hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        
        <div className="flex items-center gap-3 mb-2">
          <Search className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            Search Results
          </h1>
        </div>
        
        <p className="text-muted-foreground mb-8">
          Found {internships.length} internships for "{decodedQuery}"
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
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No results found
            </h3>
            <p className="text-muted-foreground mb-4">
              No internships found for "{decodedQuery}"
            </p>
            <Button onClick={() => navigate('/')} className="hover:scale-105 transition-transform">
              Browse All Internships
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};