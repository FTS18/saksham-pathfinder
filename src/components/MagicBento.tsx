import React, { useEffect, useRef, useState } from 'react';

interface MagicBentoProps {
  children?: React.ReactNode;
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  glowColor?: string;
  className?: string;
}

export const MagicBento: React.FC<MagicBentoProps> = ({
  children,
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true,
  spotlightRadius = 300,
  particleCount = 12,
  glowColor = "132, 0, 255",
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });

      if (enableBorderGlow) {
        container.style.setProperty('--glow-x', `${x}%`);
        container.style.setProperty('--glow-y', `${y}%`);
        container.style.setProperty('--glow-intensity', '1');
      }
    };

    const handleMouseLeave = () => {
      if (enableBorderGlow) {
        container.style.setProperty('--glow-intensity', '0');
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enableBorderGlow]);

  const cardClasses = [
    'magic-bento-card',
    textAutoHide && 'card--text-autohide',
    enableBorderGlow && 'card--border-glow',
    enableTilt && 'card--tilt',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={containerRef}
      className={cardClasses}
      style={{
        '--glow-color': glowColor,
        '--spotlight-radius': `${spotlightRadius}px`
      } as React.CSSProperties}
    >
      {enableStars && (
        <div className="stars-container">
          {Array.from({ length: particleCount }).map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      )}
      
      {enableSpotlight && (
        <div
          className="spotlight"
          style={{
            background: `radial-gradient(${spotlightRadius}px circle at ${mousePos.x}% ${mousePos.y}%, rgba(${glowColor}, 0.1) 0%, transparent 70%)`
          }}
        />
      )}
      
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default MagicBento;