import { TrendingUp, Users, FileText, Clock } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard = ({ title, value, change, icon, trend = 'neutral' }: StatCardProps) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
        {change && (
          <p className={`text-sm mt-1 flex items-center gap-1 ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend === 'up' && <TrendingUp size={16} />}
            {change}
          </p>
        )}
      </div>
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        {icon}
      </div>
    </div>
  </div>
);

interface DashboardStatsProps {
  stats: {
    totalApplications: number;
    activePostings: number;
    averageSmartScore: number;
    timeSaved: string;
  };
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Applications"
        value={stats.totalApplications}
        change="+12% from last month"
        trend="up"
        icon={<Users className="text-blue-600" size={24} />}
      />
      <StatCard
        title="Active Postings"
        value={stats.activePostings}
        change="3 expiring soon"
        trend="neutral"
        icon={<FileText className="text-green-600" size={24} />}
      />
      <StatCard
        title="Avg Smart Score"
        value={`${stats.averageSmartScore}/100`}
        change="+5 points this week"
        trend="up"
        icon={<TrendingUp className="text-purple-600" size={24} />}
      />
      <StatCard
        title="Time Saved by AI"
        value={stats.timeSaved}
        change="vs manual screening"
        trend="up"
        icon={<Clock className="text-orange-600" size={24} />}
      />
    </div>
  );
};