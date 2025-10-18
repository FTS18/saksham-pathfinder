import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useGamification } from '@/contexts/GamificationContext';
import { Hero } from '@/components/Hero';
import { ProfileForm } from '@/components/ProfileForm';
import { InternshipFilters } from '@/components/InternshipFilters';
import { useInternshipFilters } from '@/hooks/useInternshipFilters';
import { InternshipCard } from '@/components/InternshipCard';
import { SuccessStoriesMarquee } from '@/components/SuccessStoriesMarquee';
import MagicBento from '@/components/MagicBento';
import { LazyComponent } from '@/components/LazyComponent';
import { SkeletonGrid, SkeletonCard } from '@/components/SkeletonLoaders';
import { InternshipListSkeleton, PageLoadingSpinner } from '@/components/LoadingStates';
import { InternshipCardSkeleton } from '@/components/skeletons/InternshipCardSkeleton';
import { HomeFAQ } from '@/components/HomeFAQ';
import { PartnerCompanies } from '@/components/PartnerCompanies';
import { ComparisonButton } from '@/components/ComparisonButton';
import { SEOHead } from '@/components/SEOHead';
import { SearchResultsCount } from '@/components/SearchResultsCount';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { cache, CACHE_KEYS } from '@/lib/cache';
import { sanitizeInternshipData } from '@/lib/sanitize';
import { saveFilters, loadFilters } from '@/lib/filterPersistence';
import { SmartFilterService } from '@/services/smartFilterService';
import { fetchInternships } from '@/lib/dataExtractor';
import type { Internship, ProfileData, FilterState } from '@/types';




