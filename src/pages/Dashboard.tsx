import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { InternshipCard } from '../components/InternshipCard';
import { FeedbackModal } from '../components/FeedbackModal';
import { FeedbackAnalytics } from '../components/FeedbackAnalytics';
import { User, Target, FileText, MessageSquare, BarChart3, TrendingUp, Filter, Edit3, Save, X, Heart, Settings as SettingsIcon } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AdvancedFilters } from '../components/AdvancedFilters';
import { SkillGapAnalysis } from '../components/SkillGapAnalysis';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';
import { Input } from '../components/ui/input';
import { useInternships } from '../hooks/useInternships';
import { VirtualizedList } from '../components/VirtualizedList';
import { debounce } from '../utils/debounce';
import { useToast } from '../hooks/use-toast';
import { Settings } from '../components/Settings';

const translations = {
  en: {
    dashboard: 'Dashboard',
    welcome: 'Welcome back',
    profile: 'Profile',
    recommendations: 'Recommendations',
    applications: 'Applications',
    studentId: 'Student ID',
    email: 'Email',
    phone: 'Phone',
    viewAll: 'View All',
    feedback: 'Give Feedback'
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    welcome: 'वापसी पर स्वागत है',
    profile: 'प्रोफाइल',
    recommendations: 'सिफारिशें',
    applications: 'आवेदन',
    studentId: 'छात्र ID',
    email: 'ईमेल',
    phone: 'फोन',
    viewAll: 'सभी देखें',
    feedback: 'फीडबैक दें'
  }
};

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

// Enhanced vector-based similarity calculation
const calculateCosineSimilarity = (vectorA: number[], vectorB: number[]) => {
  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
};

// Create skill vector for ML-light matching
const createSkillVector = (skills: string[], allSkills: string[]) => {
  return allSkills.map(skill => 
    skills.some(userSkill => userSkill.toLowerCase() === skill.toLowerCase()) ? 1 : 0
  );
};

// Get all unique skills from internships for vector creation
const getAllSkills = (internships: any[]) => {
  const skillSet = new Set<string>();
  internships.forEach(internship => {
    (internship.required_skills || []).forEach((skill: string) => skillSet.add(skill));
  });
  return Array.from(skillSet);
};


const score = (profile: any, internship: any, allSkills: string[]) => {
    // Rule-based filtering first
    let passes_rules = true;
    
    // Education filter
    const education_hierarchy: { [key: string]: number } = {
        "Class 12th": 1,
        "Diploma": 2,
        "Undergraduate": 3,
        "Postgraduate": 4
    };
    const profile_edu_level = education_hierarchy[profile.education] || 0;
    const preferred_edu_levels = (internship.preferred_education_levels || []).map((level: string) => education_hierarchy[level] || 0);
    const education_match = preferred_edu_levels.length === 0 || preferred_edu_levels.some((pref_level: number) => profile_edu_level >= pref_level);
    
    // Location filter
    let location_match = true;
    let distance = 0;
    if (profile.location && internship.location && typeof internship.location === 'object') {
        if (internship.location.city !== "Remote" && profile.location.toLowerCase() !== 'remote') {
            // For demo, we'll use city name matching. In real app, use geocoding.
            const profileCity = profile.location.toLowerCase();
            const internshipCity = internship.location.city.toLowerCase();
            if (profileCity !== internshipCity) {
                // Simulate distance calculation
                distance = Math.random() * 1000; // Random distance for demo
                location_match = distance <= (profile.searchRadius || 50);
            }
        }
    }
    
    if (!education_match || !location_match) {
        return { score: 0, explanation: 'Filtered out by rules' };
    }
    
    // ML-Light Vector-based scoring
    const userSkillVector = createSkillVector(profile.skills || [], allSkills);
    const internshipSkillVector = createSkillVector(internship.required_skills || [], allSkills);
    const skill_similarity = calculateCosineSimilarity(userSkillVector, internshipSkillVector);
    
    // Enhanced skill scoring with exact matches
    const required = internship.required_skills || [];
    const matched_skills = required.filter((s: string) => 
        (profile.skills || []).some((userSkill: string) => 
            userSkill.toLowerCase() === s.toLowerCase()
        )
    );
    const exact_skill_score = required.length > 0 ? matched_skills.length / required.length : 0.5;
    
    // Combine vector similarity with exact matches
    const skill_score = (skill_similarity * 0.4) + (exact_skill_score * 0.6);
    
    // Sector/Interest matching
    const sector_tags = internship.sector_tags || [];
    const sector_matched = sector_tags.filter((t: any) => (profile.interests || []).includes(t));
    const sector_score = sector_tags.length > 0 ? sector_matched.length / sector_tags.length : 0.5;
    
    // Location proximity scoring
    let location_score = 1;
    if (distance > 0) {
        const maxDistance = profile.searchRadius || 50;
        location_score = Math.max(0, 1 - (distance / (maxDistance * 2)));
    }
    
    // Weighted final score
    const total = (skill_score * 0.5 +
                  sector_score * 0.25 +
                  location_score * 0.25);
    
    // Generate explanation (only skills and location)
    let explanation = '';
    if (matched_skills.length > 0) {
        explanation += `Matches your skills: ${matched_skills.join(', ')}. `;
    }
    if (distance === 0 || internship.location?.city === "Remote") {
        explanation += 'Perfect location match. ';
    } else if (location_score > 0.7) {
        explanation += 'Good location proximity. ';
    }
    
    return { 
        score: Math.round(total * 100), 
        explanation: explanation.trim() || 'Good overall match based on your profile'
    };
}

