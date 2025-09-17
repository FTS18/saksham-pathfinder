import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { Hero } from '@/components/Hero';
import { ProfileForm, ProfileData } from '@/components/ProfileForm';
import { InternshipCard } from '@/components/InternshipCard';
import { SuccessStoriesMarquee } from '@/components/SuccessStoriesMarquee';

// Lazy load heavy components
const Stats = lazy(() => import('@/components/Stats').then(module => ({ default: module.Stats })));
const Testimonials = lazy(() => import('@/components/Testimonials').then(module => ({ default: module.Testimonials })));
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
          "Class 12th": 1,
          "Diploma": 2,
          "Undergraduate": 3,
          "Postgraduate": 4
      };
      const profile_edu_level = education_hierarchy[profile.education] || 0;
      const preferred_edu_levels = (internship.preferred_education_levels || []).map((level: string) => education_hierarchy[level] || 0);
      const education_score = preferred_edu_levels.length === 0 || preferred_edu_levels.some((pref_level: number) => profile_edu_level >= pref_level) ? 1 : 0;
  
      // Enhanced location score with proximity
      let location_score = 0;
      if(profile.location && internship.location) {
          if (internship.location.city?.toLowerCase() === 'remote' || profile.location.toLowerCase() === 'remote') {
              location_score = 1;
          } else if (internship.location.city?.toLowerCase() === profile.location.toLowerCase()) {
              location_score = 1;
          } else {
              // Simulate proximity based on search radius
              const searchRadius = profile.searchRadius || 50;
              location_score = searchRadius > 100 ? 0.6 : 0.2; // Flexible if large radius
          }
      }
  
      const total = (skill_score * 0.5 +
               sector_score * 0.25 +
               education_score * 0.1 +
               location_score * 0.15);
               
      // Generate explanation
      let explanation = '';
      if (matched_skills.length > 0) {
          explanation += `Matches your skills: ${matched_skills.join(', ')}. `;
      }
      if (sector_matched.length > 0) {
          explanation += `Aligns with your interest in ${sector_matched.join(', ')}. `;
      }
      if (location_score === 1) {
          explanation += 'Perfect location match. ';
      }
  
      return { 
          score: Math.round(total * 100),
          explanation: explanation.trim() || 'Good overall match based on your profile'
      };
  }
  
  const recommendInternships = (profile: any, allInternships: any[]) => {
      if (!profile) return [];
      const scores = allInternships.map(internship => {
          const result = score(profile, internship);
          return { 
              internship, 
              score: result.score,
              explanation: result.explanation
          };
      });
  
      return scores
          .filter(item => item.score > 10) // Only meaningful matches
          .sort((a, b) => b.score - a.score);
  }

const Index = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [allInternships, setAllInternships] = useState<any[]>([]);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(true);
  const profileFormRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Lazy load internships only when needed
  useEffect(() => {
    if (profileData) {
      fetch('/internships.json')
        .then(response => response.json())
        .then(data => setAllInternships(data))
        .catch(error => console.error("Failed to load internships:", error));
    }
  }, [profileData]);

  const handleProfileSubmit = (data: ProfileData) => {
    setProfileData(data);
    const recs = recommendInternships(data, allInternships);
    setRecommendations(recs);
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

  return (
    <div className="min-h-screen hero-gradient">
      <Hero onGetStartedClick={handleGetStartedClick} />
      <SuccessStoriesMarquee />
      {showProfileForm && (
        <div ref={profileFormRef} id="profile-form" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <ProfileForm onProfileSubmit={handleProfileSubmit} />
          </div>
        </div>
      )}

      {profileData && (
        <section id="recommendations-section" className="bg-card py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
            <div className='max-w-7xl mx-auto'>
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-racing font-bold text-foreground mb-4">
                        🎯 Your AI-Powered Recommendations
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        Found {recommendations.length} internships matching your profile
                    </p>
                    <div className="bg-primary/10 rounded-lg p-4 mb-6">
                        <p className="text-sm text-primary font-medium">
                            📊 250+ Internships Posted • 🏢 100+ Companies Hiring • 👥 5,000+ Active Users
                        </p>
                    </div>
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

                {recommendations.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {recommendations.slice(0, showAllRecommendations ? recommendations.length : 3).map(rec => (
                                 <InternshipCard 
                                    key={rec.internship.id} 
                                    internship={rec.internship}
                                    matchExplanation={rec.explanation}
                                    userProfile={profileData}
                                 />
                            ))}
                        </div>
                        
                        {recommendations.length > 3 && (
                            <div className="text-center">
                                <Button 
                                    onClick={() => setShowAllRecommendations(!showAllRecommendations)}
                                    size="lg"
                                    className="bg-primary hover:bg-primary-dark text-white"
                                >
                                    {showAllRecommendations 
                                        ? `Show Less` 
                                        : `View All ${recommendations.length} Recommendations`
                                    }
                                </Button>
                            </div>
                        )}
                    </>
                ): (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">No recommendations found for this profile.</p>
                        <Button 
                            onClick={() => setShowProfileForm(true)}
                            className="mt-4"
                        >
                            Update Profile
                        </Button>
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
