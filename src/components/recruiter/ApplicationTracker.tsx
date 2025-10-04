import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Download, Eye, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Application {
  id: string;
  internshipId: string;
  internshipTitle: string;
  company: string;
  applicantName: string;
  applicantEmail: string;
  appliedDate: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  resume?: string;
  coverLetter?: string;
  skills: string[];
  experience: string;
  education: string;
}

export const ApplicationTracker = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState('all');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      // Real application data based on candidates
      const mockApplications: Application[] = [
        {
          id: '1',
          internshipId: 'int1',
          internshipTitle: 'Software Developer Intern',
          company: 'Infosys',
          applicantName: 'Arjun Sharma',
          applicantEmail: 'arjun.sharma@gmail.com',
          appliedDate: '2025-01-15',
          status: 'pending',
          skills: ['React', 'Node.js', 'Python', 'MongoDB', 'AWS'],
          experience: '1.5 years',
          education: 'B.Tech Computer Science - VIT University'
        },
        {
          id: '2',
          internshipId: 'int4',
          internshipTitle: 'Marketing Intern',
          company: 'HUL',
          applicantName: 'Priya Patel',
          applicantEmail: 'priya.patel@gmail.com',
          appliedDate: '2025-01-14',
          status: 'accepted',
          skills: ['Digital Marketing', 'SEO', 'Content Strategy', 'Analytics'],
          experience: '2 years',
          education: 'MBA Marketing - IIM Ahmedabad'
        },
        {
          id: '3',
          internshipId: 'int7',
          internshipTitle: 'Network Engineering Intern',
          company: 'Reliance Jio',
          applicantName: 'Arjun Sharma',
          applicantEmail: 'arjun.sharma@gmail.com',
          appliedDate: '2025-01-10',
          status: 'accepted',
          skills: ['Networking', 'Troubleshooting', 'IoT', '5G'],
          experience: '1.5 years',
          education: 'B.Tech Computer Science - VIT University'
        },
        {
          id: '4',
          internshipId: 'int2',
          internshipTitle: 'Financial Analyst Intern',
          company: 'HDFC Bank',
          applicantName: 'Rohit Kumar',
          applicantEmail: 'rohit.kumar@gmail.com',
          appliedDate: '2025-01-12',
          status: 'pending',
          skills: ['Financial Analysis', 'Excel', 'PowerBI', 'Accounting'],
          experience: '1 year',
          education: 'B.Com Finance - Delhi University'
        },
        {
          id: '5',
          internshipId: 'int8',
          internshipTitle: 'Audit Intern',
          company: 'PwC',
          applicantName: 'Rohit Kumar',
          applicantEmail: 'rohit.kumar@gmail.com',
          appliedDate: '2025-01-08',
          status: 'rejected',
          skills: ['Auditing', 'Risk Assessment', 'Financial Analysis'],
          experience: '1 year',
          education: 'B.Com Finance - Delhi University'
        },
        {
          id: '6',
          internshipId: 'int3',
          internshipTitle: 'Automotive Engineering Intern',
          company: 'Maruti Suzuki',
          applicantName: 'Sneha Reddy',
          applicantEmail: 'sneha.reddy@gmail.com',
          appliedDate: '2025-01-11',
          status: 'pending',
          skills: ['AutoCAD', 'SolidWorks', 'Project Management', 'Quality Control'],
          experience: '6 months',
          education: 'B.Tech Mechanical - BITS Pilani'
        },
        {
          id: '7',
          internshipId: 'int5',
          internshipTitle: 'Civil Engineering Intern',
          company: 'L&T',
          applicantName: 'Vikash Singh',
          applicantEmail: 'vikash.singh@gmail.com',
          appliedDate: '2025-01-09',
          status: 'accepted',
          skills: ['Civil Engineering', 'Project Management', 'AutoCAD', 'Construction'],
          experience: '1.2 years',
          education: 'B.Tech Civil Engineering - IIT Madras'
        },
        {
          id: '8',
          internshipId: 'int6',
          internshipTitle: 'Hospital Operations Intern',
          company: 'Apollo Hospitals',
          applicantName: 'Ananya Gupta',
          applicantEmail: 'ananya.gupta@gmail.com',
          appliedDate: '2025-01-13',
          status: 'pending',
          skills: ['Healthcare Administration', 'Patient Relations', 'Data Entry'],
          experience: '8 months',
          education: 'BBA Healthcare Management - Symbiosis'
        }
      ];
      setApplications(mockApplications);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: Application['status']) => {
    try {
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      // TODO: Update in backend
    } catch (error) {
      console.error('Failed to update application status:', error);
    }
  };

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'withdrawn':
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.internshipTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesTab = selectedTab === 'all' || app.status === selectedTab;
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  const getApplicationStats = () => {
    return {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      accepted: applications.filter(app => app.status === 'accepted').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
    };
  };

  const stats = getApplicationStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Applications</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            <div className="text-sm text-muted-foreground">Accepted</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="withdrawn">Withdrawn</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="accepted">Accepted ({stats.accepted})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{application.applicantName}</h3>
                      <Badge className={getStatusColor(application.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(application.status)}
                          {application.status}
                        </div>
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-2">{application.applicantEmail}</p>
                    <p className="font-medium mb-2">{application.internshipTitle} at {application.company}</p>
                    <p className="text-sm text-muted-foreground mb-3">Applied on {new Date(application.appliedDate).toLocaleDateString()}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Skills</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {application.skills.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Experience</p>
                        <p className="text-sm">{application.experience}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Education</p>
                        <p className="text-sm">{application.education}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {application.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateApplicationStatus(application.id, 'accepted')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateApplicationStatus(application.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredApplications.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No applications found matching your criteria.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};