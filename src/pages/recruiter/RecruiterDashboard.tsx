import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp,
  Plus,
  Eye,
  MessageSquare,
  Calendar
} from 'lucide-react';

export default function RecruiterDashboard() {
  const stats = [
    { title: 'Active Jobs', value: '12', icon: Briefcase, change: '+2 this week' },
    { title: 'Total Applications', value: '284', icon: FileText, change: '+45 this week' },
    { title: 'Candidates', value: '156', icon: Users, change: '+23 this week' },
    { title: 'Interviews Scheduled', value: '8', icon: Calendar, change: '+3 this week' },
  ];

  const recentJobs = [
    { title: 'Senior React Developer', applications: 45, status: 'Active', posted: '2 days ago' },
    { title: 'Product Manager', applications: 32, status: 'Active', posted: '5 days ago' },
    { title: 'UI/UX Designer', applications: 28, status: 'Paused', posted: '1 week ago' },
    { title: 'Backend Engineer', applications: 67, status: 'Active', posted: '3 days ago' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
          <p className="text-muted-foreground">Manage your job postings and candidates</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Post New Job
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Job Postings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentJobs.map((job, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">Posted {job.posted}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="font-semibold">{job.applications}</div>
                    <div className="text-xs text-muted-foreground">Applications</div>
                  </div>
                  <Badge variant={job.status === 'Active' ? 'default' : 'secondary'}>
                    {job.status}
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}