import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, MapPin, DollarSign, Calendar, Users, Briefcase, ArrowLeft, AlertCircle } from 'lucide-react';
import { InternshipCard } from '@/components/InternshipCard';
import { useAuth } from '@/contexts/AuthContext';
import { FirestoreService } from '@/services/firestoreService';
import type { ProfileData } from '@/types';

interface CompanyInternship {
  id: number;
  title: string;
  company: string;
  location: string;
  stipend: string;
  duration: string;
  required_skills: string[];
  sector_tags: string[];
  description: string;
  responsibilities: string[];
  perks: string[];
  type: string;
  work_mode: string;
  openings: number;
  apply_link: string;
  posted_date: string;
  application_deadline: string;
}

const CompanyPage = () => {
  const { company } = useParams<{ company: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [internships, setInternships] = useState<CompanyInternship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<ProfileData | null>(null);
  const [scoredInternships, setScoredInternships] = useState<any[]>([]);
  
  const decodedCompany = decodeURIComponent(company || '');
  const displayCompany = decodedCompany.charAt(0).toUpperCase() + decodedCompany.slice(1);

  useEffect(() => {
    if (company) {
      loadCompanyData(company);
    }
  }, [company]);

  useEffect(() => {
    // Load user profile from localStorage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.warn('Failed to parse saved profile:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Calculate AI scores when profile and internships are loaded
    if (userProfile && internships.length > 0) {
      const scored = internships.map(internship => {
        const aiScore = calculateAIScore(userProfile, internship);
        return {
          internship,
          score: aiScore.score,
          explanation: aiScore.explanation,
          aiTags: aiScore.score >= 75 ? ['AI Recommended'] : []
        };
      }).sort((a, b) => b.score - a.score);
      setScoredInternships(scored);
    } else {
      setScoredInternships(internships.map(internship => ({
        internship,
        score: 0,
        explanation: '',
        aiTags: []
      })));
    }
  }, [userProfile, internships]);

  const calculateAIScore = (profile: ProfileData, internship: CompanyInternship) => {
    const parseStipend = (stipend: string) => {
      const match = stipend.match(/₹([\d,]+)/);
      return match ? parseInt(match[1].replace(/,/g, '')) : 0;
    };
    
    const internshipStipend = parseStipend(internship.stipend || '₹0');
    const required = internship.required_skills || [];
    const userSkills = profile.skills || [];
    
    // Skills matching
    const matched_skills = required.filter((s: string) => 
      userSkills.some((userSkill: string) => 
        userSkill.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(userSkill.toLowerCase())
      )
    );
    
    let score = 0;
    
    // Skills score (40 points)
    if (required.length > 0) {
      score += (matched_skills.length / required.length) * 40;
    } else {
      score += 20;
    }
    
    // Stipend score (25 points)
    if (internshipStipend >= 20000) score += 25;
    else if (internshipStipend >= 15000) score += 20;
    else if (internshipStipend >= 10000) score += 15;
    else score += 10;
    
    // Location score (15 points)
    const userLocation = profile.desiredLocation || profile.location;
    const userCity = (typeof userLocation === 'string' ? userLocation : userLocation?.city || '').toLowerCase();
    const internshipCity = internship.location.toLowerCase();
    
    if (internshipCity === 'remote') score += 15;
    else if (internshipCity.includes(userCity) || userCity.includes(internshipCity)) score += 12;
    else score += 5;
    
    // Sector match (10 points)
    const sectorMatch = (internship.sector_tags || []).some(tag => 
      (profile.interests || []).includes(tag)
    );
    if (sectorMatch) score += 10;
    else score += 5;
    
    // Company tier (10 points)
    const tier1 = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple'];
    const tier2 = ['Uber', 'Airbnb', 'Adobe', 'Salesforce', 'PayPal'];
    
    if (tier1.includes(internship.company)) score += 10;
    else if (tier2.includes(internship.company)) score += 8;
    else score += 6;
    
    const finalScore = Math.min(100, Math.max(1, Math.round(score)));
    
    let explanation = '';
    if (matched_skills.length > 0) {
      explanation += `${matched_skills.length}/${required.length} skills match. `;
    }
    if (internshipStipend >= 15000) {
      explanation += `Good stipend. `;
    }
    if (sectorMatch) {
      explanation += `Sector alignment. `;
    }
    
    return {
      score: finalScore,
      explanation: explanation.trim() || 'Good match based on your profile'
    };
  };

  const loadCompanyData = async (companyName: string) => {
    setLoading(true);
    try {
      const response = await fetch('/internships.json');
      const allInternships = await response.json();
      
      const decodedCompany = decodeURIComponent(companyName).toLowerCase();
      
      // Normalize the search term - handle URL encoding and spaces properly
      let normalizedCompany = decodedCompany.toLowerCase().trim();
      normalizedCompany = normalizedCompany.replace(/%20/g, ' ').replace(/\+/g, ' ').replace(/\s+/g, ' ').trim();
      
      // Filter internships for this company - only match in company field
      const companyInternships = allInternships.filter((internship: CompanyInternship) => {
        const company = (internship.company || '').toLowerCase().trim();
        
        // Try multiple matching strategies
        const exactMatch = company === normalizedCompany;
        const containsMatch = company.includes(normalizedCompany) || 
                             normalizedCompany.includes(company);
        const wordMatch = normalizedCompany.split(' ').some(word => 
          word.length > 2 && company.includes(word)
        );
        
        return exactMatch || containsMatch || wordMatch;
      });

      setInternships(companyInternships);

      if (companyInternships.length > 0) {
        const mainCompany = companyInternships[0];
        setCompanyInfo({
          name: mainCompany.company,
          totalOpenings: companyInternships.reduce((sum, i) => sum + i.openings, 0),
          totalPositions: companyInternships.length,
          sectors: [...new Set(companyInternships.flatMap(i => i.sector_tags))],
          locations: [...new Set(companyInternships.map(i => i.location))],
          stipendRange: {
            min: Math.min(...companyInternships.map(i => parseInt(i.stipend.replace(/[₹,]/g, '')) || 0)),
            max: Math.max(...companyInternships.map(i => parseInt(i.stipend.replace(/[₹,]/g, '')) || 0))
          },
          workModes: [...new Set(companyInternships.map(i => i.work_mode))],
          avgDuration: Math.round(companyInternships.reduce((sum, i) => sum + parseInt(i.duration.split(' ')[0]), 0) / companyInternships.length)
        });
      }
    } catch (error) {
      console.error('Error loading company data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-muted rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!companyInfo || internships.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-4 py-8">
          <Button 
            onClick={() => navigate('/')} 
            variant="outline" 
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">No Openings Found</h1>
            <p className="text-muted-foreground">
              No active internships found for "{decodeURIComponent(company || '')}"
            </p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Browse All Internships
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-6">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="w-full">
              <div className="mb-4">
                <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-1 px-4">
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { path: '/' } }))}
                    className="hover:text-foreground transition-colors font-medium text-left"
                  >
                    Home
                  </button>
                  <span className="mx-1">/</span>
                  <span className="text-foreground font-medium">{companyInfo?.name || decodeURIComponent(company || '')}</span>
                </nav>
              </div>
              <Button 
                onClick={() => navigate('/')} 
                variant="outline" 
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Search
              </Button>
            </div>
          </div>
        </div>

        {/* Company Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-3xl">{companyInfo.name}</CardTitle>
                <p className="text-muted-foreground text-lg">
                  {companyInfo.totalPositions} Position{companyInfo.totalPositions !== 1 ? 's' : ''} • {companyInfo.totalOpenings} Opening{companyInfo.totalOpenings !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Sectors
                </h4>
                <div className="flex flex-wrap gap-1">
                  {companyInfo.sectors.map((sector: string, index: number) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-primary/10 transition-colors"
                      onClick={() => navigate(`/sector/${encodeURIComponent(sector.toLowerCase())}`)}
                    >
                      {sector}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Locations
                </h4>
                <div className="flex flex-wrap gap-1">
                  {companyInfo.locations.map((location: string, index: number) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-primary/10 transition-colors"
                      onClick={() => navigate(`/city/${encodeURIComponent(location.toLowerCase())}`)}
                    >
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Stipend Range
                </h4>
                <p className="text-lg font-bold text-green-600">
                  ₹{companyInfo.stipendRange.min.toLocaleString()} - ₹{companyInfo.stipendRange.max.toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Avg Duration
                </h4>
                <p className="text-lg font-bold text-primary">
                  {companyInfo.avgDuration} months
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Internships Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">
            Available Positions
            {userProfile && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (Sorted by AI Score)
              </span>
            )}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scoredInternships.map((item, index) => (
              <div key={item.internship.id || index} className="animate-in fade-in-50 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                <InternshipCard
                  internship={item.internship}
                  matchExplanation={item.explanation}
                  aiTags={item.aiTags}
                  aiScore={item.score}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyPage;