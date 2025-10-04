import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: 'sm' | 'md' | 'lg' | 'full';
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  height = 'md'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const heightClasses = {
    sm: 'h-1/3',
    md: 'h-1/2',
    lg: 'h-2/3',
    full: 'h-full'
  };

  const swipeRef = useSwipeGestures({
    onSwipeDown: onClose
  });

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setTimeout(() => setIsVisible(false), 300);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div 
        ref={swipeRef}
        className={`absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-2xl transition-transform duration-300 ${
          heightClasses[height]
        } ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
        </div>
        
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-3 border-b">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};