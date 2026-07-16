import { CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Search, GitCompare, Zap, Building2, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Public Features Showcase
 * Shows unauthenticated users what they can do without login
 */
export const PublicFeaturesShowcase = () => {
  const features = [
    {
      title: 'Browse & Search',
      description: 'Search through thousands of internship opportunities by title, company, location, and more.',
      icon: Search,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
      glowColor: 'group-hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]',
      borderGlow: 'group-hover:border-blue-500/50',
      link: '/?search=true',
      buttonText: 'Start Browsing'
    },
    {
      title: 'Smart Filters',
      description: 'Filter by sectors, skills, locations, stipend, and more to find exactly what you\'re looking for.',
      icon: Zap,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
      glowColor: 'group-hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]',
      borderGlow: 'group-hover:border-amber-500/50',
      link: '/?filters=true',
      buttonText: 'Try Filters'
    },
    {
      title: 'Compare Options',
      description: 'Side-by-side comparison of multiple internships to help you make the best choice.',
      icon: GitCompare,
      iconColor: 'text-violet-400',
      iconBg: 'bg-violet-500/10',
      glowColor: 'group-hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)]',
      borderGlow: 'group-hover:border-violet-500/50',
      link: '/internships',
      buttonText: 'Start Comparing'
    },
    {
      title: 'Trending Now',
      description: 'Discover the most popular internships and trending companies in the market right now.',
      icon: TrendingUp,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
      glowColor: 'group-hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]',
      borderGlow: 'group-hover:border-emerald-500/50',
      link: '/?sort=trending',
      buttonText: 'See Trending'
    },
    {
      title: 'City & Sector',
      description: 'Browse internships by your city or favorite sector/industry.',
      icon: Building2,
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/10',
      glowColor: 'group-hover:shadow-[0_0_30px_-5px_rgba(244,63,94,0.3)]',
      borderGlow: 'group-hover:border-rose-500/50',
      link: '/sitemap',
      buttonText: 'Explore Pages'
    },
    {
      title: 'Success Stories',
      description: 'Read success stories from other students and see where they got their internships.',
      icon: Users,
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-500/10',
      glowColor: 'group-hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]',
      borderGlow: 'group-hover:border-indigo-500/50',
      link: '#',
      buttonText: 'Coming Soon',
      disabled: true
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-32 bg-primary/10 blur-[100px] rounded-full -z-10"></div>
        <h2 className="text-5xl font-black mb-6 tracking-tight">
          <span className="bg-gradient-to-r from-primary via-violet-400 to-primary bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
            Explore Without Limits
          </span>
        </h2>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
          Start exploring internships, compare opportunities, and discover your next big move — completely free, no sign up required.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {features.map((feature, i) => (
          <div 
            key={i} 
            className={`group relative flex flex-col justify-between p-8 rounded-3xl bg-card/40 backdrop-blur-xl border border-white/5 dark:border-white/10 overflow-hidden transition-all duration-500 hover:-translate-y-2 ${feature.glowColor} ${feature.borderGlow}`}
          >
            {/* Subtle background glow effect inside card */}
            <div className={`absolute top-0 right-0 w-32 h-32 -translate-y-12 translate-x-12 rounded-full blur-[50px] opacity-20 transition-opacity duration-500 group-hover:opacity-40 ${feature.iconBg}`}></div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl ${feature.iconBg} flex items-center justify-center shrink-0 border border-white/5 group-hover:scale-110 transition-transform duration-500 ease-out`}>
                  <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">{feature.title}</CardTitle>
              </div>
              
              <p className="text-base text-muted-foreground leading-relaxed mb-10">
                {feature.description}
              </p>
            </div>

            <div className="relative z-10 mt-auto">
              {feature.disabled ? (
                <Button variant="secondary" className="w-full h-12 rounded-xl opacity-50 cursor-not-allowed font-medium text-base">
                  {feature.buttonText}
                </Button>
              ) : (
                <Link to={feature.link} className="block w-full">
                  <Button 
                    className={`w-full h-12 rounded-xl font-semibold text-base flex items-center justify-center gap-2 overflow-hidden relative group/btn ${feature.iconBg} text-foreground border border-white/10 hover:border-transparent transition-all duration-300`}
                  >
                    <span className="relative z-10 flex items-center gap-2 transition-transform duration-300 group-hover/btn:-translate-x-1">
                      {feature.buttonText}
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-4 transition-all duration-300 group-hover/btn:opacity-100 group-hover/btn:translate-x-0" />
                    </span>
                    {/* Button hover gradient overlay */}
                    <div className="absolute inset-0 bg-primary opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    <span className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 text-primary-foreground z-20">
                      <span className="transition-transform duration-300 -translate-x-1">{feature.buttonText}</span>
                      <ArrowRight className="w-4 h-4 translate-x-0" />
                    </span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Premium Call to Action */}
      <div className="mt-16 sm:mt-24 relative overflow-hidden bg-gradient-to-br from-primary/20 via-violet-500/10 to-transparent border border-white/10 backdrop-blur-md rounded-3xl sm:rounded-[3rem] p-6 sm:p-16 text-center shadow-2xl">
        <div className="relative z-10">
          <h3 className="text-2xl sm:text-4xl font-black mb-3 sm:mb-4">Ready to Launch Your Career?</h3>
          <p className="text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto text-base sm:text-xl leading-relaxed">
            Create an account to apply instantly, save your favorites, and get personalized AI recommendations tailored to your skills.
          </p>
          <Link to="/login" className="block sm:inline-block w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary text-primary-foreground rounded-xl sm:rounded-2xl px-6 sm:px-10 h-12 sm:h-14 text-base sm:text-lg font-bold shadow-[0_0_40px_-10px_rgba(var(--primary),0.5)] hover:shadow-[0_0_60px_-10px_rgba(var(--primary),0.7)] transition-all sm:hover:-translate-y-1 sm:hover:scale-105">
              Create Free Account
            </Button>
          </Link>
        </div>
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-primary/20 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-violet-500/20 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none"></div>
      </div>
    </div>
  );
};

export default PublicFeaturesShowcase;
