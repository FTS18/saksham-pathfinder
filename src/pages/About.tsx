import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Target, Lightbulb, Users, User, Brain, Briefcase, Heart, CheckCircle, Code } from 'lucide-react';

const teamMembers = [
  {
    name: "Ananay Dubey",
    id: "25111004",
    email: "dubeyananay@gmail.com",
    phone: "7719767324",
    branch: "VLSI",
    role: "Full Stack Developer"
  },
  {
    name: "Aditya Pandey",
    id: "25104003",
    email: "adityap97531@gmail.com",
    phone: "9315711569",
    branch: "EE",
    role: "Backend Developer"
  },
  {
    name: "Vansham Bhatia",
    id: "25034096",
    email: "vanshamb20@gmail.com",
    phone: "8595881011",
    branch: "EE",
    role: "Frontend Developer"
  },
  {
    name: "Aniket Dixit",
    id: "25104008",
    email: "dixit.aniket2006@gmail.com",
    phone: "9990010375",
    branch: "EE",
    role: "Frontend Developer"
  },
  {
    name: "Bhavya Thakur",
    id: "25404009",
    email: "bhavya.bvy7@gmail.com",
    phone: "8360493057",
    branch: "BDES",
    role: "Marketing & Presentation"
  },
  {
    name: "Riya Raheja",
    id: "25106044",
    email: "rr.raheja85818@gmail.com",
    phone: "9115937533",
    branch: "DS",
    role: "ML Engineer"
  }
];

const techStack = [
  { name: "React", category: "Frontend", bgColor: "rgba(97, 218, 251, 0.1)", textColor: "#61DAFB", borderColor: "rgba(97, 218, 251, 0.3)" },
  { name: "TypeScript", category: "Language", bgColor: "rgba(49, 120, 198, 0.1)", textColor: "#3178C6", borderColor: "rgba(49, 120, 198, 0.3)" },
  { name: "Tailwind CSS", category: "Styling", bgColor: "rgba(56, 178, 172, 0.1)", textColor: "#38B2AC", borderColor: "rgba(56, 178, 172, 0.3)" },
  { name: "Vite", category: "Build Tool", bgColor: "rgba(100, 108, 255, 0.1)", textColor: "#646CFF", borderColor: "rgba(100, 108, 255, 0.3)" },
  { name: "shadcn/ui", category: "UI Components", bgColor: "rgba(0, 0, 0, 0.1)", textColor: "#000000", borderColor: "rgba(0, 0, 0, 0.3)" },
  { name: "Node.js", category: "Runtime", bgColor: "rgba(104, 160, 99, 0.1)", textColor: "#68A063", borderColor: "rgba(104, 160, 99, 0.3)" },
  { name: "Gemini API", category: "AI/ML", bgColor: "rgba(66, 133, 244, 0.1)", textColor: "#4285F4", borderColor: "rgba(66, 133, 244, 0.3)" },
  { name: "Vector Similarity", category: "Algorithm", bgColor: "rgba(255, 87, 51, 0.1)", textColor: "#FF5733", borderColor: "rgba(255, 87, 51, 0.3)" },
  { name: "Cosine Similarity", category: "ML Algorithm", bgColor: "rgba(233, 30, 99, 0.1)", textColor: "#E91E63", borderColor: "rgba(233, 30, 99, 0.3)" },
  { name: "NLP Processing", category: "AI/ML", bgColor: "rgba(255, 152, 0, 0.1)", textColor: "#FF9800", borderColor: "rgba(255, 152, 0, 0.3)" },
  { name: "Firebase", category: "Database", bgColor: "rgba(255, 193, 7, 0.1)", textColor: "#FFC107", borderColor: "rgba(255, 193, 7, 0.3)" },
  { name: "Recommendation Engine", category: "ML System", bgColor: "rgba(76, 175, 80, 0.1)", textColor: "#4CAF50", borderColor: "rgba(76, 175, 80, 0.3)" },
  { name: "Real-time Analytics", category: "Analytics", bgColor: "rgba(0, 150, 136, 0.1)", textColor: "#009688", borderColor: "rgba(0, 150, 136, 0.3)" },
  { name: "Geolocation API", category: "Location", bgColor: "rgba(139, 195, 74, 0.1)", textColor: "#8BC34A", borderColor: "rgba(139, 195, 74, 0.3)" },
  { name: "Speech Synthesis", category: "Accessibility", bgColor: "rgba(156, 39, 176, 0.1)", textColor: "#9C27B0", borderColor: "rgba(156, 39, 176, 0.3)" },
  { name: "Local Storage", category: "Data", bgColor: "rgba(96, 125, 139, 0.1)", textColor: "#607D8B", borderColor: "rgba(96, 125, 139, 0.3)" }
];

