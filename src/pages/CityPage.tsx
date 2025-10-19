import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { InternshipCard } from '@/components/InternshipCard';
import { InternshipFilters } from '@/components/InternshipFilters';
import { useInternshipFilters } from '@/hooks/useInternshipFilters';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, AlertCircle } from 'lucide-react';
import { Internship } from '@/types';

import { fetchInternships } from '@/lib/dataExtractor';

export const CityPage = () => {
  const { city } = useParams<{ city: string }>();
  const navigate = useNavigate();
  const [allInternships, setAllInternships] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const decodedCity = (city || '').replace(/-/g, ' ');
  const displayCity = decodedCity.charAt(0).toUpperCase() + decodedCity.slice(1);
  
  // Debug logging
  console.log('CityPage - Raw city param:', city);
  console.log('CityPage - Decoded city:', decodedCity);
  console.log('CityPage - All internships count:', allInternships.length);

  useEffect(() => {
    const loadInternships = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchInternships();
        setAllInternships(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load internships:', error);
        setError('Failed to load internships data');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (decodedCity) {
      loadInternships();
      
      // Set search value to city name when page loads
      const searchEvent = new CustomEvent('globalSearch', {
        detail: { query: decodedCity }
      });
      window.dispatchEvent(searchEvent);
    }
  }, [decodedCity]);

  const { filters, setFilters, filteredInternships, sectors, locations } = useInternshipFilters(allInternships);

  // Filter by city - only match in location field
  const cityInternships = filteredInternships.filter(internship => {
    const internshipLocation = typeof internship.location === 'string' ? internship.location : internship.location?.city || '';
    
    // Normalize the search term - handle URL encoding and spaces properly
    let normalizedCity = decodedCity.toLowerCase().trim();
    normalizedCity = normalizedCity.replace(/%20/g, ' ').replace(/\+/g, ' ').replace(/\s+/g, ' ').trim();
    const normalizedLocation = internshipLocation.toLowerCase().trim();
    
    // Try multiple matching strategies
    const exactMatch = normalizedLocation === normalizedCity;
    const containsMatch = normalizedLocation.includes(normalizedCity) || 
                         normalizedCity.includes(normalizedLocation);
    const wordMatch = normalizedCity.split(' ').some(word => 
      word.length > 2 && normalizedLocation.includes(word)
    );
    
    return exactMatch || containsMatch || wordMatch;
  });
  
  console.log('CityPage - Filtered internships count:', cityInternships.length);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground animate-pulse">Loading internships in {displayCity}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-3 p-2 hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Home
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

        <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-4 mb-6 shadow-sm">
          <InternshipFilters
            filters={filters}
            onFiltersChange={setFilters}
            sectors={sectors}
            locations={locations}
          />
        </div>

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
        ) : cityInternships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cityInternships.map((internship, index) => (
              <div key={internship.id || index} className="animate-in fade-in-50 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                <InternshipCard
                  internship={internship}
                  matchExplanation=""
                  aiTags={[]}
                  aiScore={0}
                />
              </div>
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
            <Button onClick={() => navigate('/')} className="hover:scale-105 transition-transform">
              Browse All Internships
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CityPage;