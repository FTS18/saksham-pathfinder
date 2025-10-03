import { useState, useRef, useCallback, ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  snapPoints?: number[];
  initialSnap?: number;
  className?: string;
}

export const BottomSheet = ({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [0.3, 0.6, 0.9],
  initialSnap = 1,
  className = ""
}: BottomSheetProps) => {
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const snapToPoint = useCallback((snapIndex: number) => {
    setCurrentSnap(Math.max(0, Math.min(snapPoints.length - 1, snapIndex)));
  }, [snapPoints]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touchY = e.touches[0].clientY;
    setCurrentY(touchY);
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    
    const deltaY = currentY - startY;
    const threshold = 50;
    
    if (deltaY > threshold && currentSnap > 0) {
      // Swipe down - go to lower snap point or close
      if (currentSnap === 0) {
        onClose();
      } else {
        snapToPoint(currentSnap - 1);
      }
    } else if (deltaY < -threshold && currentSnap < snapPoints.length - 1) {
      // Swipe up - go to higher snap point
      snapToPoint(currentSnap + 1);
    }
    
    setIsDragging(false);
    setStartY(0);
    setCurrentY(0);
  }, [isDragging, currentY, startY, currentSnap, snapPoints.length, onClose, snapToPoint]);

  // Close on backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentHeight = snapPoints[currentSnap] * 100;
  const dragOffset = isDragging ? Math.max(0, currentY - startY) : 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
        style={{ opacity: isOpen ? 1 : 0 }}
      />
      
      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`relative w-full bg-background rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out ${className}`}
        style={{
          height: `${currentHeight}vh`,
          transform: `translateY(${dragOffset}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
        </div>
        
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 pb-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        {/* Content */}
        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto p-4"
          style={{ 
            maxHeight: `calc(${currentHeight}vh - ${title ? '120px' : '60px'})` 
          }}
        >
          {children}
        </div>
        
        {/* Snap Point Indicators */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2">
          {snapPoints.map((_, index) => (
            <button
              key={index}
              onClick={() => snapToPoint(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSnap 
                  ? 'bg-primary' 
                  : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};