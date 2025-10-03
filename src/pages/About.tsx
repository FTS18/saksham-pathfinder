import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Target, Lightbulb, Users, User, Brain, Briefcase, Heart, CheckCircle, Code, BarChart3, MessageSquare, Filter, Globe, Shield, Zap, Check, X, Play, Mail, Phone, MapPin, BookOpen, ExternalLink, FileText, Cpu, Database, Cloud } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';

interface TOCItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

const TOCItem = ({ href, icon: Icon, children }: TOCItemProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRead, setIsRead] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) {
          setIsRead(true);
        }
      },
      { threshold: 0.5, rootMargin: '-100px 0px -50% 0px' }
    );

    const element = document.querySelector(href);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [href]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`flex items-center gap-2 text-sm py-2 px-2 rounded transition-all duration-200 ${
        isVisible
          ? 'text-primary bg-primary/10 border-l-2 border-primary'
          : isRead
          ? 'text-foreground hover:text-primary'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <div className={`w-1 h-1 rounded-full ${
        isRead ? 'bg-primary' : 'bg-muted-foreground'
      }`} />
      <Icon className="w-3 h-3 flex-shrink-0" />
      <span className="truncate">{children}</span>
    </a>
  );
};

const About = () => {
  const [showTOC, setShowTOC] = useState(true);



  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Breadcrumbs />
        </div>
        <div id="about-content" className="relative pb-16">
          <div className="w-full">
            <div className="bg-gradient-to-br from-accent/30 via-primary/20 to-accent/30 rounded-3xl p-8 mb-16 backdrop-blur-md border border-accent/50 shadow-2xl">
              <div className="text-center max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans font-black italic bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent mb-6 animate-fade-in-up">
                  Saksham AI
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl text-foreground/90 mb-8 leading-relaxed font-medium italic animate-fade-in-up animation-delay-200">
                  AI-Based Smart Allocation Engine for PM Internship Scheme
                </p>
                <div className="bg-background/90 rounded-2xl p-6 backdrop-blur-sm border border-accent/30 shadow-lg animate-fade-in-up animation-delay-400">
                  <p className="text-accent font-bold text-base md:text-lg mb-2 font-sans">
                    Team HexaForces • PEC Chandigarh • Problem Statement #25033
                  </p>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Ministry of Corporate Affairs (MoCA) • Software Category
                  </p>
                </div>
              </div>
            </div>

            <Card id="problem-statement" className="glass-card mb-16">
              <CardHeader>
                <CardTitle className="text-2xl font-sans font-bold italic">
                  Problem Statement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Background</h3>
                  <p className="text-muted-foreground">
                    The PM Internship Scheme receives applications from youth across India, including rural areas, 
                    tribal districts, urban slums, and remote colleges. Many candidates are first-generation learners 
                    with limited digital exposure and no prior internship experience. With hundreds of internships 
                    listed, it becomes difficult for such candidates to identify relevant opportunities.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Problem Description</h3>
                  <p className="text-muted-foreground">
                    The problem envisages a smart, automated system that uses AI/ML algorithms to match candidates 
                    with internship opportunities based on skills, qualifications, location preferences, and sector interests. 
                    The system should also account for affirmative action (e.g., representation from rural/aspirational districts, 
                    different social categories), past participation, and internship capacity of industries.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Our Solution</h3>
                  <p className="text-muted-foreground">
                    Saksham AI builds a lightweight recommendation engine that suggests 3-5 most relevant internships 
                    based on candidate profile, academic background, interests, and location. The system is mobile-compatible, 
                    user-friendly for low digital literacy users, and integrates seamlessly with existing portals.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card id="why-project" className="glass-card mb-16">
              <CardHeader>
                <CardTitle className="text-2xl font-sans font-bold">
                  Why We Chose This Project
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      Social Impact
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Directly helps rural youth, tribal students, and first-generation learners access opportunities 
                      that can transform their lives and communities.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-blue-500" />
                      Technical Challenge
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Building AI that works for users with low digital literacy requires innovative UX design 
                      and lightweight ML algorithms.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-500" />
                      Real Problem
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Unlike theoretical problems, this addresses a genuine need affecting millions of Indian youth 
                      seeking their first professional experience.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      Scalable Solution
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Our lightweight approach can handle thousands of users without expensive infrastructure, 
                      making it government-deployment ready.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card id="ai-special" className="glass-card mb-12">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  What Makes Our AI Special
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-6 h-6 text-blue-500" />
                    </div>
                    <h3 className="font-semibold mb-2">Hybrid Intelligence</h3>
                    <p className="text-sm text-muted-foreground">
                      Combines rule-based filtering with vector similarity matching for precise, explainable recommendations
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-6 h-6 text-green-500" />
                    </div>
                    <h3 className="font-semibold mb-2">Accessibility First</h3>
                    <p className="text-sm text-muted-foreground">
                      Audio descriptions, simple UI, and regional language support for users with low digital literacy
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-6 h-6 text-purple-500" />
                    </div>
                    <h3 className="font-semibold mb-2">Lightweight & Fast</h3>
                    <p className="text-sm text-muted-foreground">
                      No heavy ML models - works on basic smartphones with slow internet connections
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card id="team" className="glass-card mb-12">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                  Meet Team HexaForces
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { name: "Ananay Dubey", id: "25111004", email: "dubeyananay@gmail.com", phone: "7719767324", branch: "VLSI", role: "Full Stack Developer" },
                    { name: "Aditya Pandey", id: "25104003", email: "adityap97531@gmail.com", phone: "9315711569", branch: "EE", role: "Backend Developer" },
                    { name: "Vansham Bhatia", id: "25034096", email: "vanshamb20@gmail.com", phone: "8595881011", branch: "EE", role: "Frontend Developer" },
                    { name: "Aniket Dixit", id: "25104008", email: "dixit.aniket2006@gmail.com", phone: "9990010375", branch: "EE", role: "Frontend Developer" },
                    { name: "Bhavya Thakur", id: "25404009", email: "bhavya.bvy7@gmail.com", phone: "8360493057", branch: "BDES", role: "Marketing & Presentation" },
                    { name: "Riya Raheja", id: "25106044", email: "rr.raheja85818@gmail.com", phone: "9115937533", branch: "DS", role: "ML Engineer" }
                  ].map((member, index) => (
                    <Card key={index} className="border border-border/50 hover:border-primary/50 transition-colors">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-primary" />
                          </div>
                          <h3 className="font-bold text-lg mb-1">
                            {member.name === 'Ananay Dubey' ? (
                              <a href="https://ananay.netlify.app" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                {member.name}
                              </a>
                            ) : member.name}
                          </h3>
                          <p className="text-primary font-medium text-sm mb-2">{member.role}</p>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p><strong>ID:</strong> {member.id}</p>
                            <p><strong>Branch:</strong> {member.branch}</p>
                            <p><strong>Email:</strong> <a href={`mailto:${member.email}`} className="hover:text-primary transition-colors">{member.email}</a></p>
                            <p><strong>Phone:</strong> <a href={`tel:${member.phone}`} className="hover:text-primary transition-colors">{member.phone}</a></p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div id="mission-vision" className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Our Mission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    To bridge the gap between talented students and meaningful internship opportunities 
                    by leveraging artificial intelligence to create personalized matches based on skills, 
                    interests, and career aspirations.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    Our Vision
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    To become the leading platform for internship discovery in India, making career 
                    opportunities accessible to every student regardless of their background or location.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card id="tech-stack" className="glass-card mb-12">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-primary" />
                  Technology Stack
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: "React", category: "Frontend", bgColor: "rgba(97, 218, 251, 0.1)", textColor: "#61DAFB", borderColor: "rgba(97, 218, 251, 0.3)" },
                    { name: "TypeScript", category: "Language", bgColor: "rgba(49, 120, 198, 0.1)", textColor: "#3178C6", borderColor: "rgba(49, 120, 198, 0.3)" },
                    { name: "Tailwind CSS", category: "Styling", bgColor: "rgba(56, 178, 172, 0.1)", textColor: "#38B2AC", borderColor: "rgba(56, 178, 172, 0.3)" },
                    { name: "Vite", category: "Build Tool", bgColor: "rgba(100, 108, 255, 0.1)", textColor: "#646CFF", borderColor: "rgba(100, 108, 255, 0.3)" },
                    { name: "Firebase", category: "Database", bgColor: "rgba(255, 193, 7, 0.1)", textColor: "#FFC107", borderColor: "rgba(255, 193, 7, 0.3)" },
                    { name: "Gemini API", category: "AI/ML", bgColor: "rgba(66, 133, 244, 0.1)", textColor: "#4285F4", borderColor: "rgba(66, 133, 244, 0.3)" },
                    { name: "Node.js", category: "Runtime", bgColor: "rgba(104, 160, 99, 0.1)", textColor: "#68A063", borderColor: "rgba(104, 160, 99, 0.3)" },
                    { name: "shadcn/ui", category: "UI Components", bgColor: "rgba(0, 0, 0, 0.1)", textColor: "#000000", borderColor: "rgba(0, 0, 0, 0.3)" },
                  { name: "Vector Similarity", category: "Algorithm", bgColor: "rgba(255, 87, 51, 0.1)", textColor: "#FF5733", borderColor: "rgba(255, 87, 51, 0.3)" },
                  { name: "Cosine Similarity", category: "ML Algorithm", bgColor: "rgba(233, 30, 99, 0.1)", textColor: "#E91E63", borderColor: "rgba(233, 30, 99, 0.3)" },
                  { name: "NLP Processing", category: "AI/ML", bgColor: "rgba(255, 152, 0, 0.1)", textColor: "#FF9800", borderColor: "rgba(255, 152, 0, 0.3)" },
                  { name: "Recommendation Engine", category: "ML System", bgColor: "rgba(76, 175, 80, 0.1)", textColor: "#4CAF50", borderColor: "rgba(76, 175, 80, 0.3)" },
                  { name: "Real-time Analytics", category: "Analytics", bgColor: "rgba(0, 150, 136, 0.1)", textColor: "#009688", borderColor: "rgba(0, 150, 136, 0.3)" },
                  { name: "Geolocation API", category: "Location", bgColor: "rgba(139, 195, 74, 0.1)", textColor: "#8BC34A", borderColor: "rgba(139, 195, 74, 0.3)" },
                  { name: "Speech Synthesis", category: "Accessibility", bgColor: "rgba(156, 39, 176, 0.1)", textColor: "#9C27B0", borderColor: "rgba(156, 39, 176, 0.3)" },
                  { name: "Local Storage", category: "Data", bgColor: "rgba(96, 125, 139, 0.1)", textColor: "#607D8B", borderColor: "rgba(96, 125, 139, 0.3)" }
                  ].map((tech, index) => (
                    <div 
                      key={index} 
                      className="text-center p-4 rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      style={{
                        backgroundColor: tech.bgColor,
                        borderColor: tech.borderColor,
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                    >
                      <h4 
                        className="font-semibold text-sm mb-1"
                        style={{ color: tech.textColor }}
                      >
                        {tech.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">{tech.category}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card id="platform-features" className="glass-card mb-12">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-center justify-center">
                  <Heart className="w-6 h-6 text-primary" />
                  Platform Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center p-6 border border-border rounded-lg">
                    <Brain className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">AI-Powered Matching</h3>
                    <p className="text-sm text-muted-foreground">Advanced ML algorithms analyze your profile to suggest the most relevant internships</p>
                  </div>
                  <div className="text-center p-6 border border-border rounded-lg">
                    <Target className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Smart Filtering</h3>
                    <p className="text-sm text-muted-foreground">Filter by location, stipend, work mode, and education level for precise results</p>
                  </div>
                  <div className="text-center p-6 border border-border rounded-lg">
                    <Users className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">User-Friendly Interface</h3>
                    <p className="text-sm text-muted-foreground">Designed for users with varying levels of digital literacy and accessibility needs</p>
                  </div>
                  <div className="text-center p-6 border border-border rounded-lg">
                    <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Wishlist & Bookmarks</h3>
                    <p className="text-sm text-muted-foreground">Save interesting opportunities and get similar recommendations</p>
                  </div>
                  <div className="text-center p-6 border border-border rounded-lg">
                    <Briefcase className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Real-time Updates</h3>
                    <p className="text-sm text-muted-foreground">Get notified about new opportunities matching your profile</p>
                  </div>
                  <div className="text-center p-6 border border-border rounded-lg">
                    <CheckCircle className="w-12 h-12 text-teal-500 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Application Tracking</h3>
                    <p className="text-sm text-muted-foreground">Track your applications and get insights on your internship journey</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card id="current-features" className="glass-card mb-12">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-center justify-center">
                  <Brain className="w-6 h-6 text-primary" />
                  Current Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center p-6 border border-border rounded-lg hover:scale-105 transition-transform">
                    <Brain className="w-8 h-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">AI-Powered Recommendations</h3>
                    <p className="text-sm text-muted-foreground">Smart matching using ML algorithms</p>
                  </div>
                  <div className="text-center p-6 border border-border rounded-lg hover:scale-105 transition-transform">
                    <Target className="w-8 h-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Skill Gap Analysis</h3>
                    <p className="text-sm text-muted-foreground">Identify missing skills for dream roles</p>
                  </div>
                  <div className="text-center p-6 border border-border rounded-lg hover:scale-105 transition-transform">
                    <Users className="w-8 h-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Profile Management</h3>
                    <p className="text-sm text-muted-foreground">Comprehensive student profiles</p>
                  </div>
                  <div className="text-center p-6 border border-border rounded-lg hover:scale-105 transition-transform">
                    <BarChart3 className="w-8 h-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Analytics Dashboard</h3>
                    <p className="text-sm text-muted-foreground">Track applications and feedback</p>
                  </div>
                  <div className="text-center p-6 border border-border rounded-lg hover:scale-105 transition-transform">
                    <Heart className="w-8 h-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Wishlist System</h3>
                    <p className="text-sm text-muted-foreground">Save favorite internships</p>
                  </div>
                  <div className="text-center p-6 border border-border rounded-lg hover:scale-105 transition-transform">
                    <MessageSquare className="w-8 h-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Feedback System</h3>
                    <p className="text-sm text-muted-foreground">Rate and review experiences</p>
                  </div>
                  <div className="text-center p-6 border border-border rounded-lg hover:scale-105 transition-transform">
                    <Filter className="w-8 h-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Advanced Filters</h3>
                    <p className="text-sm text-muted-foreground">Filter by location, salary, skills</p>
                  </div>
                  <div className="text-center p-6 border border-border rounded-lg hover:scale-105 transition-transform">
                    <Globe className="w-8 h-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Multi-language Support</h3>
                    <p className="text-sm text-muted-foreground">English and Hindi interface</p>
                  </div>
                  <div className="text-center p-6 border border-border rounded-lg hover:scale-105 transition-transform">
                    <Shield className="w-8 h-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Secure Authentication</h3>
                    <p className="text-sm text-muted-foreground">Firebase-based user security</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card id="why-choose" className="glass-card mb-12">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                  Why Choose Saksham AI?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-semibold">Features</th>
                        <th className="text-center p-4 font-semibold text-primary">Saksham AI</th>
                        <th className="text-center p-4 font-semibold text-muted-foreground">Traditional Platforms</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-4">AI-Powered Matching</td>
                        <td className="p-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                        <td className="p-4 text-center"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4">Skill Gap Analysis</td>
                        <td className="p-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                        <td className="p-4 text-center"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4">Personalized Recommendations</td>
                        <td className="p-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                        <td className="p-4 text-center"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4">Multi-language Support</td>
                        <td className="p-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                        <td className="p-4 text-center"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="p-4">Student-Centric Design</td>
                        <td className="p-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                        <td className="p-4 text-center"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card id="contact" className="glass-card mb-16">
              <CardHeader>
                <CardTitle className="text-2xl font-sans font-bold text-center">
                  Get in Touch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-8">
                  <p className="text-muted-foreground mb-6">
                    Have questions about Saksham AI or want to collaborate? We'd love to hear from you!
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-6 h-6 text-blue-500" />
                      </div>
                      <h3 className="font-semibold mb-2">Team Email</h3>
                      <a href="mailto:team@sakshamai.com" className="text-primary hover:underline transition-colors">
                        team@sakshamai.com
                      </a>
                    </CardContent>
                  </Card>
                  <Card className="border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-6 h-6 text-green-500" />
                      </div>
                      <h3 className="font-semibold mb-2">Project Lead</h3>
                      <a href="mailto:dubeyananay@gmail.com" className="text-primary hover:underline transition-colors">
                        Ananay Dubey
                      </a>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">+91 7719767324</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-6 h-6 text-purple-500" />
                      </div>
                      <h3 className="font-semibold mb-2">Institution</h3>
                      <p className="text-sm text-muted-foreground">
                        Punjab Engineering College<br/>Chandigarh, India
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card id="research" className="glass-card mb-20">
              <CardHeader>
                <CardTitle className="text-2xl font-sans font-bold text-center italic">
                  Research & References
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-sans font-bold text-center mb-6 italic">Hackathon Learning Resources</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="border border-border/50 hover:border-blue-500/50 transition-all duration-300">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Code className="w-4 h-4 text-blue-500" />
                            Core Technologies
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <a href="https://react.dev/learn" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                              <ExternalLink className="w-3 h-3 group-hover:text-primary" />
                              React 18 Documentation
                            </a>
                            <a href="https://www.typescriptlang.org/docs/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                              <ExternalLink className="w-3 h-3 group-hover:text-primary" />
                              TypeScript Handbook
                            </a>
                            <a href="https://tailwindcss.com/docs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                              <ExternalLink className="w-3 h-3 group-hover:text-primary" />
                              Tailwind CSS Guide
                            </a>
                            <a href="https://firebase.google.com/docs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                              <ExternalLink className="w-3 h-3 group-hover:text-primary" />
                              Firebase Documentation
                            </a>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border border-border/50 hover:border-green-500/50 transition-all duration-300">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Brain className="w-4 h-4 text-green-500" />
                            AI/ML Integration
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <a href="https://platform.openai.com/docs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                              <ExternalLink className="w-3 h-3 group-hover:text-primary" />
                              OpenAI API Documentation
                            </a>
                            <a href="https://cloud.google.com/ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                              <ExternalLink className="w-3 h-3 group-hover:text-primary" />
                              Google Cloud AI Platform
                            </a>
                            <a href="https://developers.google.com/machine-learning/recommendation" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                              <ExternalLink className="w-3 h-3 group-hover:text-primary" />
                              ML Recommendation Systems
                            </a>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-sans font-bold text-center mb-6">Government & Policy</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="border border-border/50 hover:border-purple-500/50 transition-all duration-300">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <FileText className="w-4 h-4 text-purple-500" />
                            PM Internship Scheme
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <a href="https://www.mca.gov.in/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                              <ExternalLink className="w-3 h-3 group-hover:text-primary" />
                              Ministry of Corporate Affairs
                            </a>
                            <a href="https://pminternship.mca.gov.in/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                              <ExternalLink className="w-3 h-3 group-hover:text-primary" />
                              PM Internship Portal
                            </a>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border border-border/50 hover:border-orange-500/50 transition-all duration-300">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Globe className="w-4 h-4 text-orange-500" />
                            Digital India & Education
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <a href="https://digitalindia.gov.in/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                              <ExternalLink className="w-3 h-3 group-hover:text-primary" />
                              Digital India Initiative
                            </a>
                            <a href="https://www.education.gov.in/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                              <ExternalLink className="w-3 h-3 group-hover:text-primary" />
                              Ministry of Education
                            </a>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* TOC Navigation - Commented out */}
          {/*
          <div className="toc-navigation hidden xl:block sticky z-30" style={{ top: '6rem', width: '20rem', maxHeight: 'calc(100vh - 8rem)' }}>
            <div className="glass-card border-primary/30 p-3 shadow-2xl h-full flex flex-col">
              <h3 className="font-bold mb-3 text-sm uppercase tracking-wider text-primary flex items-center gap-2 flex-shrink-0">
                <Play className="w-4 h-4" />
                On This Page
              </h3>
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                <nav className="space-y-1 py-2">
                  <TOCItem href="#problem-statement" icon={Target}>Problem Statement</TOCItem>
                  <TOCItem href="#why-project" icon={Lightbulb}>Why This Project</TOCItem>
                  <TOCItem href="#ai-special" icon={Brain}>What Makes Our AI Special</TOCItem>
                  <TOCItem href="#team" icon={Users}>Meet Team HexaForces</TOCItem>
                  <TOCItem href="#tech-stack" icon={Code}>Technology Stack</TOCItem>
                  <TOCItem href="#mission-vision" icon={Target}>Mission & Vision</TOCItem>
                  <TOCItem href="#platform-features" icon={Heart}>Platform Features</TOCItem>
                  <TOCItem href="#current-features" icon={Brain}>Current Features</TOCItem>
                  <TOCItem href="#why-choose" icon={Target}>Why Choose Us</TOCItem>
                  <TOCItem href="#contact" icon={Users}>Get in Touch</TOCItem>
                  <TOCItem href="#research" icon={Brain}>Research & References</TOCItem>
                </nav>
              </div>
            </div>
          </div>
          */}
        
        </div>
      </div>
    </div>
  );
};

export default About;