import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { Hero } from '@/components/Hero';
import { ProfileForm, ProfileData } from '@/components/ProfileForm';
import { InternshipFilters } from '@/components/InternshipFilters';
import { useInternshipFilters } from '@/hooks/useInternshipFilters';
import { InternshipCard } from '@/components/InternshipCard';
import { SuccessStoriesMarquee } from '@/components/SuccessStoriesMarquee';
import { t } from '@/lib/translation';

// Lazy load heavy components
const Stats = lazy(() => import('@/components/Stats').then(module => ({ default: module.Stats })));
const Testimonials = lazy(() => import('@/components/Testimonials').then(module => ({ default: module.Testimonials })));
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

// Helper function to calculate distance between two coordinates
const haversine = (loc1: { lat: number; lng: number }, loc2: { lat: number; lng: number }) => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (loc2.lat - loc1.lat) * (Math.PI / 180);
    const dLng = (loc2.lng - loc1.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(loc1.lat * (Math.PI / 180)) * Math.cos(loc2.lat * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  
  
  const score = (profile: any, internship: any) => {
      // Skill score with match explanation
      const required = internship.required_skills || [];
      let skill_score = 0;
      const matched_skills = required.filter((s: string) => 
          (profile.skills || []).some((userSkill: string) => 
              userSkill.toLowerCase() === s.toLowerCase()
          )
      );
      
      if (required.length === 0) {
          skill_score = 0.5;
      } else {
          skill_score = matched_skills.length / required.length;
      }
  
      // Sector score
      const sector_tags = internship.sector_tags || [];
      const sector_matched = sector_tags.filter((t: any) => (profile.interests || []).includes(t));
      const sector_score = sector_tags.length > 0 ? sector_matched.length / sector_tags.length : 0.5;
  
      // Education score
      const education_hierarchy: { [key: string]: number } = {
          "Undergraduate": 1,
          "Postgraduate": 2
      };
      const profile_edu_level = education_hierarchy[profile.education] || 0;
      const preferred_edu_levels = (internship.preferred_education_levels || []).map((level: string) => education_hierarchy[level] || 0);
      const education_score = preferred_edu_levels.length === 0 || preferred_edu_levels.some((pref_level: number) => profile_edu_level >= pref_level) ? 1 : 0;
  
      // Enhanced location score with city proximity - Higher weight for location
      let location_score = 0;
      let location_reason = '';
      if(profile.location && internship.location) {
          const userCity = (typeof profile.location === 'string' ? profile.location : profile.location.city || '').toLowerCase();
          const internshipCity = (typeof internship.location === 'string' ? internship.location : internship.location.city).toLowerCase();
          
          if (internshipCity === 'remote') {
              location_score = 1;
              location_reason = 'Remote work available';
          } else if (internshipCity === userCity) {
              location_score = 1;
              location_reason = 'Same city match';
          } else {
              // City proximity scoring with better mapping
              const cityProximity = {
                  'delhi': ['gurgaon', 'noida', 'faridabad', 'ghaziabad', 'new delhi'],
                  'mumbai': ['pune', 'navi mumbai', 'thane', 'mumbai'],
                  'bangalore': ['bengaluru', 'mysore', 'mangalore'],
                  'bengaluru': ['bangalore', 'mysore', 'mangalore'],
                  'hyderabad': ['secunderabad', 'warangal'],
                  'chennai': ['coimbatore', 'madurai'],
                  'pune': ['mumbai', 'nashik', 'navi mumbai'],
                  'gurgaon': ['delhi', 'noida', 'faridabad', 'new delhi'],
                  'noida': ['delhi', 'gurgaon', 'ghaziabad', 'new delhi'],
                  'new delhi': ['delhi', 'gurgaon', 'noida', 'faridabad']
              };
              
              const nearbyCities = cityProximity[userCity] || [];
              if (nearbyCities.includes(internshipCity)) {
                  location_score = 0.9; // Higher score for nearby cities
                  location_reason = 'Nearby city';
              } else {
                  const searchRadius = profile.searchRadius || 50;
                  location_score = searchRadius > 200 ? 0.3 : 0.05; // Lower penalty for distant cities
                  location_reason = 'Different region';
              }
          }
      }
  
      // Increased location weight from 0.2 to 0.35 for better location prioritization
      const total = (skill_score * 0.35 +
               sector_score * 0.25 +
               location_score * 0.35 +
               education_score * 0.05);
               
      // Generate explanation with AI tags
      let explanation = '';
      let aiTags = [];
      
      if (matched_skills.length > 0) {
          explanation += `Matches your skills: ${matched_skills.join(', ')}. `;
      }
      if (sector_matched.length > 0) {
          explanation += `Aligns with your interest in ${sector_matched.join(', ')}. `;
      }
      if (location_score >= 0.8) {
          explanation += `${location_reason}. `;
      }
      
      // AI tags will be added later for top 3 only
  
      return { 
          score: Math.round(total * 100),
          explanation: explanation.trim() || 'Good overall match based on your profile',
          aiTags: aiTags
      };
  }
  
  const recommendInternships = (profile: any, allInternships: any[]) => {
      if (!profile) return [];
      const scores = allInternships.map(internship => {
          const result = score(profile, internship);
          return { 
              internship, 
              score: result.score,
              explanation: result.explanation,
              aiTags: result.aiTags
          };
      });
  
      const sorted = scores
          .filter(item => item.score > 10)
          .sort((a, b) => b.score - a.score);
      
      // Add AI Recommended tag only to top 3
      sorted.forEach((item, index) => {
          if (index < 3) {
              item.aiTags = ['AI Recommended'];
          } else {
              item.aiTags = [];
          }
      });
      
      return sorted;
  }

const Index = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [allInternships, setAllInternships] = useState<any[]>([]);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(true);
  const [sortOptions, setSortOptions] = useState<string[]>(['ai']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const profileFormRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Detect mobile device
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const itemsPerPage = isMobile ? 12 : 21;

  // Initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  
  // Load internships immediately for filtering
  useEffect(() => {
    fetch('/internships.json')
      .then(response => response.json())
      .then(data => setAllInternships(data))
      .catch(error => console.error("Failed to load internships:", error));
  }, []);

  // Use the filtering hook
  const { filters, setFilters, filteredInternships, filterRecommendations, sectors, locations } = useInternshipFilters(allInternships);

  // Sync filters with profile data when profile is submitted
  useEffect(() => {
    if (profileData) {
      const profileLocation = typeof profileData.location === 'string' ? profileData.location : profileData.location?.city || '';
      const profileSector = profileData.interests?.[0] || 'all';
      const profileEducation = profileData.education || 'all';
      
      setFilters(prev => ({
        ...prev,
        location: profileLocation && locations.includes(profileLocation) ? profileLocation : 'all',
        sector: sectors.includes(profileSector) ? profileSector : 'all',
        education: profileEducation !== 'all' ? profileEducation : 'all'
      }));
    }
  }, [profileData, sectors, locations, setFilters]);

  // Re-sort when sort options change
  useEffect(() => {
    if (recommendations.length > 0) {
      setRecommendations(prev => sortRecommendations(prev));
    }
  }, [sortOptions]);
  
  // Reset page when recommendations change
  useEffect(() => {
    setCurrentPage(1);
  }, [recommendations.length]);
  
  const handleProfileSubmit = async (data: ProfileData) => {
    setIsLoading(true);
    setProfileData(data);
    
    // Load internships if not already loaded
    let internships = allInternships;
    if (internships.length === 0) {
      try {
        const response = await fetch('/internships.json');
        internships = await response.json();
        setAllInternships(internships);
      } catch (error) {
        console.error("Failed to load internships:", error);
        setIsLoading(false);
        return;
      }
    }
    
    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 1700));
    
    const recs = recommendInternships(data, internships);
    setRecommendations(sortRecommendations(recs));
    setIsLoading(false);
    setShowProfileForm(false);
    toast({
      title: "AI Recommendations Ready!",
      description: `Found ${recs.length} matching internships for you.`,
    });

    setTimeout(() => {
        document.getElementById('recommendations-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  const handleGetStartedClick = () => {
    profileFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  }
  
  const parseStipend = (stipend: string) => {
    const match = stipend.match(/₹([\d,]+)/);
    return match ? parseInt(match[1].replace(/,/g, '')) : 0;
  };
  
  const getLocationScore = (userLocation: string, internshipLocation: any) => {
    if (!userLocation || !internshipLocation) return 0;
    const userCity = userLocation.toLowerCase();
    const internshipCity = (typeof internshipLocation === 'string' ? internshipLocation : internshipLocation.city).toLowerCase();
    
    if (internshipCity === 'remote') return 100;
    if (internshipCity === userCity) return 95;
    
    // City coordinates for distance calculation
    const cityCoords: { [key: string]: { lat: number; lng: number } } = {
      'delhi': { lat: 28.6139, lng: 77.2090 },
      'mumbai': { lat: 19.0760, lng: 72.8777 },
      'bangalore': { lat: 12.9716, lng: 77.5946 },
      'bengaluru': { lat: 12.9716, lng: 77.5946 },
      'hyderabad': { lat: 17.3850, lng: 78.4867 },
      'chennai': { lat: 13.0827, lng: 80.2707 },
      'pune': { lat: 18.5204, lng: 73.8567 },
      'kolkata': { lat: 22.5726, lng: 88.3639 },
      'ahmedabad': { lat: 23.0225, lng: 72.5714 },
      'jaipur': { lat: 26.9124, lng: 75.7873 },
      'chandigarh': { lat: 30.7333, lng: 76.7794 },
      'gurgaon': { lat: 28.4595, lng: 77.0266 },
      'noida': { lat: 28.5355, lng: 77.3910 },
      'faridabad': { lat: 28.4089, lng: 77.3178 },
      'ghaziabad': { lat: 28.6692, lng: 77.4538 },
      'coimbatore': { lat: 11.0168, lng: 76.9558 }
    };
    
    const userCoords = cityCoords[userCity];
    const internshipCoords = cityCoords[internshipCity];
    
    if (userCoords && internshipCoords) {
      const distance = haversine(userCoords, internshipCoords);
      // Distance-based scoring: closer = higher score
      return Math.max(5, 90 - Math.floor(distance / 50) * 10);
    }
    
    return 10; // Default for unknown cities
  };
  
  const sortRecommendations = (recs: any[]) => {
    let sorted = [...recs];
    
    if (sortOptions.includes('ai')) {
      sorted = sorted.sort((a, b) => b.score - a.score);
    }
    
    if (sortOptions.includes('stipend')) {
      sorted = sorted.sort((a, b) => parseStipend(b.internship.stipend) - parseStipend(a.internship.stipend));
    }
    
    if (sortOptions.includes('proximity') && profileData?.location) {
      sorted = sorted.sort((a, b) => 
        getLocationScore(typeof profileData.location === 'string' ? profileData.location : profileData.location.city, b.internship.location) - 
        getLocationScore(typeof profileData.location === 'string' ? profileData.location : profileData.location.city, a.internship.location)
      );
    }
    
    return sorted;
  };
  
  const handleSortChange = (option: string) => {
    setSortOptions(prev => 
      prev.includes(option) 
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
    setCurrentPage(1); // Reset to first page when sorting changes
  };
  
  // Get filtered items - use hook's filtered results or filtered recommendations
  const getFilteredItems = () => {
    if (profileData) {
      return filterRecommendations(recommendations);
    }
    return filteredInternships.map(internship => ({ internship, score: 0, explanation: '', aiTags: [] }));
  };
  
  const displayItems = getFilteredItems();
  const totalPages = Math.ceil(displayItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecommendations = recommendations.slice(startIndex, endIndex);
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      document.getElementById('recommendations-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(pageInput);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setPageInput('');
      document.getElementById('recommendations-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-racing font-bold text-foreground mb-2">Loading Saksham AI</h2>
          <p className="text-muted-foreground mb-2">Preparing your personalized internship experience...</p>
          <p className="text-xs text-muted-foreground/70">Powered by Team HexaCoders</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen hero-gradient">
      <Hero onGetStartedClick={handleGetStartedClick} />
      <SuccessStoriesMarquee />
      {showProfileForm && (
        <div ref={profileFormRef} id="profile-form" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">{t('index.processing')}</h3>
                <p className="text-muted-foreground mb-2">{t('index.analyzing')}</p>
                <p className="text-xs text-muted-foreground/70">{t('index.teamName')}</p>
              </div>
            ) : (
              <ProfileForm onProfileSubmit={handleProfileSubmit} />
            )}
          </div>
        </div>
      )}

      {profileData && (
        <section id="recommendations-section" className="bg-card py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
            <div className='max-w-7xl mx-auto'>
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-racing font-bold text-foreground mb-4">
                        🎯 {t('index.recommendations')}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        {t('index.found')} {displayItems.length} {t('index.internships')}
                    </p>
                    <div className="bg-primary/10 rounded-lg p-4 mb-6">
                        <p className="text-sm text-primary font-medium">
                            📊 {t('index.stats')}
                        </p>
                    </div>
                    
                    {/* Filters */}
                    <InternshipFilters
                      filters={filters}
                      onFiltersChange={setFilters}
                      sectors={sectors}
                      locations={locations}
                    />
                </div>

                {!showProfileForm && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="font-racing flex items-center justify-between">
                                Update Your Preferences
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setShowProfileForm(!showProfileForm)}
                                >
                                    {showProfileForm ? 'Hide' : 'Edit Profile'}
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        {showProfileForm && (
                            <CardContent>
                               <ProfileForm onProfileSubmit={handleProfileSubmit} initialData={profileData} showTitle={false}/>
                            </CardContent>
                        )}
                    </Card>
                )}

                {displayItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {displayItems.slice(startIndex, endIndex).map((item, index) => (
                            <InternshipCard 
                                key={item.internship.id} 
                                internship={item.internship}
                                matchExplanation={item.explanation}
                                aiTags={item.aiTags}
                                userProfile={profileData}
                                onNext={() => handlePageChange(currentPage + 1)}
                                onPrev={() => handlePageChange(currentPage - 1)}
                                currentIndex={startIndex + index + 1}
                                totalCount={displayItems.length}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">No internships match your current filters.</p>
                        <Button 
                            onClick={() => setFilters({
                                search: '',
                                sector: 'all',
                                location: 'all',
                                workMode: 'all',
                                education: 'all',
                                minStipend: 'all',
                                sortBy: 'recent'
                            })}
                            className="mt-4"
                            variant="outline"
                        >
                            Clear Filters
                        </Button>
                    </div>
                )}
                        
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex flex-col items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    
                                    <span className="text-sm text-muted-foreground px-2">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                                
                                <form onSubmit={handlePageInputSubmit} className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Go to page:</span>
                                    <Input
                                        type="number"
                                        min="1"
                                        max={totalPages}
                                        value={pageInput}
                                        onChange={(e) => setPageInput(e.target.value)}
                                        className="w-20 h-8"
                                        placeholder={currentPage.toString()}
                                    />
                                    <Button type="submit" size="sm" variant="outline">
                                        Go
                                    </Button>
                                </form>
                                
                                <p className="text-xs text-muted-foreground">
                                    Showing {startIndex + 1}-{Math.min(endIndex, displayItems.length)} of {displayItems.length} internships
                                </p>
                            </div>
                        )}
            </div>
        </section>
      )}
      
      {!profileData && allInternships.length > 0 && (
        <section className="bg-card py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
            <div className='max-w-7xl mx-auto'>
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-racing font-bold text-foreground mb-4">
                        🔍 Browse All Internships
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        Found {displayItems.length} internships
                    </p>
                    
                    {/* Filters */}
                    <InternshipFilters
                      filters={filters}
                      onFiltersChange={setFilters}
                      sectors={sectors}
                      locations={locations}
                    />
                </div>

                {displayItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {displayItems.slice(startIndex, endIndex).map((item, index) => (
                            <InternshipCard 
                                key={item.internship.id} 
                                internship={item.internship}
                                matchExplanation={item.explanation}
                                aiTags={item.aiTags}
                                userProfile={profileData}
                                onNext={() => handlePageChange(currentPage + 1)}
                                onPrev={() => handlePageChange(currentPage - 1)}
                                currentIndex={startIndex + index + 1}
                                totalCount={displayItems.length}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">No internships match your current filters.</p>
                        <Button 
                            onClick={() => setFilters({
                                search: '',
                                sector: 'all',
                                location: 'all',
                                workMode: 'all',
                                education: 'all',
                                minStipend: 'all',
                                sortBy: 'recent'
                            })}
                            className="mt-4"
                            variant="outline"
                        >
                            Clear Filters
                        </Button>
                    </div>
                )}
                        
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            
                            <span className="text-sm text-muted-foreground px-2">
                                Page {currentPage} of {totalPages}
                            </span>
                            
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                        
                        <form onSubmit={handlePageInputSubmit} className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Go to page:</span>
                            <Input
                                type="number"
                                min="1"
                                max={totalPages}
                                value={pageInput}
                                onChange={(e) => setPageInput(e.target.value)}
                                className="w-20 h-8"
                                placeholder={currentPage.toString()}
                            />
                            <Button type="submit" size="sm" variant="outline">
                                Go
                            </Button>
                        </form>
                        
                        <p className="text-xs text-muted-foreground">
                            Showing {startIndex + 1}-{Math.min(endIndex, displayItems.length)} of {displayItems.length} internships
                        </p>
                    </div>
                )}
            </div>
        </section>
      )}

      <Suspense fallback={<div className="h-32 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
        <Stats />
      </Suspense>
      <Suspense fallback={<div className="h-32 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
        <Testimonials />
      </Suspense>
    </div>
  );
};

export default Index;
