import { memo, useMemo } from 'react';
import { InternshipCard } from './InternshipCard';

interface VirtualizedListProps {
  items: any[];
  userProfile: any;
  itemHeight?: number;
  containerHeight?: number;
}

export const VirtualizedList = memo(({ 
  items, 
  userProfile, 
  itemHeight = 400,
  containerHeight = 800 
}: VirtualizedListProps) => {
  const visibleItems = useMemo(() => {
    // Simple virtualization - show only first 6 items initially
    return items.slice(0, 6);
  }, [items]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {visibleItems.map((rec, index) => (
        <div
          key={`${rec.internship.id}-${index}`}
          className="animate-[fadeInUp_0.6s_ease-out_forwards] opacity-0"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <InternshipCard
            internship={rec.internship}
            matchExplanation={rec.explanation}
            userProfile={userProfile}
            onNext={index < items.length - 1 ? () => {} : undefined}
            onPrev={index > 0 ? () => {} : undefined}
            currentIndex={index}
            totalCount={items.length}
          />
        </div>
      ))}
    </div>
  );
});

VirtualizedList.displayName = 'VirtualizedList';