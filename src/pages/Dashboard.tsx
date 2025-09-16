import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InternshipCard } from '@/components/InternshipCard';
import { FeedbackModal } from '@/components/FeedbackModal';
import { User, Target, FileText, MessageSquare } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

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

// Sample data
const sampleInternships = [
  {
    role: 'Frontend Developer Intern',
    company: 'TechCorp',
    location: 'Mumbai, Remote',
    eligibility: 'BTech/BCA, React knowledge',
    featured: true
  },
  {
    role: 'Data Science Intern',
    company: 'DataViz Solutions',
    location: 'Bangalore',
    eligibility: 'BTech/MSc, Python, ML basics'
  },
  {
    role: 'UI/UX Design Intern',
    company: 'DesignHub',
    location: 'Delhi, Hybrid',
    eligibility: 'Any degree, Figma/Adobe XD'
  },
  {
    role: 'Backend Developer Intern',
    company: 'CloudTech',
    location: 'Pune, Remote',
    eligibility: 'BTech/BCA, Node.js/Java'
  }
];

const userProfile = {
  name: 'Priya Sharma',
  studentId: 'ST2024001',
  email: 'priya.sharma@email.com',
  phone: '+91 98765 43210'
};

export default function Dashboard() {
  const { language } = useTheme();
  const t = translations[language];
  const [activeSection, setActiveSection] = useState('recommendations');
  const [showFeedback, setShowFeedback] = useState(false);

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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sampleInternships.map((internship, index) => (
                <InternshipCard
                  key={index}
                  {...internship}
                  onApply={() => console.log(`Applied for ${internship.role}`)}
                />
              ))}
            </div>
            
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