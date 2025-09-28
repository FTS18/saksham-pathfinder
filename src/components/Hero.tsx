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
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background" />
      
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full animate-float blur-xl" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-accent/30 rounded-full animate-float blur-2xl" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-primary/25 rounded-full animate-float blur-xl" style={{ animationDelay: '4s' }} />
      </div>
      
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 shadow-lg hover:bg-green-500/20 transition-all duration-300 hover:scale-105">
              <Sparkles className="w-3 h-3 text-green-500 mr-2 animate-pulse" />
              <span className="text-xs font-medium text-green-500">
                Powered by AI Technology
              </span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-racing font-bold text-foreground mb-4 sm:mb-6 leading-tight px-2">
            Find the Right <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Internship</span> for You with AI
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
            Empowering students to discover meaningful career opportunities with intelligent recommendations tailored to your skills and aspirations.
          </p>

          <div className="mb-8 sm:mb-8 px-4">
            <Button 
              size="lg" 
              onClick={onGetStartedClick}
              className="bg-foreground hover:bg-foreground/90 active:bg-foreground/80 text-background px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 group"
            >
              Get Started
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
          </div>
        </div>
      </div>
    </section>


    </>
  );
};
