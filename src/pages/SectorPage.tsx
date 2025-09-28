import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { InternshipCard } from '@/components/InternshipCard';
import { LazyComponent } from '@/components/LazyComponent';
import { SkeletonCard } from '@/components/SkeletonLoaders';

export const SectorPage = () => {
  const { sector } = useParams<{ sector: string }>();
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInternships = async () => {
      try {
        const response = await fetch('/internships.json');
        const data = await response.json();
        
        const decodedSector = decodeURIComponent(sector || '');
        const filtered = data.filter((internship: any) =>
          (internship.sector_tags || []).some((s: string) => 
            s.toLowerCase().includes(decodedSector.toLowerCase())
          )
        );
        
        setInternships(filtered);
      } catch (error) {
        console.error('Failed to load internships:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInternships();
  }, [sector]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-6xl mx-auto">
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            🏢 {decodeURIComponent(sector || '')} Internships
          </h1>
          <p className="text-muted-foreground">
            Found {internships.length} internships in {decodeURIComponent(sector || '')} sector
          </p>
        </div>

        {internships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internships.map((internship, index) => (
              <LazyComponent 
                key={internship.id}
                fallback={<SkeletonCard />}
                rootMargin="200px"
              >
                <InternshipCard 
                  internship={internship}
                  currentIndex={index + 1}
                  totalCount={internships.length}
                />
              </LazyComponent>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No internships found
            </h3>
            <p className="text-muted-foreground">
              No internships found in {decodeURIComponent(sector || '')} sector
            </p>
          </div>
        )}
      </div>
    </div>
  );
};