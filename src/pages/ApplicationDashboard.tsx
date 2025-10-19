import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApplication } from '@/contexts/ApplicationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Calendar, Building2, CheckCircle, Clock, XCircle, Trash2, Eye, Download } from 'lucide-react';
import { Application } from '@/services/applicationService';
import { ApplicationDetailsModal } from '@/components/ApplicationDetailsModal';
import { fetchInternships } from '@/lib/dataExtractor';
import { Internship } from '@/types';
import { useNavigate } from 'react-router-dom';

export const ApplicationDashboard = () => {
  const { currentUser } = useAuth();
  const { applications, loading, withdrawApplication, refreshApplications } = useApplication();
  const [internships, setInternships] = useState<Map<string, Internship>>(new Map());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      refreshApplications();
      loadInternships();
    }
  }, [currentUser]);

  const loadInternships = async () => {
    try {
      const data = await fetchInternships();
      const map = new Map<string, Internship>();
      data.forEach((internship: Internship) => {
        map.set(internship.id, internship);
      });
      setInternships(map);
    } catch (error) {
      console.error('Error loading internships:', error);
    }
  };

  // Group applications by status
  const groupedApplications = (status: string | null) => {
    let filtered = applications;

    if (status && status !== 'all') {
      filtered = applications.filter(app => app.status === status);
    }

    return filtered.sort((a, b) => {
      const dateA = a.appliedAt?.toDate?.() || new Date(0);
      const dateB = b.appliedAt?.toDate?.() || new Date(0);
      return sortBy === 'recent' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    });
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      'applied': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      'in-review': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      'under_review': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      'shortlisted': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
      'interview': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
      'interview_scheduled': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
      'accepted': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      'rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
      'withdrawn': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const iconProps = 'w-4 h-4';
    switch (status) {
      case 'accepted':
        return <CheckCircle className={iconProps + ' text-green-600'} />;
      case 'rejected':
        return <XCircle className={iconProps + ' text-red-600'} />;
      case 'interview':
      case 'interview_scheduled':
        return <Calendar className={iconProps + ' text-purple-600'} />;
      case 'shortlisted':
        return <CheckCircle className={iconProps + ' text-purple-600'} />;
      default:
        return <Clock className={iconProps + ' text-yellow-600'} />;
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date.toDate?.() || new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const statusTabs = [
    { value: 'all', label: 'All', count: applications.length },
    { value: 'pending', label: 'Pending', count: applications.filter(a => a.status === 'pending').length },
    { value: 'shortlisted', label: 'Shortlisted', count: applications.filter(a => a.status === 'shortlisted').length },
    { value: 'interview', label: 'Interview', count: applications.filter(a => ['interview', 'interview_scheduled'].includes(a.status)).length },
    { value: 'accepted', label: 'Accepted', count: applications.filter(a => a.status === 'accepted').length },
    { value: 'rejected', label: 'Rejected', count: applications.filter(a => a.status === 'rejected').length },
  ];

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-center text-muted-foreground mb-6">Please log in to view your applications.</p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredApps = groupedApplications(statusFilter);
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Application Dashboard</h1>
          <p className="text-muted-foreground">Track and manage all your internship applications</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary mb-2">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Applications</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600 mb-2">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">{stats.accepted}</p>
                <p className="text-sm text-muted-foreground">Accepted</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600 mb-2">{stats.rejected}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Controls */}
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
                {statusTabs.map(tab => (
                  <TabsTrigger key={tab.value} value={tab.value} className="text-xs md:text-sm">
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.slice(0, 3)}</span>
                    <Badge variant="secondary" className="ml-1">{tab.count}</Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="flex gap-2">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'oldest')}
                className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredApps.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredApps.map(application => {
              const internship = internships.get(application.internshipId);
              const appliedDate = formatDate(application.appliedAt);
              const updatedDate = formatDate(application.updatedAt);

              return (
                <Card key={application.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Left: Application Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex-shrink-0">
                            {getStatusIcon(application.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">
                              {application.internshipTitle}
                            </h3>
                            <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                              <Building2 className="w-3 h-3" />
                              <span>{application.companyName}</span>
                            </div>
                          </div>
                        </div>

                        {/* Application Info */}
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Applied: {appliedDate}</span>
                          </div>
                          {application.updatedAt && appliedDate !== updatedDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Updated: {updatedDate}</span>
                            </div>
                          )}
                          {application.priority && (
                            <Badge variant="outline" className="text-xs capitalize">
                              {application.priority} Priority
                            </Badge>
                          )}
                        </div>

                        {/* Notes if available */}
                        {application.notes && (
                          <p className="text-xs text-muted-foreground mt-3 italic">
                            Note: {application.notes}
                          </p>
                        )}
                      </div>

                      {/* Right: Status and Actions */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <Badge className={`${getStatusColor(application.status)} px-3 py-1 capitalize`}>
                          {application.status.replace(/_/g, ' ')}
                        </Badge>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedApplication(application);
                              setIsDetailsModalOpen(true);
                            }}
                            title="View application details"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline ml-1">View</span>
                          </Button>

                          {internship?.apply_link && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(internship.apply_link, '_blank')}
                              title="Open internship link"
                            >
                              <Building2 className="w-4 h-4" />
                              <span className="hidden sm:inline ml-1">Link</span>
                            </Button>
                          )}

                          {application.status === 'pending' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={async () => {
                                if (application.id && confirm('Are you sure you want to withdraw this application?')) {
                                  await withdrawApplication(application.id);
                                }
                              }}
                              title="Withdraw application"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="hidden sm:inline ml-1">Withdraw</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Applications</h3>
                <p className="text-muted-foreground mb-6">
                  {statusFilter !== 'all' 
                    ? `No applications with "${statusFilter}" status`
                    : 'You haven\'t applied to any internships yet. Start exploring and apply now!'}
                </p>
                <Button onClick={() => navigate('/')} className="hover:scale-105 transition-transform">
                  Browse Internships
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Application Tips */}
        <div className="mt-12 bg-primary/5 border border-primary/20 rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-3">💡 Application Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Keep track of your applications to manage your pipeline effectively</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Check application status regularly for updates and next steps</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Update your profile to improve your chances of getting selected</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Apply early for better visibility in recruiters' pipelines</span>
            </li>
          </ul>
        </div>

        {/* Application Details Modal */}
        {selectedApplication && (
          <ApplicationDetailsModal
            application={selectedApplication}
            internship={internships.get(selectedApplication.internshipId) || null}
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            onWithdraw={async () => {
              if (selectedApplication.id) {
                await withdrawApplication(selectedApplication.id);
                setIsDetailsModalOpen(false);
                await refreshApplications();
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ApplicationDashboard;
