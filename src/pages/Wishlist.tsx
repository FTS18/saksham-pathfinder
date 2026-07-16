import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Slider } from '../components/ui/slider';
import { Heart, Calendar, Building2, Sparkles, MapPin, IndianRupee, Filter, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useWishlistStore as useWishlist } from '../store/useWishlistStore';
import { useAuth } from '../contexts/AuthContext';
import { useApplication } from '@/contexts/ApplicationContext';
import { useNavigate } from 'react-router-dom';
import { InternshipCard } from '../components/InternshipCard';
import { PageHeader } from '../components/StickyBreadcrumbHeader';
import { InternshipCarousel } from '../components/InternshipCarousel';

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { currentUser } = useAuth();
  const { applications } = useApplication();
  const navigate = useNavigate();
  const [allInternships, setAllInternships] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [minMatchScore, setMinMatchScore] = useState([70]);
  const [loading, setLoading] = useState(true);

  // Real applied internship IDs from ApplicationContext
  const appliedInternshipIds = useMemo(
    () => new Set(applications.map((a: any) => a.internshipId)),
    [applications]
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Import fetchInternships dynamically
        const { fetchInternships } = await import('@/lib/dataExtractor');
        const internships = await fetchInternships();
        setAllInternships(internships || []);
      } catch (error) {
        console.warn('Failed to load internships data:', error);
        setAllInternships([]);
      }

      // Load profile data
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        try {
          setProfileData(JSON.parse(savedProfile));
        } catch {
          setProfileData(null);
        }
      }
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (allInternships.length > 0 && wishlist.length > 0) {
      const wishlistedInternships = allInternships.filter(internship => 
        wishlist.includes(internship.id)
      );
      
      // Extract skills and sectors from wishlisted items
      const sectors = [...new Set(wishlistedInternships.flatMap(i => i.sector_tags || []))];
      const skills = [...new Set(wishlistedInternships.flatMap(i => i.required_skills || []))];
      const companies = [...new Set(wishlistedInternships.map(i => i.company))];
      const locations = [...new Set(wishlistedInternships.map(i => 
        typeof i.location === 'string' ? i.location : i.location?.city
      ).filter(Boolean))];
      
      // Score and rank similar internships
      const scored = allInternships
        .filter(internship => !wishlist.includes(internship.id))
        .map(internship => {
          let score = 0;
          
          // Sector match (40%)
          const sectorMatches = internship.sector_tags?.filter(tag => sectors.includes(tag)).length || 0;
          score += (sectorMatches / Math.max(sectors.length, 1)) * 40;
          
          // Skill match (35%)
          const skillMatches = internship.required_skills?.filter(skill => skills.includes(skill)).length || 0;
          score += (skillMatches / Math.max(skills.length, 1)) * 35;
          
          // Location match (15%)
          const internshipLocation = typeof internship.location === 'string' ? internship.location : internship.location?.city;
          if (locations.includes(internshipLocation)) score += 15;
          
          // Company similarity (10%)
          if (companies.includes(internship.company)) score += 10;
          
          return { internship, score: Math.round(score) };
        })
        .filter(item => item.score >= minMatchScore[0])
        .sort((a, b) => b.score - a.score)
        .map(item => ({ ...item.internship, matchScore: item.score }));
      
      setRecommendations(scored);
    }
  }, [allInternships, wishlist, minMatchScore]);

  const wishlistedInternships = allInternships.filter(internship => 
    wishlist.includes(internship.id)
  );

  // Count how many wishlisted internships are already applied to
  const appliedWishlistCount = wishlistedInternships.filter(i => appliedInternshipIds.has(i.id)).length;

  return (
    <div className="bg-background">
      <PageHeader
        title={`My Wishlist (${wishlistedInternships.length})`}
        subtitle="Your saved internships and personalized recommendations"
      />
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <main className="w-full" role="main" aria-label="Wishlist page">
          {!currentUser && (
            <Card className="mb-8 bg-blue-500/10 border-blue-500/20">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-900">
                      <strong>Browsing as Guest:</strong> You can explore internships and recommendations below.
                      <a href="/login" className="font-semibold underline ml-1 hover:text-blue-800">Log in or sign up</a> to save your wishlist, apply to internships, and access personalized features.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {wishlistedInternships.length > 0 ? (
            <>
              {/* Applied status banner */}
              {appliedWishlistCount > 0 && (
                <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <p className="text-sm text-foreground">
                    You've applied to <strong>{appliedWishlistCount}</strong> of your {wishlistedInternships.length} saved internships.
                    {' '}<button className="text-primary underline text-sm" onClick={() => navigate('/application-dashboard')}>Track applications →</button>
                  </p>
                </div>
              )}
              {/* Wishlisted Items Section */}
              <section
                className="mb-12"
                aria-label="Your saved internships"
              >
                <h2 className="sr-only">Saved Internships ({wishlistedInternships.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 internship-cards-container">
                  {wishlistedInternships.map((internship, index) => (
                    <InternshipCard
                      key={internship.id}
                      internship={internship}
                      userProfile={profileData}
                      aria-label={`Saved internship ${index + 1} of ${wishlistedInternships.length}`}
                    />
                  ))}
                </div>
              </section>

              {/* Recommendations Carousel Section */}
              {recommendations.length > 0 && (
                <section
                  className="border-t pt-12"
                  aria-label="Recommended internships"
                >
                  {/* Filter Controls */}
                  <div
                    className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8"
                    role="group"
                    aria-labelledby="recommendations-title"
                  >
                    <div>
                      <h3
                        id="recommendations-title"
                        className="text-lg font-semibold text-foreground mb-2"
                      >
                        Filter by Match Score
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Adjust the minimum match score to see more or fewer recommendations
                      </p>
                    </div>
                    <div
                      className="flex items-center gap-4 w-full md:w-auto"
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-sm text-muted-foreground">Min Match:</span>
                        <span
                          className="text-sm font-medium bg-primary text-primary-foreground px-2 py-1 rounded"
                          aria-label={`Minimum match score: ${minMatchScore[0]} percent`}
                        >
                          {minMatchScore[0]}%
                        </span>
                      </div>
                      <div className="w-32">
                        <Slider
                          value={minMatchScore}
                          onValueChange={setMinMatchScore}
                          max={100}
                          min={50}
                          step={5}
                          className="w-full"
                          aria-label="Minimum match score slider"
                          title="Use arrow keys to adjust the minimum match score"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Carousel */}
                  <InternshipCarousel
                    internships={recommendations}
                    title="You Might Like These"
                    subtitle={`${recommendations.length} recommendations based on your saved internships`}
                    userProfile={profileData}
                    showMatchScores={true}
                    ariaLabel="Recommended internships carousel - use arrow keys or carousel buttons to navigate"
                  />

                  {/* Results Info */}
                  <div
                    className="mt-6 p-4 bg-muted/50 rounded-lg"
                    role="status"
                    aria-live="polite"
                  >
                    <p className="text-sm text-muted-foreground">
                      ️ Showing {recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''} based on sectors, skills, locations, and companies from your wishlist.
                    </p>
                  </div>
                </section>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Heart
                  className="w-16 h-16 text-muted-foreground mx-auto mb-4"
                  aria-hidden="true"
                />
                <h3 className="text-xl font-semibold mb-2">Your Wishlist is Empty</h3>
                <p className="text-muted-foreground mb-6">
                  Start exploring internships and save the ones you like!
                </p>
                <Button asChild>
                  <a href="/" aria-label="Browse internships to add to your wishlist">
                    Browse Internships
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}