// Lazy load heavy components with proper error handling
const Stats = lazy(() => import('@/components/Stats').then(module => ({ default: module.Stats })));
const Testimonials = lazy(() => import('@/components/Testimonials').then(module => ({ default: module.Testimonials })));
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowUpDown, ChevronLeft, ChevronRight, Calendar, Briefcase, GraduationCap, Users, Building, Filter } from 'lucide-react';

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
  
  
  // Vector-based AI scoring with cosine similarity
  const createProfileVector = (profile: any, allInternships: any[]) => {
      const allSkills = [...new Set(allInternships.flatMap(i => i.required_skills || []))];
      const allSectors = [...new Set(allInternships.flatMap(i => i.sector_tags || []))];
      const allLocations = [...new Set(allInternships.map(i => typeof i.location === 'string' ? i.location : i.location?.city).filter(Boolean))];
      
      const skillVector = allSkills.map(skill => (profile.skills || []).includes(skill) ? 1 : 0);
      const sectorVector = allSectors.map(sector => (profile.interests || []).includes(sector) ? 1 : 0);
      const locationVector = allLocations.map(loc => {
          const userLoc = profile.desiredLocation || profile.location;
          const userCity = (typeof userLoc === 'string' ? userLoc : userLoc?.city || '').toLowerCase();
          return loc.toLowerCase() === userCity ? 1 : 0;
      });
      
      return [...skillVector, ...sectorVector, ...locationVector];
  };
  
  const createInternshipVector = (internship: any, allInternships: any[]) => {
      const allSkills = [...new Set(allInternships.flatMap(i => i.required_skills || []))];
      const allSectors = [...new Set(allInternships.flatMap(i => i.sector_tags || []))];
      const allLocations = [...new Set(allInternships.map(i => typeof i.location === 'string' ? i.location : i.location?.city).filter(Boolean))];
      
      const skillVector = allSkills.map(skill => (internship.required_skills || []).includes(skill) ? 1 : 0);
      const sectorVector = allSectors.map(sector => (internship.sector_tags || []).includes(sector) ? 1 : 0);
      const locationVector = allLocations.map(loc => {
          const internshipLoc = typeof internship.location === 'string' ? internship.location : internship.location?.city || '';
          return internshipLoc.toLowerCase() === loc.toLowerCase() ? 1 : 0;
      });
      
      return [...skillVector, ...sectorVector, ...locationVector];
  };
  
  const cosineSimilarity = (vecA: number[], vecB: number[]) => {
      const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
      const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
      const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
      
      if (magnitudeA === 0 || magnitudeB === 0) return 0;
      return dotProduct / (magnitudeA * magnitudeB);
  };
  
  // Skill normalization function - moved outside to be accessible
  const normalizeSkill = (skill: string) => {
      const normalized = skill.toLowerCase().trim();
      const skillMap: { [key: string]: string } = {
          'html': 'html', 'css': 'css', 'javascript': 'javascript', 'js': 'javascript',
          'react': 'react', 'reactjs': 'react', 'node': 'nodejs', 'nodejs': 'nodejs',
          'python': 'python', 'java': 'java', 'machine learning': 'ml', 'ml': 'ml',
          'data science': 'data-science', 'analytics': 'data-science'
      };
      return skillMap[normalized] || normalized;
  };

  const score = (profile: any, internship: any, allInternships: any[] = []) => {
      const parseStipend = (stipend: string) => {
          const match = stipend.match(/₹([\d,]+)/);
          return match ? parseInt(match[1].replace(/,/g, '')) : 0;
      };
      
      const internshipStipend = parseStipend(internship.stipend || '₹0');
      
      // Strict filtering
      if (profile.minStipend && profile.minStipend > 0 && internshipStipend < profile.minStipend) {
          return { score: 0, explanation: 'Below minimum stipend requirement', aiTags: [] };
      }
      
      const required = internship.required_skills || [];
      const userSkills = profile.skills || [];
      const matched_skills = required.filter((s: string) => 
          userSkills.some((userSkill: string) => 
              normalizeSkill(userSkill) === normalizeSkill(s)
          )
      );
      
      // Hard filter: must have at least 1 matching skill if user has skills
      if (required.length > 0 && matched_skills.length === 0 && userSkills.length > 0) {
          return { score: 0, explanation: 'No matching skills found', aiTags: [] };
      }
      
      // DYNAMIC SCORING ALGORITHM WITH SECTOR + COMPANY TIERS
      
      // Calculate dataset statistics for dynamic weighting
      const stipends = allInternships.map(i => parseStipend(i.stipend || '₹0')).filter(s => s > 0);
      const maxStipend = Math.max(...stipends, 50000);
      const avgStipend = stipends.reduce((a, b) => a + b, 0) / stipends.length || 15000;
      const localAvg = avgStipend; // Use for location scoring
      
      // 1. Skills Score (30-50 points) - ANCHOR
      let skillScore = 0;
      const skillRatio = required.length > 0 ? matched_skills.length / required.length : 0.5;
      skillScore = 40 * skillRatio; // Base 0-40
      if (skillRatio === 1.0 && required.length >= 3) skillScore += 8; // Perfect match bonus
      if (matched_skills.length >= 4) skillScore += 2; // Many skills bonus
      
      // 2. Location Score (15 points) - Distance-based with city priority
      let locationScore = 8; // Default neutral
      if (profile.desiredLocation || profile.location) {
          const userLocation = profile.desiredLocation || profile.location;
          const userCity = (typeof userLocation === 'string' ? userLocation : userLocation.city || '').toLowerCase();
          const internshipCity = (typeof internship.location === 'string' ? internship.location : internship.location?.city || '').toLowerCase();
          
          if (internshipCity === 'remote') {
              locationScore = 15; // Max for remote
          } else if (internshipCity === userCity) {
              locationScore = 14; // High for same city
          } else {
              // Distance-based scoring with all major Indian cities
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
                  'gurgaon': { lat: 28.4595, lng: 77.0266 },
                  'noida': { lat: 28.5355, lng: 77.3910 },
                  'chandigarh': { lat: 30.7333, lng: 76.7794 },
                  'lucknow': { lat: 26.8467, lng: 80.9462 },
                  'kanpur': { lat: 26.4499, lng: 80.3319 },
                  'nagpur': { lat: 21.1458, lng: 79.0882 },
                  'indore': { lat: 22.7196, lng: 75.8577 },
                  'bhopal': { lat: 23.2599, lng: 77.4126 },
                  'visakhapatnam': { lat: 17.6868, lng: 83.2185 },
                  'kochi': { lat: 9.9312, lng: 76.2673 }
              };
              
              const userCoords = cityCoords[userCity];
              const internshipCoords = cityCoords[internshipCity];
              
              if (userCoords && internshipCoords) {
                  const distance = haversine(userCoords, internshipCoords);
                  // Distance-based scoring: 0-50km=12pts, 50-200km=10pts, 200-500km=7pts, 500-1000km=5pts, >1000km=3pts
                  if (distance <= 50) locationScore = 12;
                  else if (distance <= 200) locationScore = 10;
                  else if (distance <= 500) locationScore = 7;
                  else if (distance <= 1000) locationScore = 5;
                  else locationScore = 3;
              } else {
                  locationScore = 6; // Unknown cities get neutral score
              }
          }
      }
      
      // 3. Stipend Score (20 points) - Normalized logarithmic
      const stipendNormalized = Math.log(1 + internshipStipend) / Math.log(1 + maxStipend);
      let stipendScore = 15 * stipendNormalized;
      // Bonus for being above average
      if (internshipStipend > avgStipend * 1.5) stipendScore += 5;
      stipendScore = Math.min(20, stipendScore);
      
      // 4. Sector Score (10 points) - Color-coded tiers
      const sectorTags = internship.sector_tags || [];
      const greenSectors = ['AI/ML', 'Web3', 'Cloud', 'Cybersecurity', 'Data Science', 'Machine Learning'];
      const yellowSectors = ['Web Development', 'Data Analytics', 'Marketing Tech', 'Mobile Development'];
      const redSectors = ['Non-tech', 'General', 'Other'];
      
      let sectorMultiplier = 0.4; // Default (red)
      if (sectorTags.some(s => greenSectors.includes(s))) sectorMultiplier = 1.0;
      else if (sectorTags.some(s => yellowSectors.includes(s))) sectorMultiplier = 0.7;
      
      const sectorMatch = sectorTags.filter((t: any) => (profile.interests || []).includes(t));
      let sectorScore = 6 * sectorMultiplier;
      if (sectorMatch.length > 0) sectorScore += 4 * sectorMultiplier;
      sectorScore = Math.min(10, sectorScore);
      
      // 5. Company Reputation Score (10 points) - Tiered weighting
      const tier1Companies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'OpenAI'];
      const tier2Companies = ['Uber', 'Airbnb', 'Tesla', 'Adobe', 'Salesforce', 'PayPal', 'Flipkart'];
      const tier3Companies = ['Paytm', 'Zomato', 'Infosys', 'TCS', 'Wipro', 'HUL', 'Reliance'];
      
      let companyMultiplier = 0.5; // Default
      if (tier1Companies.includes(internship.company)) companyMultiplier = 1.0;
      else if (tier2Companies.includes(internship.company)) companyMultiplier = 0.8;
      else if (tier3Companies.includes(internship.company)) companyMultiplier = 0.6;
      
      let companyScore = 8 * companyMultiplier;
      // Startup bonus if stipend is competitive
      if (companyMultiplier <= 0.5 && internshipStipend >= avgStipend * 1.2) {
          companyScore += 2; // Competitive startup bonus
      }
      companyScore = Math.min(10, companyScore);
      
      // 6. Uniqueness Factor (5 points) - Rare skill requirements
      const allSkills = allInternships.flatMap(i => i.required_skills || []);
      const skillFreq = required.reduce((acc, skill) => {
          const count = allSkills.filter(s => normalizeSkill(s) === normalizeSkill(skill)).length;
          return acc + (count < 5 ? 2 : count < 10 ? 1 : 0); // Rare skills get bonus
      }, 0);
      const uniquenessScore = Math.min(5, skillFreq);
      
      // Total Score out of 100: Skills(40) + Stipend(20) + Location(15) + Sector(10) + Company(10) + Uniqueness(5)
      const totalScore = Math.min(100, Math.max(1,
          skillScore + stipendScore + locationScore + sectorScore + companyScore + uniquenessScore
      ));
      
      // Generate explanation
      let explanation = '';
      if (matched_skills.length > 0) {
          explanation += `${matched_skills.length}/${required.length} skills match. `;
      }
      if (sectorMultiplier >= 0.7) {
          explanation += `High-demand sector. `;
      }
      if (companyMultiplier >= 0.8) {
          explanation += `Reputed company. `;
      }
      if (internshipStipend >= avgStipend * 1.2) {
          explanation += `Above-average stipend. `;
      }
      if (locationScore >= 12) {
          explanation += `Great location match. `;
      }
      
      return { 
          score: Math.round(totalScore),
          explanation: explanation.trim() || 'Good overall match',
          aiTags: []
      };
  }
  
  const recommendInternships = (profile: any, allInternships: any[]) => {
      if (!profile) return [];
      
      // Score all internships
      const scores = allInternships.map(internship => {
          const result = score(profile, internship, allInternships);
          return { 
              internship, 
              score: result.score,
              explanation: result.explanation,
              aiTags: result.aiTags
          };
      });
  
      // Multi-tier sorting with neighbor-sensitive ranking
      const validScores = scores.filter(item => item.score > 0);
      const sorted = validScores.sort((a, b) => {
          // Get skill match ratios for primary sort
          const getSkillRatio = (item: any) => {
              const required = item.internship.required_skills || [];
              const userSkills = profile.skills || [];
              const matched = required.filter((s: string) => 
                  userSkills.some((userSkill: string) => 
                      normalizeSkill(userSkill) === normalizeSkill(s)
                  )
              );
              return required.length > 0 ? matched.length / required.length : 0.5;
          };
          
          const getSectorTier = (item: any) => {
              const sectorTags = item.internship.sector_tags || [];
              const greenSectors = ['AI/ML', 'Web3', 'Cloud', 'Cybersecurity', 'Data Science', 'Machine Learning'];
              const yellowSectors = ['Web Development', 'Data Analytics', 'Marketing Tech', 'Mobile Development'];
              if (sectorTags.some(s => greenSectors.includes(s))) return 3; // Green
              if (sectorTags.some(s => yellowSectors.includes(s))) return 2; // Yellow
              return 1; // Red
          };
          
          const getCompanyTier = (item: any) => {
              const tier1 = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'OpenAI'];
              const tier2 = ['Uber', 'Airbnb', 'Tesla', 'Adobe', 'Salesforce', 'PayPal', 'Flipkart'];
              const tier3 = ['Paytm', 'Zomato', 'Infosys', 'TCS', 'Wipro', 'HUL', 'Reliance'];
              if (tier1.includes(item.internship.company)) return 4;
              if (tier2.includes(item.internship.company)) return 3;
              if (tier3.includes(item.internship.company)) return 2;
              return 1;
          };
          
          const skillRatioA = getSkillRatio(a);
          const skillRatioB = getSkillRatio(b);
          
          // Primary: Skills ratio (descending)
          if (Math.abs(skillRatioB - skillRatioA) > 0.15) {
              return skillRatioB - skillRatioA;
          }
          
          // Secondary: Total weighted score
          if (Math.abs(b.score - a.score) > 3) {
              return b.score - a.score;
          }
          
          // Tertiary: Neighbor stipend density (prevent outliers)
          const parseStipend = (stipend: string) => {
              const match = stipend.match(/₹([\d,]+)/);
              return match ? parseInt(match[1].replace(/,/g, '')) : 0;
          };
          const stipendA = parseStipend(a.internship.stipend || '₹0');
          const stipendB = parseStipend(b.internship.stipend || '₹0');
          
          // Only prefer higher stipend if difference is significant
          if (Math.abs(stipendB - stipendA) > 3000) {
              return stipendB - stipendA;
          }
          
          // Quaternary: Sector + Company tier
          const sectorDiff = getSectorTier(b) - getSectorTier(a);
          if (sectorDiff !== 0) return sectorDiff;
          
          const companyDiff = getCompanyTier(b) - getCompanyTier(a);
          if (companyDiff !== 0) return companyDiff;
          
          // Tie-breaker: Location closeness
          const userLocation = profile.desiredLocation || profile.location;
          if (userLocation) {
              const userCity = (typeof userLocation === 'string' ? userLocation : userLocation.city || '').toLowerCase();
              const cityA = (typeof a.internship.location === 'string' ? a.internship.location : a.internship.location?.city || '').toLowerCase();
              const cityB = (typeof b.internship.location === 'string' ? b.internship.location : b.internship.location?.city || '').toLowerCase();
              
              if (cityA === userCity && cityB !== userCity) return -1;
              if (cityB === userCity && cityA !== userCity) return 1;
          }
          
          return stipendB - stipendA; // Final fallback
      });
      
      // Add AI Recommended tags - only top 3 matches
      sorted.forEach((item, index) => {
          if (index < 3 && item.score >= 75) {
              item.aiTags = ['AI Recommended'];
          } else {
              item.aiTags = [];
          }
      });
      
      return sorted;
  }

