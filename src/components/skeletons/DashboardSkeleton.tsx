import { Card } from "@/components/ui/card";

export const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="p-6">
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-8 bg-muted rounded w-1/3" />
          </div>
        </Card>
      ))}
    </div>
    <Card className="p-6 space-y-4">
      <div className="h-6 bg-muted rounded w-1/4" />
      <div className="h-64 bg-muted rounded" />
    </Card>
  </div>
);
