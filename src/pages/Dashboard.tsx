import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { InternshipCard } from '../components/InternshipCard';
import { FeedbackModal } from '../components/FeedbackModal';
import { User, Target, FileText, MessageSquare } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

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


const score = (profile: any, internship: any) => {
    // Skill score
    const required = internship.required_skills || [];
    let skill_score = 0;
    let matched = 0;
    if (required.length === 0) {
        skill_score = 0.5;
    } else {
        matched = required.filter((s: string) => (profile.skills || []).map((x: string)=>x.toLowerCase()).includes(s.toLowerCase())).length;
        skill_score = matched / required.length;
    }

    // Sector score
    const sector_tags = internship.sector_tags || [];
    const sector_matched = sector_tags.filter((t: any) => (profile.interests || []).includes(t)).length;
    const sector_score = sector_matched / Math.max(sector_tags.length, 1);

    // Education score
    const education_hierarchy: { [key: string]: number } = {
        "Class 12th": 1,
        "Diploma": 2,
        "Undergraduate": 3,
        "Postgraduate": 4
    };
    const profile_edu_level = education_hierarchy[profile.education] || 0;
    const preferred_edu_levels = (internship.preferred_education_levels || []).map((level: string) => education_hierarchy[level] || 0);
    const education_score = preferred_edu_levels.some((pref_level: number) => profile_edu_level >= pref_level) ? 1 : 0;


    // Location score
    let location_score = 0;
    let dist = 0;
    if (profile.location && internship.location) {
        dist = haversine(profile.location, internship.location);
        if (internship.location.city === "Remote") {
             location_score = 1;
        } else {
            location_score = dist <= profile.search_radius_km ? 1 : Math.max(0, 1 - ((dist - profile.search_radius_km) / 500));
        }
    }

    const total = (skill_score * 0.6 +
             sector_score * 0.15 +
             education_score * 0.1 +
             location_score * 0.15);

    // Explanation
    const dist_str = dist ? `${dist.toFixed(2)} km` : "N/A";
    const explain = `Matched skills: ${matched}/${required.length}; Near: ${dist_str}; Sector match: ${sector_matched}/${sector_tags.length}`;


    return { score: Math.round(total * 100), explain };
}

const recommendInternships = (profile: any, allInternships: any[]) => {
    if (!profile) return [];
    const scores = allInternships.map(internship => {
        const {score: s, explain} = score(profile, internship);
        return { internship, score: s, explain };
    });

    return scores.sort((a, b) => b.score - a.score).slice(0, 5);
}


const userProfile = {
  name: 'Vansham Nigga',
  studentId: '25104096',
  email: 'priya.sharma@email.com',
  phone: '+91 98765 43210'
};

export default function Dashboard() {
  const { language } = useTheme();
  const t = translations[language];
  const [activeSection, setActiveSection] = useState('recommendations');
  const [showFeedback, setShowFeedback] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [userProfileData, setUserProfileData] = useState<any>(null);
  const [allInternships, setAllInternships] = useState<any[]>([]);

  useEffect(() => {
    fetch('/internships.json')
      .then(response => response.json())
      .then(data => setAllInternships(data))
      .catch(error => console.error("Failed to load internships:", error));

    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        // Add location data for demonstration. In a real app, you'd get this from the user.
        profile.location = { "city": "Chandigarh", "lat": 30.7333, "lng": 76.7794 };
        profile.search_radius_km = 500;
        setUserProfileData(profile);
    }
  }, []);

  useEffect(() => {
    if(userProfileData && allInternships.length > 0) {
        const recs = recommendInternships(userProfileData, allInternships);
        setRecommendations(recs);
    }
  }, [userProfileData, allInternships]);

  const sidebarItems = [
    { id: 'profile', label: t.profile, icon: User },
    { id: 'recommendations', label: t.recommendations, icon: Target },
    { id: 'applications', label: t.applications, icon: FileText },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  {t.profile}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-foreground font-medium">{userProfile.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t.studentId}</label>
                    <p className="text-foreground font-medium">{userProfile.studentId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t.email}</label>
                    <p className="text-foreground font-medium">{userProfile.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t.phone}</label>
                    <p className="text-foreground font-medium">{userProfile.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'recommendations':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-poppins font-bold text-foreground">
                {t.recommendations}
              </h2>
              <Button
                variant="outline"
                onClick={() => setShowFeedback(true)}
                className="flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                {t.feedback}
              </Button>
            </div>
            
            {recommendations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recommendations.map((rec, index) => (
                        <InternshipCard
                            key={index}
                            internship={rec.internship}
                        />
                    ))}
                </div>
            ) : (
                <Card className="glass-card">
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">
                            Please complete your profile to get internship recommendations.
                        </p>
                    </CardContent>
                </Card>
            )}
            
            <div className="text-center">
              <Button variant="outline" size="lg">
                {t.viewAll}
              </Button>
            </div>
          </div>
        );

      case 'applications':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-poppins font-bold text-foreground">
              {t.applications}
            </h2>
            
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
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="glass-card sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg font-poppins">
                  {t.dashboard}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t.welcome}, {userProfile.name}
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {sidebarItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection(item.id)}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
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