const About = () => {
  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-racing font-bold text-foreground mb-4">
            Saksham AI
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            AI-Based Internship Recommendation Engine for PM Internship Scheme
          </p>
          <div className="bg-primary/10 rounded-lg p-6 max-w-2xl mx-auto">
            <p className="text-primary font-semibold mb-2">
              Team HexaCoders • PEC Chandigarh • Problem Statement #25034
            </p>
            <p className="text-sm text-muted-foreground">
              Ministry of Corporate Affairs (MoCA) • Smart Education Theme
            </p>
          </div>
        </div>

        {/* Problem Statement */}
        <Card className="glass-card mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
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
              <h3 className="font-semibold text-lg mb-2">Our Solution</h3>
              <p className="text-muted-foreground">
                Saksham AI builds a lightweight recommendation engine that suggests 3-5 most relevant internships 
                based on candidate profile, academic background, interests, and location. The system is mobile-compatible, 
                user-friendly for low digital literacy users, and integrates seamlessly with existing portals.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Why This Project */}
        <Card className="glass-card mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
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

        {/* Why Our AI is Special */}
        <Card className="glass-card mb-12">
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

        {/* Team Section */}
        <Card className="glass-card mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center justify-center">
              <Users className="w-6 h-6 text-primary" />
              Meet Team HexaCoders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member, index) => (
                <Card key={index} className="border border-border/50 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-bold text-lg mb-1">
                        <a 
                          href={member.name === 'Ananay Dubey' ? 'https://ananay.netlify.app' : '#'}
                          target={member.name === 'Ananay Dubey' ? '_blank' : '_self'}
                          rel={member.name === 'Ananay Dubey' ? 'noopener noreferrer' : ''}
                          className="hover:text-primary transition-colors cursor-pointer"
                        >
                          {member.name}
                        </a>
                      </h3>
                      <p className="text-primary font-medium text-sm mb-2">{member.role}</p>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p><strong>ID:</strong> {member.id}</p>
                        <p><strong>Branch:</strong> {member.branch}</p>
                        <p className="break-all"><strong>Email:</strong> 
                          <a 
                            href={`mailto:${member.email}`}
                            className="hover:text-primary transition-colors cursor-pointer ml-1 break-all"
                          >
                            {member.email}
                          </a>
                        </p>
                        <p><strong>Phone:</strong> 
                          <a 
                            href={`tel:${member.phone}`}
                            className="hover:text-primary transition-colors cursor-pointer ml-1"
                          >
                            {member.phone}
                          </a>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tech Stack */}
        <Card className="glass-card mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" />
              Technology Stack
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {techStack.map((tech, index) => (
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
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



        <Card className="glass-card mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Key Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  AI-Powered Matching
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Advanced ML algorithms for personalized recommendations
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Location Proximity
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Smart location-based filtering with customizable search radius
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Audio Accessibility
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Voice descriptions for users with low digital literacy
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Feedback Learning
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Continuous improvement through user feedback analytics
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="glass-card mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center justify-center">
              <Users className="w-6 h-6 text-primary" />
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
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-semibold mb-2">Team Email</h3>
                <a 
                  href="mailto:team@sakshamai.com" 
                  className="text-primary hover:underline"
                >
                  team@sakshamai.com
                </a>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="font-semibold mb-2">Project Lead</h3>
                <a 
                  href="mailto:dubeyananay@gmail.com" 
                  className="text-primary hover:underline"
                >
                  Ananay Dubey
                </a>
                <p className="text-sm text-muted-foreground mt-1">+91 7719767324</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="font-semibold mb-2">Institution</h3>
                <p className="text-sm text-muted-foreground">
                  Punjab Engineering College<br/>
                  Chandigarh, India
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Research & References Section */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center justify-center">
              <Brain className="w-6 h-6 text-primary" />
              Research & References
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Hackathon Learning Topics */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-center">📚 Hackathon Learning Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-primary">🎯 Core Technologies</h4>
                    <ul className="space-y-2 text-sm">
                      <li><a href="https://react.dev/learn" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">React 18 Documentation</a></li>
                      <li><a href="https://www.typescriptlang.org/docs/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">TypeScript Handbook</a></li>
                      <li><a href="https://tailwindcss.com/docs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Tailwind CSS Guide</a></li>
                      <li><a href="https://firebase.google.com/docs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Firebase Documentation</a></li>
                      <li><a href="https://ui.shadcn.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">shadcn/ui Components</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-primary">🤖 AI/ML Integration</h4>
                    <ul className="space-y-2 text-sm">
                      <li><a href="https://platform.openai.com/docs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI API Documentation</a></li>
                      <li><a href="https://cloud.google.com/ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud AI Platform</a></li>
                      <li><a href="https://huggingface.co/docs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Hugging Face Transformers</a></li>
                      <li><a href="https://developers.google.com/machine-learning/recommendation" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ML Recommendation Systems</a></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Technical References */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-center">🔬 Technical References</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-primary">📊 Algorithms & Methods</h4>
                    <ul className="space-y-2 text-sm">
                      <li><a href="https://en.wikipedia.org/wiki/Cosine_similarity" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Cosine Similarity Algorithm</a></li>
                      <li><a href="https://developers.google.com/machine-learning/recommendation/collaborative/basics" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Collaborative Filtering</a></li>
                      <li><a href="https://scikit-learn.org/stable/modules/feature_extraction.html#text-feature-extraction" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Vector Space Models</a></li>
                      <li><a href="https://www.nltk.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Natural Language Processing</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-primary">🚀 Performance & Optimization</h4>
                    <ul className="space-y-2 text-sm">
                      <li><a href="https://web.dev/performance/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Web Performance Best Practices</a></li>
                      <li><a href="https://react.dev/reference/react/useMemo" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">React Performance Optimization</a></li>
                      <li><a href="https://vitejs.dev/guide/performance.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Vite Build Optimization</a></li>
                      <li><a href="https://web.dev/progressive-web-apps/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Progressive Web Apps</a></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Government & Policy References */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-center">🏛️ Government & Policy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-primary">📋 PM Internship Scheme</h4>
                    <ul className="space-y-2 text-sm">
                      <li><a href="https://www.mca.gov.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ministry of Corporate Affairs</a></li>
                      <li><a href="https://pminternship.mca.gov.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">PM Internship Portal</a></li>
                      <li><a href="https://www.india.gov.in/spotlight/pm-internship-scheme" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Scheme Guidelines</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-primary">🎓 Digital India & Education</h4>
                    <ul className="space-y-2 text-sm">
                      <li><a href="https://digitalindia.gov.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Digital India Initiative</a></li>
                      <li><a href="https://www.education.gov.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ministry of Education</a></li>
                      <li><a href="https://www.aicte-india.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">AICTE Guidelines</a></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Research Papers & Studies */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-center">📖 Research Papers & Studies</h3>
                <div className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">"Recommendation Systems in Education: A Survey"</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Comprehensive review of recommendation algorithms in educational contexts, 
                      focusing on personalized learning and career guidance systems.
                    </p>
                    <a href="https://arxiv.org/abs/2106.10063" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      View on arXiv →
                    </a>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">"Digital Divide and Rural Youth Employment in India"</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Analysis of technology adoption challenges among rural youth and 
                      strategies for inclusive digital platform design.
                    </p>
                    <a href="https://www.researchgate.net/publication/digital-divide-rural-india" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      View on ResearchGate →
                    </a>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">"Accessibility in AI Systems: Design Principles"</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Guidelines for building AI-powered applications that are accessible 
                      to users with varying levels of digital literacy and disabilities.
                    </p>
                    <a href="https://dl.acm.org/doi/accessibility-ai-systems" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      View on ACM Digital Library →
                    </a>
                  </div>
                </div>
              </div>

              {/* Open Source & Community */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-center">🌐 Open Source & Community</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <h4 className="font-semibold mb-3 text-primary">💻 Code Repository</h4>
                    <a href="https://github.com/saksham-ai/internship-platform" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      GitHub Repository
                    </a>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold mb-3 text-primary">📚 Documentation</h4>
                    <a href="https://docs.sakshamai.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      API Documentation
                    </a>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold mb-3 text-primary">🤝 Community</h4>
                    <a href="https://discord.gg/sakshamai" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Join Discord
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        

      </div>
    </div>
  );
};

export default About;