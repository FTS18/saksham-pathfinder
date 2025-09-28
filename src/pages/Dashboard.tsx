import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { InternshipCard } from '../components/InternshipCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

import { User, Target, FileText, BarChart3, TrendingUp, Filter, Edit3, Save, X, Bookmark, Settings as SettingsIcon, Lightbulb, Bell, Briefcase, Users, Play, ChevronDown } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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

import { Breadcrumbs } from '../components/Breadcrumbs';

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
    // Parse internship stipend
    const parseStipend = (stipend: string) => {
        const match = stipend.match(/₹([\d,]+)/);
        return match ? parseInt(match[1].replace(/,/g, '')) : 0;
    };
    
    const internshipStipend = parseStipend(internship.stipend || '₹0');
    
    // Sector matching (preferred but not mandatory)
    const sector_tags = internship.sector_tags || [];
    const sector_matched = sector_tags.filter((t: any) => (profile.interests || []).includes(t));
    
    // Minimum stipend filter (only if user specified and internship is significantly below)
    if (profile.minStipend && profile.minStipend > 0 && internshipStipend < (profile.minStipend * 0.7)) {
        return { score: 0, explanation: 'Stipend significantly below your minimum requirement' };
    }
    
    // Education filter (more lenient)
    const education_hierarchy: { [key: string]: number } = {
        "Class 12th": 1,
        "Diploma": 2,
        "Undergraduate": 3,
        "Postgraduate": 4
    };
    const profile_edu_level = education_hierarchy[profile.education] || 3; // Default to Undergraduate
    const preferred_edu_levels = (internship.preferred_education_levels || []).map((level: string) => education_hierarchy[level] || 0);
    const education_match = preferred_edu_levels.length === 0 || preferred_edu_levels.some((pref_level: number) => profile_edu_level >= pref_level);
    
    // Location scoring (if user specified preferred location)
    let location_score = 0.5; // Default neutral score
    let distance = 0;
    
    if (profile.desiredLocation || profile.location) {
        const userLocation = profile.desiredLocation || profile.location;
        const userCity = (typeof userLocation === 'string' ? userLocation : userLocation.city || '').toLowerCase();
        const internshipCity = (typeof internship.location === 'string' ? internship.location : internship.location?.city || '').toLowerCase();
        
        if (internshipCity === 'remote') {
            location_score = 1; // Remote is always good
        } else if (internshipCity === userCity) {
            location_score = 1; // Perfect match
        } else if (userCity) {
            // City proximity mapping
            const cityProximity: { [key: string]: string[] } = {
                'delhi': ['gurgaon', 'noida', 'faridabad', 'ghaziabad', 'new delhi'],
                'mumbai': ['pune', 'navi mumbai', 'thane'],
                'bangalore': ['bengaluru', 'mysore'],
                'bengaluru': ['bangalore', 'mysore'],
                'hyderabad': ['secunderabad'],
                'chennai': ['coimbatore'],
                'pune': ['mumbai', 'navi mumbai'],
                'gurgaon': ['delhi', 'noida', 'faridabad'],
                'noida': ['delhi', 'gurgaon', 'ghaziabad']
            };
            
            const nearbyCities = cityProximity[userCity] || [];
            if (nearbyCities.includes(internshipCity)) {
                location_score = 0.8; // Nearby city
            } else {
                location_score = 0.2; // Different region
            }
        }
    }
    
    // Skills scoring
    const userSkillVector = createSkillVector(profile.skills || [], allSkills);
    const internshipSkillVector = createSkillVector(internship.required_skills || [], allSkills);
    const skill_similarity = calculateCosineSimilarity(userSkillVector, internshipSkillVector);
    
    const required = internship.required_skills || [];
    const matched_skills = required.filter((s: string) => 
        (profile.skills || []).some((userSkill: string) => 
            userSkill.toLowerCase() === s.toLowerCase()
        )
    );
    const exact_skill_score = required.length > 0 ? matched_skills.length / required.length : 0.5;
    const skill_score = (skill_similarity * 0.4) + (exact_skill_score * 0.6);
    
    // Sector score (already filtered, so give bonus for matches)
    const sector_score = sector_matched.length > 0 ? 1 : 0.5;
    
    // Stipend score (bonus for higher stipends)
    const stipend_score = profile.minStipend ? 
        Math.min(1, internshipStipend / (profile.minStipend * 2)) : 
        Math.min(1, internshipStipend / 30000); // Default benchmark
    
    // Weighted scoring with base score to ensure minimum 65+
    const base_score = 0.65; // Minimum 65% base score
    const bonus_score = (skill_score * 0.25 +
                        location_score * 0.15 +
                        stipend_score * 0.1 +
                        sector_score * 0.15 +
                        (education_match ? 0.1 : 0)) * 0.35; // 35% bonus possible
    
    const total = base_score + bonus_score;
    
    // Generate explanation
    let explanation = '';
    if (matched_skills.length > 0) {
        explanation += `Matches ${matched_skills.length}/${required.length} required skills. `;
    }
    if (sector_matched.length > 0) {
        explanation += `Aligns with ${sector_matched.join(', ')} sector. `;
    }
    if (location_score >= 0.8) {
        explanation += 'Great location match. ';
    }
    if (internshipStipend >= (profile.minStipend || 0)) {
        explanation += `Good stipend (₹${internshipStipend.toLocaleString()}). `;
    }
    
    return { 
        score: Math.round(total * 100), 
        explanation: explanation.trim() || 'Good match based on your profile'
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

    // Filter and sort: show matches with score 65+
    return scores
        .filter(item => item.score >= 65) // Only show quality matches (65+)
        .sort((a, b) => b.score - a.score)
        .slice(0, 50); // Show more recommendations
}