const recommendInternships = (profile: any, allInternships: any[]) => {
    if (!profile) return [];
    
    // Get all skills for vector creation
    const allSkills = getAllSkills(allInternships);
    
    // Rule-based filtering + ML-light scoring
    const scores = allInternships.map(internship => {
        const result = score(profile, internship, allSkills);
        return { 
            internship, 
            score: result.score,
            explanation: result.explanation
        };
    });

    // Filter out low scores and return top recommendations
    return scores
        .filter(item => item.score > 5) // Show more matches with lower threshold
        .sort((a, b) => b.score - a.score)
        .slice(0, 20); // Show more recommendations
}




export default function Dashboard() {
  const { language } = useTheme();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const t = translations[language];
  const [activeSection, setActiveSection] = useState('recommendations');
  const [showFeedback, setShowFeedback] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState<any[]>([]);
  const [userProfileData, setUserProfileData] = useState<any>(null);
  const [dashboardProfile, setDashboardProfile] = useState<any>(null);
  const { allInternships, visibleInternships, loading, loadMore, hasMore } = useInternships({ pageSize: 20, initialLoad: 10 });
  const [filters, setFilters] = useState({
    salaryRange: [0, 100000] as [number, number],
    companySize: 'Any',
    workMode: [] as string[],
    sectors: [] as string[]
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>({
    skills: [],
    education: [],
    experience: []
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadDashboardProfile();
    }
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        if (!profile.searchRadius) {
            profile.searchRadius = 50;
        }
        setUserProfileData(profile);
    }
  }, [currentUser]);

  const loadDashboardProfile = async () => {
    if (!currentUser) return;
    
    try {
      const docRef = doc(db, 'profiles', currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const profileData = docSnap.data();
        setDashboardProfile(profileData);
        setEditedProfile({
          ...profileData,
          skills: profileData.skills || [],
          education: profileData.education || [],
          experience: profileData.experience || []
        });
      } else {
        // Initialize with current user data
        const initialProfile = {
          username: currentUser.displayName || '',
          email: currentUser.email || '',
          phone: '',
          studentId: '',
          photoURL: currentUser.photoURL || '',
          location: '',
          sector: '',
          bio: '',
          skills: [],
          education: [],
          experience: []
        };
        setDashboardProfile(initialProfile);
        setEditedProfile(initialProfile);
      }
    } catch (error) {
      console.error('Error loading dashboard profile:', error);
    }
  };

  useEffect(() => {
    if(allInternships.length > 0) {
        if(userProfileData) {
            const recs = recommendInternships(userProfileData, allInternships);
            setRecommendations(recs);
            setFilteredRecommendations(recs);
        } else {
            // Show all internships if no user profile
            const allRecs = allInternships.map(internship => ({
                internship,
                score: 50,
                explanation: 'Complete your profile to get personalized recommendations'
            }));
            setRecommendations(allRecs);
            setFilteredRecommendations(allRecs);
        }
    }
  }, [userProfileData, allInternships]);

  const debouncedApplyFilters = useCallback(
    debounce(() => {
      applyFilters();
    }, 300),
    [recommendations]
  );

  useEffect(() => {
    debouncedApplyFilters();
  }, [filters, recommendations, debouncedApplyFilters]);

  const applyFilters = useCallback(() => {
    let filtered = [...recommendations];

    // Salary filter
    filtered = filtered.filter(rec => {
      const stipend = rec.internship.stipend;
      const amount = parseInt(stipend.replace(/[^\d]/g, '')) || 0;
      return amount >= filters.salaryRange[0] && amount <= filters.salaryRange[1];
    });

    // Work mode filter
    if (filters.workMode.length > 0) {
      filtered = filtered.filter(rec => {
        const location = rec.internship.location;
        const isRemote = typeof location === 'string' ? location.toLowerCase().includes('remote') : location.city.toLowerCase().includes('remote');
        return filters.workMode.some(mode => {
          if (mode === 'Remote') return isRemote;
          if (mode === 'On-site') return !isRemote;
          if (mode === 'Hybrid') return rec.internship.work_mode === 'Hybrid';
          return false;
        });
      });
    }

    // Sector filter
    if (filters.sectors.length > 0) {
      filtered = filtered.filter(rec => 
        rec.internship.sector_tags?.some((tag: string) => filters.sectors.includes(tag))
      );
    }

    setFilteredRecommendations(filtered);
  }, [recommendations, filters]);

  const clearFilters = () => {
    setFilters({
      salaryRange: [0, 100000],
      companySize: 'Any',
      workMode: [],
      sectors: []
    });
  };

  const availableSectors = useMemo(() => {
    const sectors = new Set<string>();
    allInternships.forEach(internship => {
      internship.sector_tags?.forEach((tag: string) => sectors.add(tag));
    });
    return Array.from(sectors);
  }, [allInternships]);

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    
    setSavingProfile(true);
    try {
      const docRef = doc(db, 'profiles', currentUser.uid);
      await setDoc(docRef, editedProfile, { merge: true });
      setDashboardProfile(editedProfile);
      setIsEditingProfile(false);
      toast({ title: 'Success', description: 'Profile updated successfully' });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({ title: 'Error', description: 'Failed to save profile', variant: 'destructive' });
    } finally {
      setSavingProfile(false);
    }
  };

  const sidebarItems = [
    { id: 'recommendations', label: t.recommendations, icon: Target, tooltip: 'AI-powered internship matches' },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, tooltip: 'Your saved internships' },
    { id: 'applications', label: t.applications, icon: FileText, tooltip: 'Track your applications' },
    { id: 'skill-gap', label: 'Skill Gap', icon: TrendingUp, tooltip: 'Identify skills to learn' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, tooltip: 'View feedback analytics' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, tooltip: 'Profile and app settings' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'settings':
        return (
          <Settings 
            dashboardProfile={dashboardProfile} 
            onProfileUpdate={(profile) => {
              setDashboardProfile(profile);
              loadDashboardProfile();
            }}
          />
        );

      case 'profile':
        const profileUrl = `${window.location.origin}/profile/${currentUser?.uid}`;
        const shareProfile = () => {
          if (navigator.share) {
            navigator.share({
              title: `${dashboardProfile?.username || 'User'}'s Profile`,
              text: 'Check out my profile on Saksham AI',
              url: profileUrl
            });
          } else {
            navigator.clipboard.writeText(profileUrl);
            toast({ title: 'Link Copied', description: 'Profile link copied to clipboard' });
          }
        };
        
        return (
          <div className="space-y-6">
            {/* Profile Header */}
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 font-racing">
                    <User className="w-5 h-5 text-primary" />
                    {t.profile}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={shareProfile}>
                      Share Profile
                    </Button>
                    <Button asChild size="sm">
                      <a href="/profile">Edit Profile</a>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    {dashboardProfile?.photoURL ? (
                      <img src={dashboardProfile.photoURL} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-primary">
                        {(dashboardProfile?.username || currentUser?.displayName || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{dashboardProfile?.username || currentUser?.displayName || 'Not set'}</h3>
                    <p className="text-muted-foreground">{dashboardProfile?.studentId || 'Student ID not set'}</p>
                    <p className="text-sm text-muted-foreground">{dashboardProfile?.email || currentUser?.email}</p>
                  </div>
                </div>

                {/* Contact & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-foreground">{dashboardProfile?.phone || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Location</label>
                    <p className="text-foreground">
                      {dashboardProfile?.location ? 
                        `${dashboardProfile.location.city}, ${dashboardProfile.location.state}, ${dashboardProfile.location.country}` : 
                        'Not set'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Desired Location</label>
                    <p className="text-foreground">
                      {dashboardProfile?.desiredLocation ? 
                        `${dashboardProfile.desiredLocation.city}, ${dashboardProfile.desiredLocation.state}, ${dashboardProfile.desiredLocation.country}` : 
                        'Not set'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Min Stipend</label>
                    <p className="text-foreground">
                      {dashboardProfile?.minStipend ? `₹${dashboardProfile.minStipend}/month` : 'Not set'}
                    </p>
                  </div>
                </div>

                {/* Bio */}
                {dashboardProfile?.bio && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bio</label>
                    <p className="text-foreground mt-1">{dashboardProfile.bio}</p>
                  </div>
                )}

                {/* Skills */}
                {dashboardProfile?.skills?.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Skills</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {dashboardProfile.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sectors */}
                {dashboardProfile?.sectors?.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Interested Sectors</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {dashboardProfile.sectors.map((sector: string, index: number) => (
                        <Badge key={index} variant="outline">{sector}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {dashboardProfile?.education?.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Education</label>
                    <div className="space-y-2 mt-2">
                      {dashboardProfile.education.map((edu: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="font-medium">{edu.degree}</div>
                          <div className="text-sm text-muted-foreground">{edu.institution} • {edu.year}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {dashboardProfile?.experience?.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Experience</label>
                    <div className="space-y-2 mt-2">
                      {dashboardProfile.experience.map((exp: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="font-medium">{exp.title}</div>
                          <div className="text-sm text-muted-foreground">{exp.company} • {exp.duration}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {dashboardProfile?.socialLinks && Object.values(dashboardProfile.socialLinks).some((link: any) => link) && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Social Links</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {Object.entries(dashboardProfile.socialLinks).map(([platform, url]: [string, any]) => 
                        url && (
                          <a key={platform} href={url} target="_blank" rel="noopener noreferrer" 
                             className="text-sm text-primary hover:underline capitalize">
                            {platform}
                          </a>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Resume */}
                {dashboardProfile?.resumeURL && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Resume</label>
                    <div className="mt-2">
                      <a href={dashboardProfile.resumeURL} target="_blank" rel="noopener noreferrer" 
                         className="text-primary hover:underline">
                        View Resume
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'recommendations':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <h2 className="text-2xl font-racing font-bold text-foreground">
                {t.recommendations}
              </h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setShowFeedback(true)}
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {t.feedback}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Share feedback to improve recommendations
                </TooltipContent>
              </Tooltip>
            </div>
            
            <AdvancedFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={clearFilters}
              availableSectors={availableSectors}
            />
            
            {filteredRecommendations.length > 0 ? (
                <VirtualizedList
                  items={filteredRecommendations}
                  userProfile={userProfileData}
                />
            ) : recommendations.length > 0 ? (
                <Card className="glass-card">
                    <CardContent className="p-8 text-center">
                        <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                            No internships match your current filters. Try adjusting them.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Card className="glass-card">
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">
                            Please complete your profile on the home page to get internship recommendations.
                        </p>
                    </CardContent>
                </Card>
            )}
            
            {hasMore && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        );

      case 'wishlist':
        const wishlistInternships = allInternships.filter(internship => wishlist.includes(internship.id));
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-racing font-bold text-foreground">
              Wishlist ({wishlist.length})
            </h2>
            
            {wishlistInternships.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistInternships.map((internship) => (
                  <InternshipCard
                    key={internship.id}
                    internship={internship}
                    userProfile={userProfileData}
                  />
                ))}
              </div>
            ) : (
              <Card className="glass-card">
                <CardContent className="p-8 text-center">
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No internships in your wishlist yet. Start adding some!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        );
        
      case 'applications':
        const applications = JSON.parse(localStorage.getItem('applications') || '[]');
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-racing font-bold text-foreground">
              {t.applications}
            </h2>
            
            {applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((app: any, index: number) => (
                  <Card key={index} className="glass-card">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{app.role}</h3>
                          <p className="text-muted-foreground">{app.company}</p>
                          <p className="text-sm text-muted-foreground">
                            Applied: {new Date(app.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">Applied</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass-card">
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {language === 'en' 
                      ? 'No applications yet. Start exploring internships!' 
                      : 'अभी तक कोई आवेदन नहीं। इंटर्नशिप खोजना शुरू करें!'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        );
        
      case 'skill-gap':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-racing font-bold text-foreground">
              Skill Development
            </h2>
            <SkillGapAnalysis 
              userProfile={userProfileData} 
              internships={allInternships}
            />
          </div>
        );
        
      case 'analytics':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-racing font-bold text-foreground">
              Feedback Analytics
            </h2>
            <FeedbackAnalytics />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen hero-gradient pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="glass-card sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg font-racing">
                  {t.dashboard}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t.welcome}, {dashboardProfile?.username?.split(' ')[0] || currentUser?.displayName?.split(' ')[0] || 'User'}
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {sidebarItems.map((item) => (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={activeSection === item.id ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveSection(item.id)}
                      >
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {item.tooltip}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        context="dashboard_recommendations"
      />
    </div>
  );
}
