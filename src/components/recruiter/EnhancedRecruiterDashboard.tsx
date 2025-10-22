import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Eye,
  FileText,
  Users,
  TrendingUp,
  Loader,
  RefreshCw,
  Plus,
} from "lucide-react";
import { RecruiterService } from "@/services/recruiterService";
import { RecruiterDashboardStats } from "@/types";

interface DashboardStatsProps {
  onCreateInternship?: () => void;
}

export const RecruiterDashboard = ({
  onCreateInternship,
}: DashboardStatsProps) => {
  const [stats, setStats] = useState<RecruiterDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const analytics = await RecruiterService.getRecruiterAnalytics();
      setStats(analytics);
    } catch (err: any) {
      setError(err.message || "Failed to fetch analytics");
      console.error("Error fetching analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error || "Failed to load dashboard statistics"}
      </div>
    );
  }

  // Prepare chart data
  const statusData = Object.entries(stats.statusBreakdown).map(
    ([status, count]) => ({
      name:
        status.charAt(0).toUpperCase() +
        status.slice(1).replace("_", " "),
      value: count,
    })
  );

  const conversionRate = parseFloat(
    typeof stats.conversionRate === "string"
      ? stats.conversionRate
      : stats.conversionRate.toString()
  );

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Recruiter Dashboard</h2>
        <div className="flex gap-2">
          <Button
            onClick={fetchAnalytics}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={onCreateInternship}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Internship
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Internships */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Internships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {stats.totalInternships}
              </div>
              <FileText className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Total Views */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.totalViews}</div>
              <Eye className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Total Applications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {stats.totalApplications}
              </div>
              <Users className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{conversionRate}%</div>
              <TrendingUp className="w-8 h-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Status Breakdown */}
        {statusData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Application Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-600">Avg. Applications per Job</span>
                <span className="font-bold text-lg">
                  {stats.totalInternships > 0
                    ? Math.round(
                        stats.totalApplications / stats.totalInternships
                      )
                    : 0}
                </span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-600">Total Reach</span>
                <span className="font-bold text-lg">{stats.totalViews}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Engagement Rate</span>
                <span className="font-bold text-lg">{conversionRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown Table */}
      {statusData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Status Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {statusData.map((item, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">{item.name}</div>
                  <div className="text-2xl font-bold">{item.value}</div>
                  <div className="text-xs text-gray-500 mt-2">
                    {stats.totalApplications > 0
                      ? (
                          ((item.value / stats.totalApplications) * 100).toFixed(
                            1
                          ) + "%"
                        )
                      : "0%"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Optimization Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 space-y-2">
          <p>
            • Post more internships to increase views and applications
          </p>
          <p>
            • Respond quickly to applications to improve conversion rates
          </p>
          <p>
            • Add detailed descriptions and requirements to attract qualified
            candidates
          </p>
          <p>
            • Use relevant skills tags to increase visibility in searches
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
