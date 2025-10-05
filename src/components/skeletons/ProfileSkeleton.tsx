import { Card } from "@/components/ui/card";

export const ProfileSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <div className="h-24 w-24 bg-muted rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
      </div>
    </Card>
    <Card className="p-6 space-y-4">
      <div className="h-6 bg-muted rounded w-1/4" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 bg-muted rounded" />
        ))}
      </div>
    </Card>
  </div>
);
