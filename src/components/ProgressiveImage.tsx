import { useState, useRef, useEffect } from 'react';

interface ProgressiveImageProps {
  src: string;
  placeholder?: string;
  alt: string;
  className?: string;
  blurAmount?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export const ProgressiveImage = ({
  src,
  placeholder,
  alt,
  className = "",
  blurAmount = 10,
  onLoad,
  onError
}: ProgressiveImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder || '');
  
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
      onLoad?.();
    };
    
    img.onerror = () => {
      setHasError(true);
      onError?.();
    };
    
    img.src = src;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onLoad, onError]);

  // Generate a simple placeholder if none provided
  const defaultPlaceholder = `data:image/svg+xml;base64,${btoa(`
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial, sans-serif" font-size="16">
        Loading...
      </text>
    </svg>
  `)}`;

  if (hasError) {
    return (
      <div className={`bg-muted flex items-center justify-center text-muted-foreground ${className}`}>
        <span className="text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        ref={imgRef}
        src={currentSrc || defaultPlaceholder}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-500 ease-out ${
          !isLoaded ? `blur-[${blurAmount}px] scale-110` : 'blur-0 scale-100'
        }`}
        style={{
          filter: !isLoaded ? `blur(${blurAmount}px)` : 'blur(0px)',
          transform: !isLoaded ? 'scale(1.1)' : 'scale(1)',
        }}
      />
      
      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted/20 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};