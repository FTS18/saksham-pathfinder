import { Button } from './ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

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

export const Hero = () => {
  const { language } = useTheme();
  const t = translations[language];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 hero-gradient" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full animate-float blur-xl" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-accent/30 rounded-full animate-float blur-2xl" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-primary/25 rounded-full animate-float blur-xl" style={{ animationDelay: '4s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          
          {/* Badge */}
          <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 sm:mb-8">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary mr-2" />
            <span className="text-xs sm:text-sm font-medium text-primary">
              Powered by AI Technology
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-hero font-poppins font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
            {t.headline}
          </h1>

          {/* Subtext */}
          <p className="text-subtitle text-white/80 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
            {t.subtext}
          </p>

          {/* CTA Button */}
          <div className="mb-8 sm:mb-12 px-4">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-dark text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg shadow-clean hover-lift group"
            >
              {t.cta}
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 smooth-transition" />
            </Button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 px-4">
            {t.features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 border border-white/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full"
              >
                <span className="text-xs sm:text-sm font-medium text-white/90">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};