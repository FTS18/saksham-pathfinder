import { Button } from './ui/button';
import { ArrowRight, Sparkles, Brain, Target, Users } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';

const translations = {
  en: {
    headline: 'Find the Right Internship for You with AI',
    subtext: 'Empowering students to discover meaningful career opportunities with intelligent recommendations tailored to your skills and aspirations.',
    cta: 'Get Started',
    features: ['AI-Powered Matching', 'Personalized Recommendations', 'Student-Friendly Interface']
  },
  hi: {
    headline: 'AI के साथ अपने लिए सही इंटर्नशिप खोजें',
    subtext: 'आपके कौशल और आकांक्षाओं के अनुरूप बुद्धिमान सिफारिशों के साथ छात्रों को सार्थक करियर के अवसर खोजने में सशक्त बनाना।',
    cta: 'शुरू करें',
    features: ['AI-संचालित मैचिंग', 'व्यक्तिगत सिफारिशें', 'छात्र-अनुकूल इंटरफेस']
  }
};

interface HeroProps {
  onGetStartedClick: () => void;
}


export const Hero = ({ onGetStartedClick }: HeroProps) => {
  const { language } = useTheme();
  const t = translations[language];
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = window.innerHeight * 0.3;
      setShowCards(scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
    <section className="relative min-h-screen flex items-end justify-center overflow-hidden pb-20 bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background" />
      
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full animate-float blur-xl" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-accent/30 rounded-full animate-float blur-2xl" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-primary/25 rounded-full animate-float blur-xl" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center mb-8 mt-12 lg:mt-24">
            <div className="inline-flex items-center px-4 py-2 sm:px-4 sm:py-2 rounded-full bg-green-500/10 border border-green-500/20 shadow-lg">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-3" />
              <span className="text-sm sm:text-base font-semibold text-green-500">
                Powered by AI Technology
              </span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-racing font-bold text-foreground mb-4 sm:mb-6 leading-tight px-2">
            Find the Right <span className="bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">Internship</span> for You with AI
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
            {t.subtext}
          </p>

          <div className="mb-8 sm:mb-8 px-4">
            <Button 
              size="lg" 
              onClick={onGetStartedClick}
              className="bg-primary hover:bg-primary-dark text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg shadow-clean hover-lift group"
            >
              {t.cta}
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 smooth-transition" />
            </Button>
          </div>


        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>

    {/* Feature Cards Section with Scroll Animation */}
    <section className="py-16 bg-background">
      <div className="max-w-2xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`bg-card border border-border rounded-lg p-6 text-center shadow-clean hover-lift transition-all duration-1000 transform ${
            showCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`} style={{ transitionDelay: showCards ? '0ms' : '0ms' }}>
            <Brain className="w-10 h-10 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
            <span className="text-sm font-medium text-foreground">
              AI-Powered Matching
            </span>
          </div>
          <div className={`bg-card border border-border rounded-lg p-6 text-center shadow-clean hover-lift transition-all duration-1000 transform ${
            showCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`} style={{ transitionDelay: showCards ? '200ms' : '0ms' }}>
            <Target className="w-10 h-10 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
            <span className="text-sm font-medium text-foreground">
              Personalized Recommendations
            </span>
          </div>
          <div className={`bg-card border border-border rounded-lg p-6 text-center shadow-clean hover-lift transition-all duration-1000 transform ${
            showCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`} style={{ transitionDelay: showCards ? '400ms' : '0ms' }}>
            <Users className="w-10 h-10 text-green-600 dark:text-green-400 mx-auto mb-3" />
            <span className="text-sm font-medium text-foreground">
              Student-Friendly Interface
            </span>
          </div>
        </div>
      </div>
      <div className="w-full h-px bg-border mt-16"></div>
    </section>
    </>
  );
};
