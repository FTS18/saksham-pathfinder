import { useState, useEffect, ImgHTMLAttributes, useId } from 'react';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  threshold?: number;
}

export const LazyImage = ({ src, alt, placeholder = '', threshold = 0.1, className, ...props }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const id = useId();
  const imgId = `lazy-img-${id.replace(/:/g, '')}`;
  
  useEffect(() => {
    // Basic Intersection Observer for lazy loading
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setInView(true);
              observer.disconnect();
            }
          });
        },
        { threshold }
      );
      
      const img = document.getElementById(imgId);
      if (img) observer.observe(img);
      
      return () => observer.disconnect();
    } else {
      // Fallback for older browsers
      setInView(true);
    }
  }, [src, threshold, imgId]);
  
  return (
    <div className={`relative overflow-hidden bg-muted ${className || ''}`} id={imgId}>
      {!isLoaded && placeholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
          <span className="text-muted-foreground/50 text-xs uppercase tracking-widest">{placeholder}</span>
        </div>
      )}
      
      {inView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          {...props}
        />
      )}
      
      {!inView && <div className="w-full h-full min-h-[200px]" />}
    </div>
  );
};
