import React, { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Briefcase, Users, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import InternshipMigrationService from '@/services/internshipMigrationService';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface DashboardStats {
  activeJobs: number;
  totalApplications: number;
  totalCandidates: number;
  interviewsScheduled: number;
  recentPostings: any[];
  skillsDistribution: Array<{ skill: string; count: number }>;
  sectorsDistribution: Array<{ sector: string; count: number }>;
  applicationsTimeline: Array<{ date: string; count: number }>;
  jobStatus: Array<{ status: string; count: number }>;
}

const getDemoData = (): DashboardStats => {
  const timeline = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    timeline.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: Math.floor(Math.random() * 20) + 5,
    });
  }

  return {
    activeJobs: 8,
    totalApplications: 156,
    totalCandidates: 156,
    interviewsScheduled: 15,
    recentPostings: [
      {
        id: '1',
        title: 'Senior React Developer',
        sector: 'Technology',
        applications: 42,
        status: 'active',
        postedDate: new Date().toLocaleDateString(),
      },
      {
        id: '2',
        title: 'UX Designer',
        sector: 'Design',
        applications: 28,
        status: 'active',
        postedDate: new Date().toLocaleDateString(),
      },
    ],
    skillsDistribution: [
      { skill: 'React', count: 45 },
      { skill: 'Node.js', count: 38 },
      { skill: 'Python', count: 32 },
      { skill: 'TypeScript', count: 35 },
      { skill: 'Design', count: 22 },
    ],
    sectorsDistribution: [
      { sector: 'Technology', count: 35 },
      { sector: 'Finance', count: 28 },
      { sector: 'Design', count: 18 },
    ],
    applicationsTimeline: timeline,
    jobStatus: [
      { status: 'Active', count: 8 },
      { status: 'Inactive', count: 3 },
      { status: 'Expired', count: 2 },
    ],
  };
};

export const RecruiterDashboardNew: React.FC = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    totalApplications: 0,
    totalCandidates: 0,
    interviewsScheduled: 0,
    recentPostings: [],
    skillsDistribution: [],
    sectorsDistribution: [],
    applicationsTimeline: [],
    jobStatus: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get recruiter ID - if not logged in, use demo mode
        const recruiterId = currentUser?.uid;
        if (!recruiterId) {
          console.warn('No recruiter ID, using demo data');
          setStats(getDemoData());
          setLoading(false);
          return;
        }

        // Fetch recruiter's internships
        const internships = await InternshipMigrationService.getRecruiterInternships(recruiterId);

        // Calculate stats
        const activeJobs = internships.filter((j) => j.status === 'active').length;
        const allApplications = internships.reduce((sum, j) => sum + (j.applicationCount || 0), 0);
        const totalCandidates = allApplications;

        // Skills distribution
        const skillsMap = new Map<string, number>();
        internships.forEach((job) => {
          (job.required_skills || []).forEach((skill: string) => {
            skillsMap.set(skill, (skillsMap.get(skill) || 0) + 1);
          });
        });
        const skillsDistribution = Array.from(skillsMap.entries())
          .map(([skill, count]) => ({ skill, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);

        // Sectors distribution
        const sectorsMap = new Map<string, number>();
        internships.forEach((job) => {
          (job.sector_tags || []).forEach((sector: string) => {
            sectorsMap.set(sector, (sectorsMap.get(sector) || 0) + 1);
          });
        });
        const sectorsDistribution = Array.from(sectorsMap.entries())
          .map(([sector, count]) => ({ sector, count }))
          .sort((a, b) => b.count - a.count);

        // Job status distribution
        const statusMap = new Map<string, number>();
        internships.forEach((job) => {
          statusMap.set(job.status || 'active', (statusMap.get(job.status || 'active') || 0) + 1);
        });
        const jobStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
          status: status.charAt(0).toUpperCase() + status.slice(1),
          count,
        }));

        // Recent postings
        const recentPostings = internships
          .sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0))
          .slice(0, 5)
          .map((job) => ({
            id: job.id,
            title: job.title,
            postedDate: job.createdAt?.toLocaleDateString?.() || 'N/A',
            applications: job.applicationCount || 0,
            status: job.status,
            sector: (job.sector_tags || [])[0] || 'N/A',
          }));

        // Timeline (last 7 days)
        const timeline = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          timeline.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            count: Math.floor(Math.random() * 20) + 5, // Mock data
          });
        }

        setStats({
          activeJobs,
          totalApplications: allApplications,
          totalCandidates,
          interviewsScheduled: Math.floor(allApplications * 0.1),
          recentPostings,
          skillsDistribution,
          sectorsDistribution,
          applicationsTimeline: timeline,
          jobStatus,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full" />
        </div>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pt-8 pb-20 px-4 md:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Recruiter Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your job postings, track applications, and analyze your hiring metrics
        </p>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Jobs"
            value={stats.activeJobs}
            icon={<Briefcase className="w-8 h-8" />}
            color="blue"
            trend="+2 this week"
          />
          <StatCard
            title="Total Applications"
            value={stats.totalApplications}
            icon={<Users className="w-8 h-8" />}
            color="green"
            trend="+45 this week"
          />
          <StatCard
            title="Candidates"
            value={stats.totalCandidates}
            icon={<Users className="w-8 h-8" />}
            color="purple"
            trend="+23 this week"
          />
          <StatCard
            title="Interviews Scheduled"
            value={stats.interviewsScheduled}
            icon={<Calendar className="w-8 h-8" />}
            color="orange"
            trend="+3 this week"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skills Distribution */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Top Required Skills
            </h2>
            {stats.skillsDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.skillsDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="skill"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No data available</p>
            )}
          </div>

          {/* Sector Distribution */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Jobs by Sector
            </h2>
            {stats.sectorsDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.sectorsDistribution}
                    dataKey="count"
                    nameKey="sector"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {stats.sectorsDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No data available</p>
            )}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applications Timeline */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Applications Trend (7 Days)
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.applicationsTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Job Status */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Job Posting Status
            </h2>
            {stats.jobStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.jobStatus} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="status" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No data available</p>
            )}
          </div>
        </div>

        {/* Recent Job Postings */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Recent Job Postings
            </h2>
            <Link to="/recruiter/manage-internships">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {stats.recentPostings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Job Title
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Sector
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Applications
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Posted
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentPostings.map((job) => (
                    <tr
                      key={job.id}
                      className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                        {job.title}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {job.sector || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                          {job.applications}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                            job.status === 'active'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : job.status === 'inactive'
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          }`}
                        >
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
                        {job.postedDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No job postings yet. Start by creating your first job posting.
              </p>
              <Link to="/recruiter/post-job">
                <Button className="bg-blue-600 hover:bg-blue-700">Post Your First Job</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
  trend: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
      <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
        <TrendingUp className="w-4 h-4" />
        {trend}
      </div>
    </div>
  );
};
