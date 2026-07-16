import { Building2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

const companies = [
  'Infosys', 'HDFC Bank', 'Maruti Suzuki India', 'Hindustan Unilever (HUL)', 'Larsen & Toubro',
  'Apollo Hospitals', 'Reliance Jio', 'PwC', 'BHEL', 'Wipro', 'ITC Hotels', 'DLF Limited',
  'Flipkart', 'ICICI Bank', 'ONGC', 'Zomato', 'Kotak Mahindra Bank', 'Mahindra & Mahindra',
  'Reliance Retail', 'Godrej Properties'
];

const SPEED = 0.6; // pixels per frame

export const PartnerCompanies = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const xRef = useRef(0);
  const pausedRef = useRef(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const tick = () => {
      if (!pausedRef.current && track) {
        xRef.current -= SPEED;
        // Reset when we've scrolled exactly half (because the list is duplicated)
        const half = track.scrollWidth / 2;
        if (Math.abs(xRef.current) >= half) {
          xRef.current = 0;
        }
        track.style.transform = `translateX(${xRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <section className="py-16 bg-background border-t border-border/30">
      <div className="max-w-3xl mx-auto px-4 text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Building2 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-racing font-bold text-foreground">Our Partners</h2>
        <p className="text-muted-foreground mt-2">Discover internships at leading institutions & corporate brands</p>
      </div>

      {/* Overflow clip wrapper */}
      <div className="relative w-full overflow-hidden">
        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-28 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to right, hsl(var(--background)), transparent)' }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-28 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to left, hsl(var(--background)), transparent)' }}
        />

        {/* Scrolling track — driven by rAF, no CSS animation */}
        <div
          ref={trackRef}
          className="flex gap-4 py-2 will-change-transform"
          style={{ width: 'max-content' }}
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => { pausedRef.current = false; }}
        >
          {/* Original list */}
          {companies.map((company, idx) => (
            <a
              key={`a-${idx}`}
              href={`/company/${company.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and').replace(/\(|\)/g, '')}`}
              className="group inline-flex items-center gap-3 px-6 py-3.5 bg-card hover:bg-muted border border-border/40 hover:border-primary/30 rounded-xl text-sm font-semibold text-foreground/80 hover:text-primary transition-all duration-300 shadow-sm whitespace-nowrap"
            >
              <Building2 className="w-4 h-4 text-primary/50 group-hover:text-primary transition-colors flex-shrink-0" />
              <span>{company}</span>
            </a>
          ))}
          {/* Duplicate for seamless loop */}
          {companies.map((company, idx) => (
            <a
              key={`b-${idx}`}
              href={`/company/${company.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and').replace(/\(|\)/g, '')}`}
              className="group inline-flex items-center gap-3 px-6 py-3.5 bg-card hover:bg-muted border border-border/40 hover:border-primary/30 rounded-xl text-sm font-semibold text-foreground/80 hover:text-primary transition-all duration-300 shadow-sm whitespace-nowrap"
              aria-hidden="true"
              tabIndex={-1}
            >
              <Building2 className="w-4 h-4 text-primary/50 group-hover:text-primary transition-colors flex-shrink-0" />
              <span>{company}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
