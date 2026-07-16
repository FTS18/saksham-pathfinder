import { Button } from './ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

interface HeroProps {
  onGetStartedClick: () => void;
}

export const Hero = ({ onGetStartedClick }: HeroProps) => {
  const { language } = useTheme();
  const navigate = useNavigate();

  const socialProof = [
    { stat: '10,000+', text: 'Internships' },
    { stat: '500+', text: 'Companies' },
    { stat: '50,000+', text: 'Students' },
  ];

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Base Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/hero-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Contrast Overlay: Light layer in light mode, Dark layer in dark mode */}
      <div className="absolute inset-0 z-0 bg-white/75 dark:bg-black/80 pointer-events-none" />
      
      {/* Purply Accent Overlay */}
      <div className="absolute inset-0 z-0 bg-primary/20 dark:bg-primary/30 mix-blend-color pointer-events-none" />
      
      {/* Gradient fade to seamlessly blend into the main page background at the bottom */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-background/60 to-background pointer-events-none" />
      
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-12">



        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-racing font-bold text-foreground mb-4 sm:mb-5 leading-tight mt-8 animate-staggered stagger-1" style={{ textWrap: 'balance' } as React.CSSProperties}>
          Find the Right{' '}
          <span className="text-primary">Internship</span>{' '}
          for You
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed animate-staggered stagger-2">
          Discover opportunities tailored to your skills and career aspirations.
        </p>

        {/* Primary CTA */}
        <div className="flex justify-center mb-10 animate-staggered stagger-3">
          <Button
            onClick={onGetStartedClick}
            size="lg"
            className="h-12 px-8 text-base font-semibold rounded-lg shrink-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            Explore Internships
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Social proof stats */}
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 mt-12 pt-8 border-t border-border/40 max-w-2xl mx-auto animate-staggered stagger-4">
          {socialProof.map(({ stat, text }) => (
            <div key={text} className="flex flex-col items-center hover:-translate-y-1 transition-transform cursor-default">
              <span className="text-3xl font-bold text-foreground mb-1">{stat}</span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{text}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
