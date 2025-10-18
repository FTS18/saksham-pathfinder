import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { InternshipCard } from '@/components/InternshipCard';
import { LazyComponent } from '@/components/LazyComponent';
import { SkeletonCard } from '@/components/SkeletonLoaders';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Briefcase, AlertCircle } from 'lucide-react';
import { FirestoreService } from '@/services/firestoreService';
import { fetchInternships } from '@/lib/dataExtractor';

export const SectorPage = () => {
  const { sector } = useParams<{ sector: string }>();
  const navigate = useNavigate();
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const decodedSector = decodeURIComponent(sector || '');
  const displaySector = decodedSector.charAt(0).toUpperCase() + decodedSector.slice(1);

  useEffect(() => {
    const loadInternships = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchInternships();
        
        const allData = Array.isArray(data) ? data : [];
        
        if (!decodedSector) {
          setInternships(allData);
          return;
        }
        
        // Normalize the search term
        const normalizedSector = decodedSector.toLowerCase().trim();
        
        const filtered = allData.filter((internship: any) => {
          const sectors = internship.sector_tags || [];
          // Only match exact sectors in sector_tags array
          return sectors.some((sector: string) => 
            sector.toLowerCase().trim() === normalizedSector
          );
        });
        
        setInternships(filtered);
      } catch (error) {
        console.error('Failed to load internships:', error);
        setError('Failed to load internships data');
      } finally {
        setLoading(false);
      }
    };

    loadInternships();
    
    // Set search value to sector name when page loads
    if (decodedSector) {
      const searchEvent = new CustomEvent('globalSearch', {
        detail: { query: decodedSector }
      });
      window.dispatchEvent(searchEvent);
    }
  }, [decodedSector]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground animate-pulse">Loading {displaySector} internships...</p>
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
          <Briefcase className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            {displaySector} Internships
          </h1>
        </div>
        
        <p className="text-muted-foreground mb-8">
          Found {internships.length} internships in {displaySector} sector
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
            <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No internships found
            </h3>
            <p className="text-muted-foreground mb-4">
              No internships found in {displaySector} sector
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/')} className="hover:scale-105 transition-transform mr-2">
                Browse All Internships
              </Button>
              <p className="text-sm text-muted-foreground">
                and on clicking on either links over cards or on search or pressing enter in search show all from that parameter satisfying not only ones matching
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};