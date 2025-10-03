import { useState, useRef, useCallback, ReactNode } from 'react';
import { Heart, X, Bookmark } from 'lucide-react';

interface SwipeCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  threshold?: number;
  className?: string;
}

export const SwipeCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  threshold = 100,
  className = ""
}: SwipeCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  const cardRef = useRef<HTMLDivElement>(null);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    setStartPos({ x: clientX, y: clientY });
  }, []);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;

    const deltaX = clientX - startPos.x;
    const deltaY = clientY - startPos.y;
    
    setDragOffset({ x: deltaX, y: deltaY });
  }, [isDragging, startPos]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;

    const { x, y } = dragOffset;
    const absX = Math.abs(x);
    const absY = Math.abs(y);

    // Determine swipe direction
    if (absX > threshold && absX > absY) {
      if (x > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (x < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    } else if (absY > threshold && absY > absX) {
      if (y < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }

    // Reset state
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  }, [isDragging, dragOffset, threshold, onSwipeLeft, onSwipeRight, onSwipeUp]);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  // Mouse events for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const rotation = dragOffset.x * 0.1;
  const opacity = 1 - Math.abs(dragOffset.x) / (threshold * 2);
  const scale = isDragging ? 0.95 : 1;

  // Show action indicators
  const showLeftAction = dragOffset.x < -threshold / 2;
  const showRightAction = dragOffset.x > threshold / 2;
  const showUpAction = dragOffset.y < -threshold / 2;

  return (
    <div className="relative">
      {/* Action Indicators */}
      {showLeftAction && (
        <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-red-500 rounded-full p-3">
            <X className="w-6 h-6 text-white" />
          </div>
        </div>
      )}
      
      {showRightAction && (
        <div className="absolute inset-0 bg-green-500/20 rounded-lg flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-green-500 rounded-full p-3">
            <Heart className="w-6 h-6 text-white" />
          </div>
        </div>
      )}
      
      {showUpAction && (
        <div className="absolute inset-0 bg-blue-500/20 rounded-lg flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-blue-500 rounded-full p-3">
            <Bookmark className="w-6 h-6 text-white" />
          </div>
        </div>
      )}

      {/* Card */}
      <div
        ref={cardRef}
        className={`transition-all duration-200 ease-out cursor-grab active:cursor-grabbing ${className}`}
        style={{
          transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg) scale(${scale})`,
          opacity,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={isDragging ? handleMouseMove : undefined}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
      >
        {children}
      </div>
    </div>
  );
};