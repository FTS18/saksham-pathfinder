import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptimizedLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const OptimizedLoader = ({ size = 'md', text, className }: OptimizedLoaderProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn("flex flex-col items-center justify-center py-8", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && <p className="text-sm text-muted-foreground mt-2">{text}</p>}
    </div>
  );
};