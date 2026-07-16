import { Card, CardContent } from '@/components/ui/card';

export const InternshipCardSkeleton = () => (
  <Card className="animate-pulse rounded-xl overflow-hidden border border-border">
    {/* Top accent bar */}
    <div className="h-0.5 w-full bg-muted" />
    <CardContent className="p-4 flex flex-col gap-3">
      {/* Company row */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 bg-muted rounded-lg shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 bg-muted rounded w-24" />
          <div className="h-2.5 bg-muted rounded w-16" />
        </div>
      </div>
      {/* Title */}
      <div className="space-y-1.5">
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-3/4" />
      </div>
      {/* Pill meta */}
      <div className="flex gap-2">
        <div className="h-5 bg-muted rounded-full w-20" />
        <div className="h-5 bg-muted rounded-full w-16" />
      </div>
      {/* Skills */}
      <div className="flex gap-1">
        <div className="h-4 bg-muted rounded w-12" />
        <div className="h-4 bg-muted rounded w-16" />
        <div className="h-4 bg-muted rounded w-10" />
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="h-4 bg-muted rounded w-20" />
        <div className="h-4 bg-muted rounded w-16" />
      </div>
      {/* Buttons */}
      <div className="flex gap-2">
        <div className="h-8 bg-muted rounded-lg flex-1" />
        <div className="h-8 bg-muted rounded-lg w-20" />
      </div>
    </CardContent>
  </Card>
);
