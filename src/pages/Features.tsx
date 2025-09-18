import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Brain, Target, Users, BarChart3, Heart, MessageSquare, Filter, Globe, Shield, Zap, Check, X } from 'lucide-react';

const Features = () => {
  const currentFeatures = [
    { icon: Brain, title: 'AI-Powered Recommendations', desc: 'Smart matching using ML algorithms' },
    { icon: Target, title: 'Skill Gap Analysis', desc: 'Identify missing skills for dream roles' },
    { icon: Users, title: 'Profile Management', desc: 'Comprehensive student profiles' },
    { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track applications and feedback' },
    { icon: Heart, title: 'Wishlist System', desc: 'Save favorite internships' },
    { icon: MessageSquare, title: 'Feedback System', desc: 'Rate and review experiences' },
    { icon: Filter, title: 'Advanced Filters', desc: 'Filter by location, salary, skills' },
    { icon: Globe, title: 'Multi-language Support', desc: 'English and Hindi interface' },
    { icon: Shield, title: 'Secure Authentication', desc: 'Firebase-based user security' },
    { icon: Zap, title: 'Real-time Updates', desc: 'Live internship data sync' }
  ];

  const techStackTable = [
    [
      { name: 'React', color: 'bg-blue-700 text-white' },
      { name: 'Firebase', color: 'bg-orange-700 text-white' },
      { name: 'Firestore', color: 'bg-yellow-700 text-white' },
      { name: 'Cosine Similarity', color: 'bg-purple-700 text-white' }
    ],
    [
      { name: 'TypeScript', color: 'bg-blue-800 text-white' },
      { name: 'Authentication', color: 'bg-red-700 text-white' },
      { name: 'Local Storage', color: 'bg-green-700 text-white' },
      { name: 'Vector Matching', color: 'bg-indigo-700 text-white' }
    ],
    [
      { name: 'Tailwind CSS', color: 'bg-cyan-700 text-white' },
      { name: 'Hosting', color: 'bg-orange-800 text-white' },
      { name: 'JSON Data', color: 'bg-gray-700 text-white' },
      { name: 'Scoring Algorithm', color: 'bg-pink-700 text-white' }
    ],
    [
      { name: 'Shadcn/ui', color: 'bg-slate-800 text-white' },
      { name: 'Vite', color: 'bg-violet-700 text-white' },
      { name: 'Real-time DB', color: 'bg-emerald-700 text-white' },
      { name: 'ML-Light', color: 'bg-rose-700 text-white' }
    ]
  ];

  const techCategories = ['Frontend', 'Backend', 'Database', 'AI/ML'];

  const whyUs = [
    {
      title: 'AI-First Approach',
      desc: 'Unlike traditional job boards, we use advanced ML algorithms for personalized matching'
    },
    {
      title: 'Student-Centric Design',
      desc: 'Built specifically for students with features like skill gap analysis and career guidance'
    },
    {
      title: 'Real-time Intelligence',
      desc: 'Dynamic scoring system that adapts to your profile changes and preferences'
    },
    {
      title: 'Comprehensive Analytics',
      desc: 'Track your application success rate and get insights to improve your profile'
    }
  ];

  return (
    <div className="min-h-screen hero-gradient pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-racing font-bold text-foreground mb-4">
            Platform Features & Technology
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover what makes Saksham AI the most advanced internship matching platform
          </p>
        </div>

        {/* Current Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-racing font-bold text-center mb-8">Current Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentFeatures.map((feature, index) => (
              <Card key={index} className="glass-card hover:scale-105 transition-transform">
                <CardHeader className="pb-3">
                  <feature.icon className="w-8 h-8 text-primary mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mb-16">
          <h2 className="text-3xl font-racing font-bold text-center mb-8">Technology Stack</h2>
          <div className="max-w-4xl mx-auto">
            <div className="backdrop-blur-md bg-black/20 border border-white/10 rounded-xl p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      {techCategories.map((category, i) => (
                        <th key={i} className="text-center p-4 font-racing text-lg border-b border-white/20 bg-black/30 text-white">
                          {category}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {techStackTable.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((tech, colIndex) => (
                          <td key={colIndex} className="p-2 border-b border-white/10 text-center">
                            <div className={`w-full py-3 px-4 rounded-lg text-sm font-medium ${tech.color} shadow-lg`}>
                              {tech.name}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="mb-16">
          <h2 className="text-3xl font-racing font-bold text-center mb-8">Why Choose Saksham AI?</h2>
          <div className="max-w-6xl mx-auto">
            <div className="backdrop-blur-md bg-black/20 border border-white/10 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left p-6 font-racing text-xl text-white bg-black/30">Features</th>
                      <th className="text-center p-6 font-racing text-xl text-primary bg-primary/10">Saksham AI</th>
                      <th className="text-center p-6 font-racing text-xl text-muted-foreground bg-black/20">Traditional Platforms</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/10">
                      <td className="p-4 font-medium text-white">AI-Powered Matching</td>
                      <td className="p-4 text-center"><Check className="w-6 h-6 text-green-500 mx-auto" /></td>
                      <td className="p-4 text-center"><X className="w-6 h-6 text-red-500 mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="p-4 font-medium text-white">Skill Gap Analysis</td>
                      <td className="p-4 text-center"><Check className="w-6 h-6 text-green-500 mx-auto" /></td>
                      <td className="p-4 text-center"><X className="w-6 h-6 text-red-500 mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="p-4 font-medium text-white">Personalized Recommendations</td>
                      <td className="p-4 text-center"><Check className="w-6 h-6 text-green-500 mx-auto" /></td>
                      <td className="p-4 text-center"><X className="w-6 h-6 text-red-500 mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="p-4 font-medium text-white">Multi-language Support</td>
                      <td className="p-4 text-center"><Check className="w-6 h-6 text-green-500 mx-auto" /></td>
                      <td className="p-4 text-center"><X className="w-6 h-6 text-red-500 mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="p-4 font-medium text-white">Real-time Analytics</td>
                      <td className="p-4 text-center"><Check className="w-6 h-6 text-green-500 mx-auto" /></td>
                      <td className="p-4 text-center"><X className="w-6 h-6 text-red-500 mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-white">Student-Centric Design</td>
                      <td className="p-4 text-center"><Check className="w-6 h-6 text-green-500 mx-auto" /></td>
                      <td className="p-4 text-center"><X className="w-6 h-6 text-red-500 mx-auto" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {whyUs.map((item, index) => (
              <Card key={index} className="glass-card">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Card className="glass-card max-w-4xl mx-auto">
              <CardContent className="p-8">
                <h3 className="text-2xl font-racing font-bold mb-4">What Makes Us Different</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  While other platforms simply list internships, Saksham AI understands you. Our advanced AI analyzes your skills, 
                  interests, and career goals to deliver personalized recommendations. We don't just match keywords - we understand 
                  context, proximity, and career progression to find opportunities that truly fit your aspirations.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Features;