import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { Loader2, Filter, RefreshCw } from 'lucide-react';
import { Hero } from '@/components/Hero';
import { ProfileForm, ProfileData } from '@/components/ProfileForm';
import { InternshipFilters } from '@/components/InternshipFilters';
import { useInternshipFilters } from '@/hooks/useInternshipFilters';
import { InternshipCard } from '@/components/InternshipCard';
import { SuccessStoriesMarquee } from '@/components/SuccessStoriesMarquee';
import MagicBento from '@/components/MagicBento';
import { LazyComponent } from '@/components/LazyComponent';
import { SkeletonGrid, SkeletonCard } from '@/components/SkeletonLoaders';
import { InternshipListSkeleton, PageLoadingSpinner } from '@/components/LoadingStates';
import { VirtualList } from '@/components/VirtualList';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { Slider } from '@/components/ui/slider';
import { ComparisonButton } from '@/components/ComparisonButton';


// Lazy load heavy components
const Stats = lazy(() => import('@/components/Stats').then(module => ({ default: module.Stats })));
const Testimonials = lazy(() => import('@/components/Testimonials').then(module => ({ default: module.Testimonials })));
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowUpDown, ChevronLeft, ChevronRight, Calendar, Briefcase, GraduationCap, Users, Building } from 'lucide-react';

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
      // Parse internship stipend
      const parseStipend = (stipend: string) => {
          const match = stipend.match(/₹([\d,]+)/);
          return match ? parseInt(match[1].replace(/,/g, '')) : 0;
      };
      
      const internshipStipend = parseStipend(internship.stipend || '₹0');
      
      // Sector matching (preferred but not mandatory)
      const sector_tags = internship.sector_tags || [];
      const sector_matched = sector_tags.filter((t: any) => (profile.interests || []).includes(t));
      
      // Strict stipend filtering - if user sets minimum, don't show below that
      if (profile.minStipend && profile.minStipend > 0 && internshipStipend < profile.minStipend) {
          return { score: 0, explanation: 'Stipend below your minimum requirement', aiTags: [] };
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
      
      // Advanced Skills Compatibility Analysis with Semantic Matching
      const normalizeSkill = (skill: string) => {
          const normalized = skill.toLowerCase().trim();
          // Intelligent skill normalization and clustering
          if (normalized.includes('html')) return 'html';
          if (normalized.includes('css')) return 'css';
          if (normalized.includes('javascript') || normalized === 'js') return 'javascript';
          if (normalized.includes('react')) return 'react';
          if (normalized.includes('node')) return 'nodejs';
          if (normalized.includes('python')) return 'python';
          if (normalized.includes('java') && !normalized.includes('script')) return 'java';
          if (normalized.includes('machine learning') || normalized.includes('ml')) return 'machine-learning';
          if (normalized.includes('data science') || normalized.includes('analytics')) return 'data-science';
          return normalized;
      };
      
      const required = internship.required_skills || [];
      const matched_skills = required.filter((s: string) => 
          (profile.skills || []).some((userSkill: string) => 
              normalizeSkill(userSkill) === normalizeSkill(s)
          )
      );
      
      // Filter out internships with no matching skills if user has skills
      if (required.length > 0 && matched_skills.length === 0 && (profile.skills || []).length > 0) {
          return { score: 0, explanation: 'No matching skills', aiTags: [] };
      }
      
      // Enhanced skill scoring with partial match bonuses
      let skill_score = required.length > 0 ? matched_skills.length / required.length : 0.75;
      
      // Bonus for skill diversity and depth
      if (matched_skills.length > 2) skill_score += 0.1;
      if (matched_skills.length === required.length) skill_score += 0.15;
      
      // Location scoring - SECOND PRIORITY
      let location_score = 0.5;
      let location_reason = '';
      
      if (profile.desiredLocation || profile.location) {
          const userLocation = profile.desiredLocation || profile.location;
          const userCity = (typeof userLocation === 'string' ? userLocation : userLocation.city || '').toLowerCase();
          const internshipCity = (typeof internship.location === 'string' ? internship.location : internship.location?.city || '').toLowerCase();
          
          if (internshipCity === 'remote') {
              location_score = 1;
              location_reason = 'Remote work available';
          } else if (internshipCity === userCity) {
              location_score = 1;
              location_reason = 'Same city match';
          } else if (userCity) {
              const cityProximity: { [key: string]: { nearby: string[], regional: string[] } } = {
                  'delhi': { 
                      nearby: ['gurgaon', 'noida', 'faridabad', 'ghaziabad', 'new delhi'],
                      regional: ['chandigarh', 'jaipur', 'agra', 'lucknow']
                  },
                  'mumbai': { 
                      nearby: ['pune', 'navi mumbai', 'thane', 'nashik'],
                      regional: ['ahmedabad', 'surat', 'nagpur', 'aurangabad']
                  },
                  'bangalore': { 
                      nearby: ['bengaluru', 'mysore', 'mangalore'],
                      regional: ['chennai', 'hyderabad', 'coimbatore', 'kochi']
                  },
                  'bengaluru': { 
                      nearby: ['bangalore', 'mysore', 'mangalore'],
                      regional: ['chennai', 'hyderabad', 'coimbatore', 'kochi']
                  },
                  'hyderabad': { 
                      nearby: ['secunderabad', 'warangal'],
                      regional: ['bangalore', 'chennai', 'vijayawada', 'visakhapatnam']
                  },
                  'chennai': { 
                      nearby: ['coimbatore', 'madurai', 'salem'],
                      regional: ['bangalore', 'hyderabad', 'kochi', 'trichy']
                  },
                  'pune': { 
                      nearby: ['mumbai', 'navi mumbai', 'nashik'],
                      regional: ['ahmedabad', 'surat', 'nagpur']
                  },
                  'kolkata': {
                      nearby: ['howrah', 'durgapur'],
                      regional: ['bhubaneswar', 'guwahati', 'patna']
                  },
                  'ahmedabad': {
                      nearby: ['surat', 'vadodara', 'rajkot'],
                      regional: ['mumbai', 'pune', 'indore', 'jaipur']
                  }
              };
              
              const proximity = cityProximity[userCity];
              if (proximity) {
                  if (proximity.nearby.includes(internshipCity)) {
                      location_score = 0.85;
                      location_reason = 'Nearby city';
                  } else if (proximity.regional.includes(internshipCity)) {
                      location_score = 0.65;
                      location_reason = 'Same region';
                  } else {
                      location_score = 0.4;
                      location_reason = 'Different region';
                  }
              } else {
                  location_score = 0.5;
                  location_reason = 'Location match';
              }
          }
      }
      
      // Sector score
      const sector_score = sector_matched.length > 0 ? 1 : 0.6;
      
      // Stipend score - THIRD PRIORITY (enhanced for high-paying internships)
      // Prioritize high-value internships (16k-18k+) for hackathon presentation
      let stipend_score;
      if (internshipStipend >= 18000) {
          stipend_score = 1.0; // Premium tier (18k+)
      } else if (internshipStipend >= 16000) {
          stipend_score = 0.9; // High-value tier (16k-18k)
      } else if (profile.minStipend) {
          stipend_score = Math.min(0.8, internshipStipend / (profile.minStipend * 1.2));
      } else {
          stipend_score = Math.min(0.7, internshipStipend / 15000); // Adjusted benchmark
      }
      
      // Industry Leadership & Innovation Index (Enhanced for high-value companies)
      const tier1Companies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Amazon Web Services (AWS)', 'Morgan Stanley'];
      const tier2Companies = ['Uber', 'Airbnb', 'Tesla', 'Spotify', 'Adobe', 'Salesforce', 'PayPal', 'Flipkart', 'Swiggy', 'Myntra', 'Deloitte', 'PwC', 'KPMG'];
      const tier3Companies = ['Paytm', 'Zomato', 'BYJU\'S', 'Ola', 'Infosys', 'TCS', 'Wipro', 'Cognizant', 'HUL', 'P&G', 'Reliance', 'Tata Motors', 'HDFC Bank', 'ICICI Bank'];
      
      let company_bonus = 0;
      // Enhanced bonuses for high-value companies
      if (tier1Companies.includes(internship.company)) company_bonus = 0.12; // Increased from 0.08
      else if (tier2Companies.includes(internship.company)) company_bonus = 0.08; // Increased from 0.06
      else if (tier3Companies.includes(internship.company)) company_bonus = 0.05; // Increased from 0.04
      
      // Additional bonus for high-stipend companies regardless of tier
      if (internshipStipend >= 20000) company_bonus += 0.05;
      
      // ADVANCED AI SCORING ALGORITHM - Skills First, High Stipend Priority
      const base_score = 0.15;
      const skill_weight = 0.50; // Skills compatibility (50%) - Most important
      
      // Dynamic stipend weight based on amount
      let stipend_weight;
      if (internshipStipend >= 12000) {
          stipend_weight = 0.30; // Higher weight for 12k+ stipends
      } else {
          stipend_weight = 0.20; // Lower weight for sub-12k stipends
      }
      
      const location_weight = 0.15; // Reduced location weight
      const sector_weight = 0.08;
      const education_weight = 0.02;
      
      const weighted_score = base_score + 
                           (skill_score * skill_weight) +
                           (stipend_score * stipend_weight) +
                           (location_score * location_weight) +
                           (sector_score * sector_weight) +
                           ((education_match ? 1 : 0) * education_weight) +
                           company_bonus;
      
      const total = Math.min(1, weighted_score); // Cap at 100%
      
      // Generate explanation
      let explanation = '';
      if (matched_skills.length > 0) {
          explanation += `Matches ${matched_skills.length}/${required.length} required skills. `;
      }
      if (sector_matched.length > 0) {
          explanation += `Aligns with ${sector_matched.join(', ')} sector. `;
      }
      if (location_score >= 0.8) {
          explanation += `${location_reason}. `;
      }
      if (internshipStipend >= (profile.minStipend || 0)) {
          explanation += `Good stipend (₹${internshipStipend.toLocaleString()}). `;
      }
      
      const finalScore = Math.round(total * 100);
      

      
      return { 
          score: finalScore,
          explanation: explanation.trim() || 'Good match based on your profile',
          aiTags: []
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
          .filter(item => item.score > 0) // Only show internships with matching skills
          .sort((a, b) => b.score - a.score);
      
      // Add AI Recommended tag to top 3 matches only
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
  const [minAiScore, setMinAiScore] = useState([60]);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [useVirtualScrolling, setUseVirtualScrolling] = useState(false);
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
      .catch(() => console.warn('Failed to load internships data'));
  }, []);

  // Use the filtering hook
  const { filters, setFilters, filteredInternships, filterRecommendations, sectors, locations } = useInternshipFilters(allInternships);

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
        console.warn('Failed to load internships data');
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
  const displayItems = useMemo(() => {
    if (profileData && filterRecommendations) {
      const filtered = filterRecommendations(recommendations);
      return filtered; // Show all recommendations without threshold
    }
    return (filteredInternships || []).map(internship => ({ internship, score: 0, explanation: '', aiTags: [] }));
  }, [profileData, filterRecommendations, recommendations, filteredInternships]);

  const totalPages = Math.ceil((displayItems?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = showAllRecommendations ? (displayItems || []) : (displayItems || []).slice(startIndex, endIndex);
  
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
    return <PageLoadingSpinner />;
  }
  
  return (
    <div className="min-h-screen hero-gradient">
      <Hero onGetStartedClick={handleGetStartedClick} />
      <SuccessStoriesMarquee />
      
      {/* PM Internship Eligibility Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
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
              textAutoHide={true}
              enableStars={true}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={true}
              enableMagnetism={true}
              clickEffect={true}
              spotlightRadius={300}
              particleCount={12}
              glowColor="132, 0, 255"
              className="border-2 hover:shadow-lg transition-all duration-300"
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
              textAutoHide={true}
              enableStars={true}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={true}
              enableMagnetism={true}
              clickEffect={true}
              spotlightRadius={300}
              particleCount={12}
              glowColor="132, 0, 255"
              className="border-2 hover:shadow-lg transition-all duration-300"
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
              textAutoHide={true}
              enableStars={true}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={true}
              enableMagnetism={true}
              clickEffect={true}
              spotlightRadius={300}
              particleCount={12}
              glowColor="132, 0, 255"
              className="border-2 hover:shadow-lg transition-all duration-300"
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
              textAutoHide={true}
              enableStars={true}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={true}
              enableMagnetism={true}
              clickEffect={true}
              spotlightRadius={300}
              particleCount={12}
              glowColor="132, 0, 255"
              className="border-2 hover:shadow-lg transition-all duration-300 md:col-span-2 lg:col-span-1"
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
              textAutoHide={true}
              enableStars={true}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={true}
              enableMagnetism={true}
              clickEffect={true}
              spotlightRadius={300}
              particleCount={12}
              glowColor="132, 0, 255"
              className="border-2 hover:shadow-lg transition-all duration-300 md:col-span-2"
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
            <h3 className="text-2xl font-bold text-center text-foreground mb-8">Core Benefits for PM Internship Scheme</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <MagicBento 
                enableSpotlight={true}
                enableBorderGlow={true}
                spotlightRadius={200}
                glowColor="34, 197, 94"
                className="p-4 border border-border rounded-lg"
              >
                <h4 className="font-semibold text-foreground mb-2">12 months real-life experience</h4>
                <p className="text-muted-foreground text-sm">in India's top companies</p>
              </MagicBento>
              <MagicBento 
                enableSpotlight={true}
                enableBorderGlow={true}
                spotlightRadius={200}
                glowColor="59, 130, 246"
                className="p-4 border border-border rounded-lg"
              >
                <h4 className="font-semibold text-foreground mb-2">Monthly assistance</h4>
                <p className="text-muted-foreground text-sm">₹4500 by Government of India and ₹500 by Industry</p>
              </MagicBento>
              <MagicBento 
                enableSpotlight={true}
                enableBorderGlow={true}
                spotlightRadius={200}
                glowColor="168, 85, 247"
                className="p-4 border border-border rounded-lg"
              >
                <h4 className="font-semibold text-foreground mb-2">One-time Grant</h4>
                <p className="text-muted-foreground text-sm">₹6000 for incidentals</p>
              </MagicBento>
              <MagicBento 
                enableSpotlight={true}
                enableBorderGlow={true}
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
          <div className="max-w-2xl mx-auto">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Processing your profile...</h3>
                <p className="text-muted-foreground mb-2">Analyzing your preferences and finding matches</p>
                <p className="text-xs text-muted-foreground/70">Powered by Team HexaCoders</p>
              </div>
            ) : (
              <ProfileForm onProfileSubmit={handleProfileSubmit} />
            )}
          </div>
        </div>
      )}

      {profileData && (
        <section id="recommendations-section" className="bg-card py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
            <div className='max-w-6xl mx-auto'>
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-racing font-bold text-foreground mb-4">
                        🎯 AI Recommendations
                    </h2>
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-muted-foreground">
                            Found {displayItems?.length || 0} matching internships
                        </p>

                    </div>
                    <div className="bg-primary/10 rounded-lg p-4 mb-6">
                        <p className="text-sm text-primary font-medium">
                            📊 Personalized matches based on your profile
                        </p>
                    </div>
                    
                    {/* Filters */}
                    <InternshipFilters
                      filters={filters}
                      onFiltersChange={setFilters}
                      sectors={sectors}
                      locations={locations}
                      userProfile={profileData}
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
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                        
                        {/* Pagination */}
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
        <section className="bg-card py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
            <div className='max-w-6xl mx-auto'>
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-racing font-bold text-foreground mb-4">
                        🔍 Browse All Internships
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        Found {displayItems?.length || 0} internships
                    </p>
                    
                    {/* Filters */}
                    <InternshipFilters
                      filters={filters}
                      onFiltersChange={setFilters}
                      sectors={sectors}
                      locations={locations}
                      userProfile={profileData}
                    />
                </div>

                {displayItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                                    onNext={() => handlePageChange(currentPage + 1)}
                                    onPrev={() => handlePageChange(currentPage - 1)}
                                    currentIndex={startIndex + index + 1}
                                    totalCount={displayItems.length}
                                />
                            </LazyComponent>
                        ))}
                    </div>
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
      <ComparisonButton userProfile={profileData} />
    </div>
  );
};

export default Index;
