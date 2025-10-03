import { Card, CardContent, CardHeader } from './ui/card';
import { Skeleton } from './ui/skeleton';

export const ProfileSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-9 w-16" />
          </div>
          {/* Tab Navigation Skeleton */}
          <div className="flex justify-center pb-4">
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-20" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="pt-32 space-y-6">
        {/* Basic Info Card */}
        <Card className="glass-card">
          <CardHeader>
            <Skeleton className="h-6 w-40 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-20 h-20 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-11 w-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-11 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-11 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sectors Card */}
        <Card className="glass-card">
          <CardHeader>
            <Skeleton className="h-6 w-20 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skills Card */}
        <Card className="glass-card">
          <CardHeader>
            <Skeleton className="h-6 w-16 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};