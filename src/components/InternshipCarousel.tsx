import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { InternshipCard } from './InternshipCard';
import { Button } from '@/components/ui/button';

interface InternshipCarouselProps {
  internships: any[];
  title?: string;
  subtitle?: string;
  userProfile?: any;
  showMatchScores?: boolean;
  ariaLabel?: string;
}

export const InternshipCarousel: React.FC<InternshipCarouselProps> = ({
  internships,
  title = 'You Might Like These',
  subtitle = 'Based on your preferences',
  userProfile,
  showMatchScores = true,
  ariaLabel = 'Internship recommendations carousel',
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardWidth = 380; // width of card + gap
  const visibleCards = 3; // Default for desktop

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = cardWidth;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      // Update current index for screen readers
      const newIndex = currentIndex + (direction === 'left' ? -1 : 1);
      setCurrentIndex(Math.max(0, Math.min(newIndex, internships.length - visibleCards)));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scroll('left');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scroll('right');
    }
  };

  if (internships.length === 0) {
    return null;
  }

  return (
    <section
      className="mt-12 mb-8"
      aria-label={ariaLabel}
      role="region"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles
            className="w-6 h-6 text-primary"
            aria-hidden="true"
          />
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        </div>
        {subtitle && (
          <p className="text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Left Arrow Button */}
        {canScrollLeft && (
          <Button
            onClick={() => scroll('left')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                scroll('left');
              }
            }}
            className="absolute left-0 top-1/3 -translate-y-1/2 z-10 rounded-full bg-background/80 hover:bg-background border border-border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2"
            aria-label="Scroll left"
            title="Scroll left (or use ← arrow key)"
          >
            <ChevronLeft className="w-6 h-6" aria-hidden="true" />
          </Button>
        )}

        {/* Right Arrow Button */}
        {canScrollRight && (
          <Button
            onClick={() => scroll('right')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                scroll('right');
              }
            }}
            className="absolute right-0 top-1/3 -translate-y-1/2 z-10 rounded-full bg-background/80 hover:bg-background border border-border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2"
            aria-label="Scroll right"
            title="Scroll right (or use → arrow key)"
          >
            <ChevronRight className="w-6 h-6" aria-hidden="true" />
          </Button>
        )}

        {/* Scrollable Cards Container */}
        <div
          ref={scrollContainerRef}
          onKeyDown={handleKeyDown}
          className="overflow-x-auto scroll-smooth scrollbar-hide px-12"
          role="group"
          aria-roledescription="carousel"
          tabIndex={0}
          aria-label={`${title} - Use arrow keys to navigate`}
        >
          <div className="flex gap-6 pb-2">
            {internships.map((internship, index) => (
              <div
                key={internship.id}
                className="flex-shrink-0 w-96"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${internships.length}: ${internship.title} at ${internship.company}`}
              >
                <InternshipCard
                  internship={internship}
                  userProfile={userProfile}
                  matchScore={showMatchScores ? internship.matchScore : undefined}
                  aiTags={['Recommended']}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Carousel Info */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <span
          className="text-sm text-muted-foreground"
          aria-live="polite"
          aria-atomic="true"
        >
          Showing {Math.min(currentIndex + visibleCards, internships.length)} of {internships.length}
        </span>
        <span className="text-xs text-muted-foreground" aria-label="keyboard navigation hint">
          💡 Use arrow keys to navigate
        </span>
      </div>
    </section>
  );
};
