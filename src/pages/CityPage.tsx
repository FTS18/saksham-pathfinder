import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { InternshipCard } from '@/components/InternshipCard';
import { InternshipFilters } from '@/components/InternshipFilters';
import { useInternshipFilters } from '@/hooks/useInternshipFilters';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin } from 'lucide-react';
import { FirestoreService } from '@/services/firestoreService';

export const CityPage = () => {
  const { city } = useParams<{ city: string }>();
  const [allInternships, setAllInternships] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const decodedCity = decodeURIComponent(city || '');
  const displayCity = decodedCity.charAt(0).toUpperCase() + decodedCity.slice(1);

  useEffect(() => {
    const loadInternships = async () => {
      try {
        // Try Firestore first, fallback to JSON
        try {
          const data = await FirestoreService.getInternshipsByCity(decodedCity);
          setAllInternships(data);
        } catch (firestoreError) {
          console.warn('Firestore failed, using JSON fallback:', firestoreError);
          const response = await fetch('/internships.json');
          const data = await response.json();
          setAllInternships(data);
        }
      } catch (error) {
        console.error('Failed to load internships:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInternships();
  }, [decodedCity]);

  const { filters, setFilters, filteredInternships, sectors, locations } = useInternshipFilters(allInternships);

  // Filter by city
  const cityInternships = filteredInternships.filter(internship => {
    const internshipLocation = typeof internship.location === 'string' ? internship.location : internship.location?.city || '';
    return internshipLocation.toLowerCase().includes(decodedCity.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="mb-3 p-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            Internships in {displayCity}
          </h1>
        </div>
        
        <p className="text-muted-foreground text-sm mb-4">
          Found {cityInternships.length} internships in {displayCity}
        </p>

        <div className="bg-background/95 backdrop-blur-sm rounded-lg p-3 mb-4">
          <InternshipFilters
            filters={filters}
            onFiltersChange={setFilters}
            sectors={sectors}
            locations={locations}
          />
        </div>

        {cityInternships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cityInternships.map((internship) => (
              <InternshipCard
                key={internship.id}
                internship={internship}
                matchExplanation=""
                aiTags={[]}
                aiScore={0}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No internships found in {displayCity}
            </h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or check other locations
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Browse All Internships
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};