export default function Dashboard() {
  const { language } = useTheme();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { currentUser, userType } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const t = translations[language];

  // Redirect recruiters to their dashboard
  useEffect(() => {
    if (userType === 'recruiter') {
      navigate('/recruiter/dashboard');
    }
  }, [userType, navigate]);
  const [activeSection, setActiveSection] = useState('wishlist');
  const [selectedQuickAction, setSelectedQuickAction] = useState('');

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

  // Auto-fill localStorage profile from Firebase if empty
  useEffect(() => {
    if (dashboardProfile && !localStorage.getItem('userProfile')) {
      const profileForLocalStorage = {
        ...dashboardProfile,
        searchRadius: 50
      };
      localStorage.setItem('userProfile', JSON.stringify(profileForLocalStorage));
      setUserProfileData(profileForLocalStorage);
    }
  }, [dashboardProfile]);

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
        // Generate referral code
        const generateReferralCode = () => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let result = '';
          for (let i = 0; i < 5; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return result;
        };

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
          experience: [],
          referralCode: generateReferralCode()
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
            // Reset filters when new recommendations are loaded
            setFilters({
              salaryRange: [0, 100000],
              companySize: 'Any',
              workMode: [],
              sectors: []
            });
            setFilteredRecommendations(recs);
        } else {
            // Show all internships with base scoring if no user profile
            const allRecs = allInternships.map(internship => ({
                internship,
                score: 65, // Base score for all internships
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
    if (recommendations.length === 0) return;
    
    let filtered = [...recommendations];

    // Only apply filters if they are not in default state
    const hasActiveFilters = 
      filters.salaryRange[0] > 0 || 
      filters.salaryRange[1] < 100000 || 
      filters.workMode.length > 0 || 
      filters.sectors.length > 0;

    if (!hasActiveFilters) {
      setFilteredRecommendations(filtered);
      return;
    }

    // Salary filter
    if (filters.salaryRange[0] > 0 || filters.salaryRange[1] < 100000) {
      filtered = filtered.filter(rec => {
        const stipend = rec.internship.stipend;
        const amount = parseInt(stipend.replace(/[^\d]/g, '')) || 0;
        return amount >= filters.salaryRange[0] && amount <= filters.salaryRange[1];
      });
    }

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
    // Reset to original recommendations
    setFilteredRecommendations(recommendations);
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
    { id: 'wishlist', label: 'Saved', icon: Bookmark, tooltip: 'Your saved internships' },
    { id: 'applications', label: t.applications, icon: FileText, tooltip: 'Track your applications' },

    { id: 'news-events', label: 'News & Events', icon: Bell, tooltip: 'Latest updates and events' },
    { id: 'tutorials', label: 'Tutorials', icon: Play, tooltip: 'Video guides and tutorials' },
    { id: 'refer-friend', label: 'Refer A Friend', icon: Users, tooltip: 'Invite friends and earn rewards' },
    { id: 'skill-gap', label: 'Skill Gap', icon: TrendingUp, tooltip: 'Identify skills to learn' },

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
        const profileUrl = dashboardProfile?.username ? 
          `${window.location.origin}/u/${dashboardProfile.username}` : 
          `${window.location.origin}/profile/${currentUser?.uid}`;
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



      case 'wishlist':
        const wishlistInternships = allInternships.filter(internship => wishlist.includes(internship.id));
        
        // Generate similar internships based on saved ones
        const getSimilarInternships = () => {
          if (wishlistInternships.length === 0) return [];
          
          const savedSkills = new Set<string>();
          const savedSectors = new Set<string>();
          const savedCompanies = new Set<string>();
          
          wishlistInternships.forEach(internship => {
            internship.required_skills?.forEach(skill => savedSkills.add(skill.toLowerCase()));
            internship.sector_tags?.forEach(sector => savedSectors.add(sector));
            savedCompanies.add(internship.company.toLowerCase());
          });
          
          return allInternships
            .filter(internship => !wishlist.includes(internship.id)) // Exclude already saved
            .map(internship => {
              let similarity = 0;
              
              // Skill similarity (40% weight)
              const skillMatches = internship.required_skills?.filter(skill => 
                savedSkills.has(skill.toLowerCase())
              ).length || 0;
              const skillSimilarity = skillMatches / Math.max(internship.required_skills?.length || 1, 1);
              similarity += skillSimilarity * 0.4;
              
              // Sector similarity (30% weight)
              const sectorMatches = internship.sector_tags?.filter(sector => 
                savedSectors.has(sector)
              ).length || 0;
              const sectorSimilarity = sectorMatches / Math.max(internship.sector_tags?.length || 1, 1);
              similarity += sectorSimilarity * 0.3;
              
              // Company similarity (20% weight)
              const companySimilarity = savedCompanies.has(internship.company.toLowerCase()) ? 1 : 0;
              similarity += companySimilarity * 0.2;
              
              // Location similarity (10% weight)
              const savedLocations = wishlistInternships.map(i => 
                typeof i.location === 'string' ? i.location.toLowerCase() : i.location.city?.toLowerCase()
              );
              const currentLocation = typeof internship.location === 'string' ? 
                internship.location.toLowerCase() : internship.location.city?.toLowerCase();
              const locationSimilarity = savedLocations.includes(currentLocation) ? 1 : 0;
              similarity += locationSimilarity * 0.1;
              
              return { internship, similarity };
            })
            .filter(item => item.similarity > 0.2) // Only show reasonably similar ones
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 6)
            .map(item => item.internship);
        };
        
        const similarInternships = getSimilarInternships();
        
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-racing font-bold text-foreground">
              Saved Internships ({wishlist.length})
            </h2>
            
            {wishlistInternships.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistInternships.map((internship) => (
                    <InternshipCard
                      key={internship.id}
                      internship={internship}
                      userProfile={userProfileData}
                    />
                  ))}
                </div>
                
                {similarInternships.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-primary" />
                      Similar Internships You Might Like
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {similarInternships.map((internship) => (
                        <InternshipCard
                          key={internship.id}
                          internship={internship}
                          userProfile={userProfileData}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Card className="glass-card">
                <CardContent className="p-8 text-center">
                  <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No saved internships yet. Start bookmarking internships you're interested in!
                  </p>
                  <Button asChild variant="outline">
                    <a href="/">Browse Internships</a>
                  </Button>
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
        

        
      case 'news-events':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-racing font-bold text-foreground">
              News & Events
            </h2>
            
            {/* PM Internship Scheme News */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-primary">
                  PM Internship Scheme 2024-25
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Latest updates on Government of India's flagship internship program
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
                  <blockquote className="text-sm italic text-foreground">
                    "Skill development and employment are crucial needs in India. Our government is consistently working in this direction."
                  </blockquote>
                  <p className="text-xs text-muted-foreground mt-2">— Prime Minister Narendra Modi</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Key Highlights</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm mb-1">Target Beneficiaries</h4>
                      <p className="text-sm text-muted-foreground">1.25 lakh youth in pilot phase, 1 crore over 5 years</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm mb-1">Age Criteria</h4>
                      <p className="text-sm text-muted-foreground">21-24 years from low-income households</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm mb-1">Duration</h4>
                      <p className="text-sm text-muted-foreground">12-month internship opportunities</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm mb-1">Companies</h4>
                      <p className="text-sm text-muted-foreground">Top 500 companies across 24 sectors</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Financial Benefits</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">₹5,000</div>
                      <p className="text-sm text-muted-foreground">Monthly Stipend</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">₹6,000</div>
                      <p className="text-sm text-muted-foreground">One-time Grant</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">Insurance</div>
                      <p className="text-sm text-muted-foreground">Coverage Included</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Latest Updates</h3>
                  <div className="space-y-3">
                    <div className="p-3 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20">
                      <p className="text-sm font-medium">Registration Open</p>
                      <p className="text-xs text-muted-foreground">Portal active till 31st March 2025 - Over 6.2 lakh applications received</p>
                    </div>
                    <div className="p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                      <p className="text-sm font-medium">PM Modi Launch Event</p>
                      <p className="text-xs text-muted-foreground">December 2, 2024 - Personal distribution of joining letters to selected candidates</p>
                    </div>
                    <div className="p-3 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20">
                      <p className="text-sm font-medium">Pilot Success</p>
                      <p className="text-xs text-muted-foreground">Launched October 3, 2024 - Overwhelming response from youth across India</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Eligibility Criteria</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">Education Requirements</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• ITI: Matriculation + ITI in relevant trade</li>
                        <li>• Diploma: Intermediate + AICTE-recognized diploma</li>
                        <li>• Degree: Bachelor's from UGC/AICTE university</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Other Requirements</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Age: 18-24 years (updated to 21-24 for current phase)</li>
                        <li>• Aadhaar card mandatory</li>
                        <li>• From low-income households</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">How to Apply</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Official Portal:</strong> <a href="https://pminternship.mca.gov.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">pminternship.mca.gov.in</a></p>
                    <p><strong>Contact:</strong> Email: pminternship@mca.gov.in | Call: 1800 11 6090</p>
                    <p><strong>Application Fee:</strong> Free for all candidates</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <a href="https://pminternship.mca.gov.in" target="_blank" rel="noopener noreferrer">
                      Apply Now on Official Portal
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Additional News Section */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  More Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Viksit Bharat Vision</h3>
                    <p className="text-sm text-muted-foreground">
                      The PM Internship Scheme aligns with the vision of creating a self-reliant India (Atmanirbhar Bharat) 
                      by targeting skill enhancement, job creation, and real-time work exposure.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Industry Expert Opinion</h3>
                    <p className="text-sm text-muted-foreground italic">
                      "This scheme is a clarion call to shape the future workforce by bridging the gap between education 
                      and industry requirements. The focus on underrepresented groups ensures that every youth has a 
                      chance to learn by doing and earn while learning."
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">— Ramesh Alluri Reddy, CEO, TeamLease Degree Apprenticeship</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'tutorials':
        const tutorialVideos = [
          {
            title: 'Candidate Registration & e-EYC',
            hindi: 'https://youtu.be/74qVydBeUeM',
            english: 'https://www.youtube.com/watch?v=0QQjAvzXX1M&t=9s',
            description: 'Learn how to register and complete e-EYC process'
          },
          {
            title: 'Profile Completion after Login',
            hindi: 'https://www.youtube.com/watch?v=3bAsDCgcpCY',
            english: 'https://www.youtube.com/watch?v=Xd47t5qGiUE&t=1s',
            description: 'Complete your profile after successful login'
          },
          {
            title: 'Candidate Dashboard Explained',
            hindi: 'https://youtu.be/mC1__GAlKeY',
            english: 'https://www.youtube.com/watch?v=z6StILWX0tU&t=16s',
            description: 'Navigate and understand your dashboard features'
          },
          {
            title: 'Candidate Application Process',
            hindi: 'https://youtu.be/apegI4TM0Pk',
            english: 'https://www.youtube.com/watch?v=TSO9DXtnTAs',
            description: 'Step-by-step guide to apply for internships'
          }
        ];
        
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-racing font-bold text-foreground">
              Tutorials & Guidance
            </h2>
            
            <div className="grid gap-6">
              {tutorialVideos.map((video, index) => (
                <Card key={index} className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Play className="w-5 h-5 text-primary" />
                      {video.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{video.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        asChild 
                        variant="outline" 
                        className="flex-1 bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700"
                      >
                        <a href={video.hindi} target="_blank" rel="noopener noreferrer">
                          🇮🇳 Watch in Hindi
                        </a>
                      </Button>
                      <Button 
                        asChild 
                        variant="outline" 
                        className="flex-1 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                      >
                        <a href={video.english} target="_blank" rel="noopener noreferrer">
                          🇬🇧 Watch in English
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="glass-card bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <Play className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Need More Help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  These official tutorial videos will guide you through the entire PM Internship Scheme application process.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button asChild variant="outline" size="sm">
                    <a href="https://pminternship.mca.gov.in" target="_blank" rel="noopener noreferrer">
                      Visit Official Portal
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <a href="tel:18001160900">
                      Call Helpline: 1800 11 6090
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'refer-friend':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-racing font-bold text-foreground">
              Refer A Friend
            </h2>
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Invite Friends & Earn Rewards</h3>
                  <p className="text-muted-foreground">
                    Share your referral code and earn 100 points for each friend who joins!
                  </p>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg mb-4">
                  <Label className="text-sm font-medium text-muted-foreground">Your Referral Code</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 p-3 bg-background rounded-lg font-mono text-lg font-bold text-center border">
                      {dashboardProfile?.referralCode || 'Loading...'}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (dashboardProfile?.referralCode) {
                          navigator.clipboard.writeText(dashboardProfile.referralCode);
                          toast({ title: 'Copied!', description: 'Referral code copied to clipboard' });
                        }
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                
                <div className="text-center">
                  <Button 
                    onClick={() => {
                      const shareText = `Join Saksham AI and find your perfect internship! Use my referral code: ${dashboardProfile?.referralCode}`;
                      if (navigator.share) {
                        navigator.share({
                          title: 'Join Saksham AI',
                          text: shareText,
                          url: window.location.origin
                        });
                      } else {
                        navigator.clipboard.writeText(shareText);
                        toast({ title: 'Copied!', description: 'Referral message copied to clipboard' });
                      }
                    }}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Share Referral Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        


      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen hero-gradient">
      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs />
          {renderContent()}
        </div>
    </div>
  );
}
