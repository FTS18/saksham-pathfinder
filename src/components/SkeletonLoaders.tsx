import { Skeleton } from './ui/skeleton';

export const SkeletonCard = () => (
  <div className="p-6 border rounded-lg space-y-4 bg-card">
    <div className="flex items-center space-x-4">
      <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 w-[200px] bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
        <div className="h-4 w-[150px] bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
      </div>
    </div>
    <div className="h-4 w-full bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
    <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
    <div className="flex space-x-2">
      <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
      <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonHero = () => (
  <div className="min-h-screen flex items-center justify-center px-4">
    <div className="text-center space-y-6 max-w-4xl">
      <Skeleton className="h-16 w-3/4 mx-auto" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-2/3 mx-auto" />
      <div className="flex justify-center space-x-4">
        <Skeleton className="h-12 w-32" />
        <Skeleton className="h-12 w-32" />
      </div>
    </div>
  </div>
);

export const SkeletonNavbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
    <div className="container-responsive">
      <div className="flex justify-between items-center h-16">
        <Skeleton className="h-8 w-32" />
        <div className="hidden md:flex space-x-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-16" />
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  </nav>
);