const Index = () => {
  // SEO for homepage
  const seoProps = {
    title: 'Saksham AI - AI-Powered Internship Discovery Platform',
    description: 'Find the perfect internship with AI-powered recommendations. Discover meaningful career opportunities tailored to your skills and aspirations in India.',
    keywords: 'internship, AI, career, jobs, students, recommendations, machine learning, India, PM internship scheme'
  };
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  
  // Enhanced mobile features
  const { searchHistory, addToHistory } = useSearchHistory();
  const { trackPageView, trackSearch } = useAnalytics();
  const { addPoints } = useGamification();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [allInternships, setAllInternships] = useState<any[]>([]);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(true);
  const [sortOptions, setSortOptions] = useState<string[]>(['ai']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [hasAppliedAIFilters, setHasAppliedAIFilters] = useState(false);
  const { recentlyViewed, addToRecentlyViewed } = useRecentlyViewed();

  const profileFormRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Pull-to-refresh functionality
  const { elementRef: pullToRefreshRef, isRefreshing, pullDistance } = usePullToRefresh({
    onRefresh: async () => {
      // Refresh internships data
      const response = await fetch('/internships.json');
      const data = await response.json();
      setAllInternships(sanitizeInternshipData(data));
      
      // Re-run recommendations if profile exists
      if (profileData) {
        const recs = recommendInternships(profileData, data);
        setRecommendations(recs);
      }
      
      toast({
        title: "Refreshed!",
        description: "Latest internships loaded"
      });
    }
  });
  
  // Swipe gestures for navigation
  const swipeRef = useSwipeGestures({
    onSwipeLeft: () => {
      if (currentPage < totalPages) {
        handlePageChange(currentPage + 1);
      }
    },
    onSwipeRight: () => {
      if (currentPage > 1) {
        handlePageChange(currentPage - 1);
      }
    }
  });
  
  const itemsPerPage = 21;
  


  // Initial page load
  useEffect(() => {
    trackPageView('homepage');
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [trackPageView]);
  
  // Load internships
  useEffect(() => {
    const loadInternships = async () => {
      try {
        const data = await fetchInternships();
        setAllInternships(sanitizeInternshipData(data));
      } catch (error) {
        console.error('Failed to load internships:', error);
        setAllInternships([]);
      }
    };
    loadInternships();
  }, []);

  // Use the filtering hook with persistence
  const { filters, setFilters, filteredInternships, filterRecommendations, sectors, locations } = useInternshipFilters(allInternships);
  

  
  // Load saved filters on mount
  useEffect(() => {
    const savedFilters = loadFilters();
    if (savedFilters && !profileData) {
      setFilters(savedFilters);
    }
  }, [setFilters, profileData]);
  
  // Save filters when they change
  useEffect(() => {
    if (!profileData) {
      saveFilters(filters);
    }
  }, [filters, profileData]);

  // Keep filters at default "All" when profile is submitted - don't auto-apply profile selections
  useEffect(() => {
    if (profileData) {
      // Don't automatically set filters based on profile - keep them at "All" by default
      setFilters(prev => ({
        ...prev,
        location: 'all',
        sector: 'all',
        education: 'all',
        minStipend: 'all',
        selectedSectors: [], // Keep empty so all sectors show
        selectedSkills: []   // Keep empty so all skills show
      }));
    }
  }, [profileData, setFilters]);

  // Re-sort when sort options change (but maintain AI score priority)
  useEffect(() => {
    if (recommendations.length > 0) {
      setRecommendations(prev => sortRecommendations(prev));
    }
  }, [sortOptions]);
  
  // Reset page when recommendations change
  useEffect(() => {
    setCurrentPage(1);
  }, [recommendations.length]);

  // Load profile from local storage on initial load
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        handleProfileSubmit(parsedProfile);
      } catch (error) {
        console.error("Failed to parse saved profile:", error);
        localStorage.removeItem('userProfile'); // Clear corrupted data
      }
    }
  }, []); // Empty dependency array ensures this runs only once on mount
  
  // Listen for global search events with proper cleanup
  useEffect(() => {
    const handleGlobalSearch = (e: CustomEvent) => {
      const query = e.detail.query;
      console.log('Index - Global search event received:', query);
      setFilters(prev => ({ ...prev, search: query }));
    };
    
    const controller = new AbortController();
    window.addEventListener('globalSearch', handleGlobalSearch as EventListener, {
      signal: controller.signal
    });
    
    return () => {
      controller.abort();
    };
  }, [setFilters]);
  

  
  const handleProfileSubmit = async (data: ProfileData) => {
    setIsLoading(true);
    setProfileData(data);
    
    // Award points for profile completion
    await addPoints(50, 'Profile completion');
    
    // Load internships if not already loaded
    let internships = allInternships;
    if (internships.length === 0) {
      try {
        const response = await fetch('/internships.json');
        internships = await response.json();
        setAllInternships(internships);
      } catch (error) {
        console.warn('Failed to load internships data');
        setIsLoading(false);
        return;
      }
    }
    
    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 1700));
    
    const recs = recommendInternships(data, internships);
    // Recommendations are already sorted by AI score, just apply any additional sorting
    setRecommendations(recs);
    setIsLoading(false);
    setShowProfileForm(false);
    
    // Calculate filtered count after setting recommendations
    setTimeout(() => {
      const filteredCount = recs.length; // Show all recommendations
      toast({
        title: "AI Analysis Complete!",
        description: `Analyzed ${internships.length} internships, found ${filteredCount} matches.`,
      });
    }, 100);

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
    
    // Always prioritize AI score as primary sort
    sorted = sorted.sort((a, b) => {
      // Primary: AI score (descending)
      if (b.score !== a.score) return b.score - a.score;
      
      // Secondary sorts based on user selection
      if (sortOptions.includes('stipend')) {
        const stipendDiff = parseStipend(b.internship.stipend) - parseStipend(a.internship.stipend);
        if (stipendDiff !== 0) return stipendDiff;
      }
      
      if (sortOptions.includes('proximity') && profileData?.location) {
        const locationDiff = getLocationScore(
          typeof profileData.location === 'string' ? profileData.location : profileData.location.city, 
          b.internship.location
        ) - getLocationScore(
          typeof profileData.location === 'string' ? profileData.location : profileData.location.city, 
          a.internship.location
        );
        if (locationDiff !== 0) return locationDiff;
      }
      
      // Final tiebreaker: stipend
      return parseStipend(b.internship.stipend) - parseStipend(a.internship.stipend);
    });
    
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
  const displayItems = useMemo(() => {
    // If search is active, always search through ALL internships regardless of profile
    if (filters.search && filters.search.trim()) {
      const searchLower = filters.search.toLowerCase().trim();
      const allItems = allInternships.filter(internship => {
        // Ensure internship has required properties
        if (!internship || typeof internship !== 'object') return false;
        
        const title = (internship.title || '').toLowerCase();
        const company = (internship.company || '').toLowerCase();
        const skills = (internship.required_skills || []).map(skill => (skill || '').toLowerCase());
        const sectors = (internship.sector_tags || []).map(sector => (sector || '').toLowerCase());
        const location = (typeof internship.location === 'string' ? internship.location : internship.location?.city || '').toLowerCase();
        
        const matchesSearch = title.includes(searchLower) ||
                            company.includes(searchLower) ||
                            skills.some(skill => skill.includes(searchLower)) ||
                            sectors.some(sector => sector.includes(searchLower)) ||
                            location.includes(searchLower);
        if (!matchesSearch) return false;
        
        // Apply sector filters
        if (filters.selectedSectors && filters.selectedSectors.length > 0) {
          const hasSectorMatch = (internship.sector_tags || []).some(tag => filters.selectedSectors!.includes(tag));
          if (!hasSectorMatch) return false;
        } else if (filters.sector && filters.sector !== 'all') {
          const hasSectorMatch = (internship.sector_tags || []).includes(filters.sector);
          if (!hasSectorMatch) return false;
        }
        
        // Apply skill filters
        if (filters.selectedSkills && filters.selectedSkills.length > 0) {
          const hasSkillMatch = (internship.required_skills || []).some(skill => filters.selectedSkills!.includes(skill));
          if (!hasSkillMatch) return false;
        }
        
        // Apply other filters
        if (filters.location && filters.location !== 'all') {
          const internshipLocation = typeof internship.location === 'string' ? internship.location : internship.location?.city || '';
          if (!internshipLocation.toLowerCase().includes(filters.location.toLowerCase())) return false;
        }
        
        if (filters.workMode && filters.workMode !== 'all') {
          if (internship.work_mode !== filters.workMode) return false;
        }
        
        if (filters.education && filters.education !== 'all') {
          const hasEducationMatch = (internship.preferred_education_levels || []).includes(filters.education);
          if (!hasEducationMatch) return false;
        }
        
        if (filters.minStipend && filters.minStipend !== 'all') {
          const minAmount = parseInt(filters.minStipend);
          const stipendAmount = parseInt(internship.stipend.replace(/[^\d]/g, ''));
          if (stipendAmount < minAmount) return false;
        }
        
        return true;
      });
      
      return allItems.map(internship => ({ internship, score: 0, explanation: '', aiTags: [] }));
    }
    
    // For profile users without search, use filtered recommendations
    if (profileData && filterRecommendations) {
      const filtered = filterRecommendations(recommendations);
      return filtered;
    }
    
    // For non-profile users without search, show all internships
    const allItems = allInternships.filter(internship => {
      // Apply other filters but NOT sector filters for main page
      if (filters.location && filters.location !== 'all') {
        const internshipLocation = typeof internship.location === 'string' ? internship.location : internship.location?.city || '';
        if (!internshipLocation.toLowerCase().includes(filters.location.toLowerCase())) return false;
      }
      
      if (filters.minStipend && filters.minStipend !== 'all') {
        const minAmount = parseInt(filters.minStipend);
        const stipendAmount = parseInt(internship.stipend.replace(/[^\d]/g, ''));
        if (stipendAmount < minAmount) return false;
      }
      
      return true;
    });
    
    return allItems.map(internship => ({ internship, score: 0, explanation: '', aiTags: [] }));
  }, [profileData, filterRecommendations, recommendations, allInternships, filters]);

  // Effect for internship data requests with proper cleanup
  useEffect(() => {
    const handleInternshipDataRequest = (e: CustomEvent) => {
      const { internshipId, currentIndex } = e.detail;
      const responseEvent = new CustomEvent('internshipDataResponse', {
        detail: {
          internships: displayItems,
          currentIndex: displayItems.findIndex(item => item.internship.id === internshipId)
        }
      });
      window.dispatchEvent(responseEvent);
    };
    
    const controller = new AbortController();
    window.addEventListener('requestInternshipData', handleInternshipDataRequest as EventListener, {
      signal: controller.signal
    });
    
    return () => {
      controller.abort();
    };
  }, [displayItems]);

  const totalPages = Math.ceil((displayItems?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  // Show all items if showAllRecommendations is true, but not automatically for search
  const shouldShowAll = showAllRecommendations;
  const currentItems = shouldShowAll ? (displayItems || []) : (displayItems || []).slice(startIndex, endIndex);
  
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

  const handleInternshipView = (internship: any) => {
    addToRecentlyViewed(internship);
  };

  if (isPageLoading) {
    return <PageLoadingSpinner />;
  }
  
  return (
    <>
      <SEOHead {...seoProps} />
      <div 
        ref={(el) => {
          if (pullToRefreshRef.current !== el) pullToRefreshRef.current = el;
          if (swipeRef.current !== el) swipeRef.current = el;
        }}
        className="min-h-full bg-background relative"
      >
        {/* Pull-to-refresh indicator */}
        {pullDistance > 0 && (
          <div 
            className="fixed top-0 left-0 right-0 z-50 bg-primary/10 backdrop-blur-sm transition-all duration-200"
            style={{ height: `${Math.min(pullDistance, 80)}px` }}
          >
            <div className="flex items-center justify-center h-full">
              <RefreshCw className={`w-6 h-6 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="ml-2 text-sm text-primary">
                {isRefreshing ? 'Refreshing...' : pullDistance > 60 ? 'Release to refresh' : 'Pull to refresh'}
              </span>
            </div>
          </div>
        )}

      <Hero onGetStartedClick={handleGetStartedClick} />
      
      {/* Success Stories Section */}
      <section className="py-8 bg-background">
        <h2 className="text-4xl font-racing font-bold text-center mb-4">Success Stories</h2>
        <SuccessStoriesMarquee />
      </section>
      
      {/* PM Internship Eligibility Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-racing font-bold text-foreground mb-4">
              Are you Eligible for PM <span className="relative text-foreground">
                Internship
                <div className="absolute -bottom-1 left-0 w-full h-1 flex">
                  <div className="w-1/3 h-full bg-orange-500"></div>
                  <div className="w-1/3 h-full bg-white border border-gray-300"></div>
                  <div className="w-1/3 h-full bg-green-500"></div>
                </div>
              </span> Scheme?
            </h2>
            <p className="text-xl text-muted-foreground">Check your eligibility for Government of India's PM Internship Scheme</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MagicBento 
              spotlightRadius={300}
              particleCount={12}
              glowColor="132, 0, 255"
              className="border-2"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Age</h3>
                <p className="text-muted-foreground">21-24 Years</p>
              </div>
            </MagicBento>
            
            <MagicBento 
              spotlightRadius={300}
              particleCount={12}
              glowColor="132, 0, 255"
              className="border-2"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Job Status</h3>
                <p className="text-muted-foreground">Not Employed Full Time</p>
              </div>
            </MagicBento>
            
            <MagicBento 
              spotlightRadius={300}
              particleCount={12}
              glowColor="132, 0, 255"
              className="border-2"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Education</h3>
                <p className="text-muted-foreground">Not Enrolled Full Time</p>
              </div>
            </MagicBento>
            
            <MagicBento 
              spotlightRadius={300}
              particleCount={12}
              glowColor="132, 0, 255"
              className="border-2 md:col-span-2 lg:col-span-1"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Government Job</h3>
                <p className="text-muted-foreground">No Member has a Govt. Job</p>
              </div>
            </MagicBento>
            
            <MagicBento 
              spotlightRadius={300}
              particleCount={12}
              glowColor="132, 0, 255"
              className="border-2 md:col-span-2"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Family Income</h3>
                <p className="text-muted-foreground">No one earning more than ₹8 Lakhs PA</p>
              </div>
            </MagicBento>
          </div>
          
          {/* Core Benefits */}
          <div className="mt-16 mb-12">
            <h3 className="text-2xl font-racing font-bold text-center text-foreground mb-8">Core Benefits for PM Internship Scheme</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <MagicBento 
                spotlightRadius={200}
                glowColor="34, 197, 94"
                className="p-4 border border-border rounded-lg"
              >
                <h4 className="font-semibold text-foreground mb-2">12 months real-life experience</h4>
                <p className="text-muted-foreground text-sm">in India's top companies</p>
              </MagicBento>
              <MagicBento 
                spotlightRadius={200}
                glowColor="59, 130, 246"
                className="p-4 border border-border rounded-lg"
              >
                <h4 className="font-semibold text-foreground mb-2">Monthly assistance</h4>
                <p className="text-muted-foreground text-sm">₹4500 by Government of India and ₹500 by Industry</p>
              </MagicBento>
              <MagicBento 
                spotlightRadius={200}
                glowColor="168, 85, 247"
                className="p-4 border border-border rounded-lg"
              >
                <h4 className="font-semibold text-foreground mb-2">One-time Grant</h4>
                <p className="text-muted-foreground text-sm">₹6000 for incidentals</p>
              </MagicBento>
              <MagicBento 
                spotlightRadius={200}
                glowColor="245, 158, 11"
                className="p-4 border border-border rounded-lg"
              >
                <h4 className="font-semibold text-foreground mb-2">Select from Various Sectors</h4>
                <p className="text-muted-foreground text-sm">and from top Companies of India</p>
              </MagicBento>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              className="relative bg-background text-foreground border-4 px-8 py-3 hover:bg-muted/50 transition-colors"
              style={{
                borderImage: 'linear-gradient(to right, #ff9933 33.33%, #ffffff 33.33%, #ffffff 66.66%, #138808 66.66%) 1'
              }}
              onClick={handleGetStartedClick}
            >
              Check Your Eligibility
            </Button>
          </div>
        </div>
      </section>

      {showProfileForm && (
        <div ref={profileFormRef} id="profile-form" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Processing your profile... Analyzing preferences and finding matches</p>
              </div>
            ) : (
              <ProfileForm onProfileSubmit={handleProfileSubmit} />
            )}
          </div>
        </div>
      )}

      {profileData && (
        <section id="recommendations-section" className="bg-card py-12 sm:py-16 lg:py-20 px-2 sm:px-6 lg:px-8">
            <div className='w-full max-w-6xl mx-auto px-4'>
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-racing font-bold text-foreground mb-4">
                        🎯 AI Recommendations
                    </h2>
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-muted-foreground">
                            Found {displayItems?.length || 0} matching internships (sorted by AI score)
                        </p>
                    </div>
                    {recentlyViewed.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <span>👀</span> Recently Viewed
                            </h3>
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {recentlyViewed.slice(0, 5).map((item) => (
                                    <div key={item.id} className="flex-shrink-0 bg-muted/50 rounded-lg p-3 min-w-[200px]">
                                        <p className="font-medium text-sm truncate">{item.title}</p>
                                        <p className="text-xs text-muted-foreground truncate">{item.company}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="bg-primary/10 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-primary font-medium">
                                📊 Personalized matches based on your profile
                            </p>
                            <Button 
                                onClick={() => {
                                    if (profileData && !hasAppliedAIFilters) {
                                        const smartFilters = SmartFilterService.generateSmartFilters(profileData, {
                                            prioritizeHighStipend: true,
                                            includeRemoteWork: true,
                                            strictSkillMatching: false,
                                            locationRadius: 'nearby'
                                        });
                                        setFilters(smartFilters);
                                        setHasAppliedAIFilters(true);
                                        
                                        const matchScore = SmartFilterService.calculateFilterMatchScore(profileData, smartFilters);
                                        toast({
                                            title: "Smart Filters Applied!",
                                            description: `Applied your profile preferences (${matchScore}% match): ${(profileData.interests || []).length} sectors, ${(profileData.skills || []).length} skills`,
                                        });
                                    } else if (hasAppliedAIFilters) {
                                        setFilters({
                                            search: '',
                                            sector: 'all',
                                            location: 'all',
                                            workMode: 'all',
                                            education: 'all',
                                            minStipend: 'all',
                                            sortBy: 'ai-recommended',
                                            selectedSectors: [],
                                            selectedSkills: []
                                        });
                                        setHasAppliedAIFilters(false);
                                        toast({
                                            title: "Filters Reset!",
                                            description: "Showing all recommendations again",
                                        });
                                    }
                                }}
                                size="sm"
                                className={`${hasAppliedAIFilters ? 'bg-green-100 hover:bg-green-200 text-green-700 border-green-300' : 'bg-primary/20 hover:bg-primary/30 text-primary border-primary/30'}`}
                                variant="outline"
                            >
                                <Filter className="w-4 h-4 mr-1" />
                                {hasAppliedAIFilters ? 'Reset Filters' : 'Apply My Profile'}
                            </Button>
                        </div>
                    </div>
                    
                    {/* Filters */}
                    <div className="bg-background/95 backdrop-blur-sm rounded-lg p-4 mb-6">
                      <InternshipFilters
                        filters={filters}
                        onFiltersChange={setFilters}
                        sectors={sectors}
                        locations={locations}
                        userProfile={profileData}
                      />
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

                {displayItems.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 internship-cards-container">
                            {currentItems.map((item, index) => (
                                <LazyComponent 
                                    key={item.internship.id}
                                    fallback={<SkeletonCard />}
                                    rootMargin="200px"
                                >
                                    <InternshipCard 
                                        internship={item.internship}
                                        matchExplanation={item.explanation}
                                        aiTags={item.aiTags}
                                        userProfile={profileData}
                                        aiScore={item.score}
                                        onNext={() => handlePageChange(currentPage + 1)}
                                        onPrev={() => handlePageChange(currentPage - 1)}
                                        currentIndex={startIndex + index + 1}
                                        totalCount={displayItems.length}
                                    />
                                </LazyComponent>
                            ))}
                        </div>
                        {displayItems.length > itemsPerPage && (
                            <div className="text-center mb-8">
                                <Button 
                                    onClick={() => setShowAllRecommendations(!showAllRecommendations)}
                                    variant="outline"
                                    className="rounded-full"
                                >
                                    {showAllRecommendations ? 'Show Less' : `View All ${displayItems.length} Matches`}
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <div className="mb-6">
                            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">Processing your profile...</h3>
                            <p className="text-muted-foreground mb-2">Analyzing your preferences and finding matches</p>
                            <p className="text-xs text-muted-foreground/70">Powered by Team HexaCoders</p>
                        </div>
                        <Button 
                            onClick={() => setFilters({
                                search: '',
                                sector: 'all',
                                location: 'all',
                                workMode: 'all',
                                education: 'all',
                                minStipend: 'all',
                                sortBy: 'ai-recommended'
                            })}
                            className="mt-4"
                            variant="outline"
                        >
                            Clear Filters
                        </Button>
                    </div>
                )}
                        
                        {totalPages > 1 && !showAllRecommendations && (
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
        <section className="bg-card py-12 sm:py-16 lg:py-20 px-2 sm:px-6 lg:px-8">
            <div className='w-full max-w-6xl mx-auto px-4'>
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-racing font-bold text-foreground mb-4">
                        {filters.search ? `🔍 Search Results for "${filters.search}"` : '🔍 Browse All Internships'}
                    </h2>
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-muted-foreground">
                            {filters.search ? 
                              `Found ${displayItems?.length || 0} internships matching "${filters.search}"` :
                              `Found ${displayItems?.length || 0} internships`
                            }
                        </p>
                        <Button 
                            onClick={() => {
                                const presetFilters = SmartFilterService.getPresetFilters('high-paying');
                                const smartFilters = { ...filters, ...presetFilters };
                                setFilters(smartFilters);
                                toast({
                                    title: "Smart Filters Applied!",
                                    description: "Showing high-quality internships with ₹15,000+ stipend",
                                });
                            }}
                            size="sm"
                            className="bg-primary/20 hover:bg-primary/30 text-primary border-primary/30"
                            variant="outline"
                        >
                            <Filter className="w-4 h-4 mr-1" />
                            Show Best Matches
                        </Button>
                    </div>
                    
                    <div className="bg-background/95 backdrop-blur-sm rounded-lg p-4 mb-6">
                      <InternshipFilters
                        filters={filters}
                        onFiltersChange={setFilters}
                        sectors={sectors}
                        locations={locations}
                        userProfile={profileData}
                      />
                    </div>
                </div>

                {displayItems.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 internship-cards-container">
                            {currentItems.map((item, index) => (
                                <LazyComponent 
                                    key={item.internship.id}
                                    fallback={<SkeletonCard />}
                                    rootMargin="200px"
                                >
                                    <InternshipCard 
                                        internship={item.internship}
                                        matchExplanation={item.explanation}
                                        aiTags={item.aiTags}
                                        userProfile={profileData}
                                        aiScore={item.score}
                                        onNext={() => handlePageChange(currentPage + 1)}
                                        onPrev={() => handlePageChange(currentPage - 1)}
                                        currentIndex={startIndex + index + 1}
                                        totalCount={displayItems.length}
                                    />
                                </LazyComponent>
                            ))}
                        </div>
                        
                        {displayItems.length > itemsPerPage && (
                            <div className="text-center mb-8">
                                <Button 
                                    onClick={() => {
                                        setShowAllRecommendations(!showAllRecommendations);
                                        setCurrentPage(1);
                                    }}
                                    variant="outline"
                                    className="rounded-full"
                                >
                                    {shouldShowAll ? 'Show Paginated' : `View All ${displayItems.length} Results`}
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <div className="mb-6">
                            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">Processing your profile...</h3>
                            <p className="text-muted-foreground mb-2">Analyzing your preferences and finding matches</p>
                            <p className="text-xs text-muted-foreground/70">Powered by Team HexaCoders</p>
                        </div>
                        <Button 
                            onClick={() => setFilters({
                                search: '',
                                sector: 'all',
                                location: 'all',
                                workMode: 'all',
                                education: 'all',
                                minStipend: 'all',
                                sortBy: 'ai-recommended'
                            })}
                            className="mt-4"
                            variant="outline"
                        >
                            Clear Filters
                        </Button>
                    </div>
                )}
                        
                {totalPages > 1 && !shouldShowAll && (
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

      <LazyComponent 
        fallback={<div className="h-32 bg-muted/10 animate-pulse" />}
        rootMargin="300px"
      >
        <Suspense fallback={<div className="h-32 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
          <Stats />
        </Suspense>
      </LazyComponent>
      <LazyComponent 
        fallback={<div className="h-32 bg-muted/10 animate-pulse" />}
        rootMargin="300px"
      >
        <Suspense fallback={<div className="h-32 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
          <Testimonials />
        </Suspense>
      </LazyComponent>
      <HomeFAQ />
      <PartnerCompanies />
      <ComparisonButton userProfile={profileData} />
      </div>
    </>
  );
};

export default Index;