import { Card, CardContent } from '@/components/ui/card';

export const InternshipCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardContent className="p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 bg-muted rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-5/6" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 bg-muted rounded w-16" />
        <div className="h-6 bg-muted rounded w-16" />
        <div className="h-6 bg-muted rounded w-16" />
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-9 bg-muted rounded flex-1" />
        <div className="h-9 w-9 bg-muted rounded" />
      </div>
    </CardContent>
  </Card>
);
