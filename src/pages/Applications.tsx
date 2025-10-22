import { useState, useEffect } from 'react';
import { useApplication } from '@/contexts/ApplicationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Building, Calendar, AlertCircle, CheckCircle, Clock, X, RefreshCw, MapPin, DollarSign, Users, Eye, Briefcase, Download } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { InternshipDetailsModal } from '@/components/InternshipDetailsModal';
import { useInternships } from '@/hooks/useInternships';
import { exportToCSV, exportToPDF } from '@/utils/exportApplications';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const ApplicationCard = ({ application, onWithdraw, getStatusIcon, getStatusColor }: any) => {
  const [selectedInternship, setSelectedInternship] = useState<any>(null);
  const [cardInternshipDetails, setCardInternshipDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { data: internshipsData } = useInternships();

  // Load internship details for card display - only once when component mounts
  useEffect(() => {
    const loadInternshipDetails = async () => {
      setLoading(true);
      
      // First try current internships list
      let details = internshipsData?.find(i => 
        i.id === application.internshipId || 
        i.title === application.internshipTitle
      );
      
      // If not found, try fetching from JSON
      if (!details && application.internshipId) {
        try {
          const response = await fetch('/internships.json');
          const allInternships = await response.json();
          details = allInternships.find((i: any) => i.id === application.internshipId);
        } catch (error) {
          // Silent error handling
        }
      }
      
      setCardInternshipDetails(details);
      setLoading(false);
    };
    
    // Only load once when application changes, not when internships list updates
    if (application.internshipId || application.internshipTitle) {
      loadInternshipDetails();
    }
  }, [application.internshipId, application.internshipTitle]); // Removed internships dependency

  const handleCardClick = () => {
    // Use already loaded card details or fallback
    const internshipForModal = cardInternshipDetails || {
      id: application.internshipId || `app-${application.id}`,
      title: application.internshipTitle,
      company: application.companyName,
      location: 'Location not available',
      type: 'Internship',
      duration: '3-6 months',
      stipend: 'Not specified',
      description: `Application for ${application.internshipTitle} position at ${application.companyName}.`,
      requirements: ['Requirements not available'],
      skills: [],
      applicationDeadline: 'Not specified',
      startDate: 'Not specified',
      pmisId: application.internshipId || `app-${application.id}`
    };
    
    setSelectedInternship(internshipForModal);
  };

  return (
    <>
      <Card 
        className="group relative overflow-hidden bg-gradient-to-br from-background to-muted/20 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] border border-border/50 hover:border-primary/30"
        onClick={handleCardClick}
      >
        {/* Status indicator line */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${
          application.status === 'accepted' ? 'bg-green-500' :
          application.status === 'rejected' ? 'bg-red-500' :
          application.status === 'interview_scheduled' ? 'bg-blue-500' :
          application.status === 'under_review' ? 'bg-purple-500' :
          application.status === 'withdrawn' ? 'bg-gray-500' :
          'bg-yellow-500'
        }`} />
        
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center ring-2 ring-primary/10 group-hover:ring-primary/20 transition-all">
                <Building className="w-7 h-7 text-primary" />
                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-background flex items-center justify-center ${
                  application.status === 'accepted' ? 'bg-green-500' :
                  application.status === 'rejected' ? 'bg-red-500' :
                  application.status === 'interview_scheduled' ? 'bg-blue-500' :
                  application.status === 'under_review' ? 'bg-purple-500' :
                  application.status === 'withdrawn' ? 'bg-gray-500' :
                  'bg-yellow-500'
                }`}>
                  {getStatusIcon(application.status)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">
                  {application.internshipTitle}
                </CardTitle>
                <p className="text-sm font-medium text-muted-foreground truncate">
                  {application.companyName}
                </p>
                <Badge variant="outline" className={`${getStatusColor(application.status)} text-xs mt-2 w-fit font-medium`}>
                  <span className="capitalize">{application.status.replace('_', ' ')}</span>
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg p-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-medium">
                {loading ? 'Loading...' : (cardInternshipDetails?.location || 'Location not available')}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="font-medium">
                  {loading ? 'Loading...' : (cardInternshipDetails?.stipend ? `₹${cardInternshipDetails.stipend}/mo` : 'Not specified')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="font-medium">
                  {loading ? 'Loading...' : (cardInternshipDetails?.duration || '3-6 months')}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Applied {application.appliedAt?.toDate?.()?.toLocaleDateString() || 'Recently'}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {(application.status !== 'accepted' && application.status !== 'rejected') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    application.id && onWithdraw(application.id);
                  }}
                  className="h-8 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  Withdraw
                </Button>
              )}
            </div>
          </div>
        </CardContent>
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </Card>
      
      {selectedInternship && (
        <InternshipDetailsModal
          internship={selectedInternship}
          isOpen={!!selectedInternship}
          onClose={() => setSelectedInternship(null)}
        />
      )}
    </>
  );
};

const Applications = () => {
  const { applications, loading, withdrawApplication, refreshApplications, applyToInternship } = useApplication();
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'interview_scheduled' | 'under_review'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser && applications.length === 0 && !loading) {
      refreshApplications().catch(err => {
        console.error('Error refreshing applications:', err);
        setError('Failed to load applications');
      });
    }
  }, [currentUser, applications.length, loading, refreshApplications]);

  const filteredApplications = applications.filter(app => 
    filter === 'all' || app.status === filter
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <X className="w-4 h-4 text-red-500" />;
      case 'withdrawn': return <AlertCircle className="w-4 h-4 text-gray-500" />;
      case 'interview_scheduled': return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'under_review': return <FileText className="w-4 h-4 text-purple-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'withdrawn': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'interview_scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'under_review': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background pt-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">My Applications</h1>
              <p className="text-muted-foreground">Track and manage your internship applications</p>
            </div>
            <div className="flex gap-2">
              {applications.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={async () => {
                      const enrichedApps = await Promise.all(filteredApplications.map(async (app) => {
                        try {
                          const response = await fetch('/internships.json');
                          const allInternships = await response.json();
                          const details = allInternships.find((i: any) => i.id === app.internshipId || i.title === app.internshipTitle);
                          return {
                            ...app,
                            location: details?.location || 'N/A',
                            stipend: details?.stipend || 'N/A'
                          } as any;
                        } catch {
                          return app as any;
                        }
                      }));
                      exportToCSV(enrichedApps as any);
                    }}>
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={async () => {
                      const enrichedApps = await Promise.all(filteredApplications.map(async (app) => {
                        try {
                          const response = await fetch('/internships.json');
                          const allInternships = await response.json();
                          const details = allInternships.find((i: any) => i.id === app.internshipId || i.title === app.internshipTitle);
                          return {
                            ...app,
                            location: details?.location || 'N/A',
                            stipend: details?.stipend || 'N/A'
                          } as any;
                        } catch {
                          return app as any;
                        }
                      }));
                      exportToPDF(enrichedApps as any);
                    }}>
                      Export as PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshApplications()}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {applications.filter(a => a.status !== 'accepted' && a.status !== 'rejected' && a.status !== 'withdrawn').length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    const withdrawableApps = applications.filter(a => a.status !== 'accepted' && a.status !== 'rejected' && a.status !== 'withdrawn');
                    if (confirm(`Withdraw ${withdrawableApps.length} applications?`)) {
                      for (const app of withdrawableApps) {
                        if (app.id) await withdrawApplication(app.id);
                      }
                    }
                  }}
                >
                  Withdraw All
                </Button>
              )}
            </div>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="overflow-x-auto scrollbar-hide">
            <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
              <TabsList className="flex w-max min-w-full gap-1 p-1">
                <TabsTrigger value="all" className="text-xs whitespace-nowrap px-3">
                  All ({applications.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-xs whitespace-nowrap px-3">
                  Pending ({applications.filter(a => a.status === 'pending').length})
                </TabsTrigger>
                <TabsTrigger value="under_review" className="text-xs whitespace-nowrap px-3">
                  Review ({applications.filter(a => a.status === 'under_review').length})
                </TabsTrigger>
                <TabsTrigger value="interview_scheduled" className="text-xs whitespace-nowrap px-3">
                  Interview ({applications.filter(a => a.status === 'interview_scheduled').length})
                </TabsTrigger>
                <TabsTrigger value="accepted" className="text-xs whitespace-nowrap px-3">
                  Accepted ({applications.filter(a => a.status === 'accepted').length})
                </TabsTrigger>
                <TabsTrigger value="rejected" className="text-xs whitespace-nowrap px-3">
                  Rejected ({applications.filter(a => a.status === 'rejected').length})
                </TabsTrigger>
                <TabsTrigger value="withdrawn" className="text-xs whitespace-nowrap px-3">
                  Withdrawn ({applications.filter(a => a.status === 'withdrawn').length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {filteredApplications.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Applications Found</h3>
              <p className="text-muted-foreground mb-4">
                {filter === 'all' 
                  ? "You haven't applied to any internships yet." 
                  : `No ${filter} applications found.`
                }
              </p>
              {!currentUser && (
                <p className="text-sm text-muted-foreground mb-4">
                  Please log in to view your applications.
                </p>
              )}
              <div className="space-y-2">
                <Button onClick={() => window.location.href = '/'}>
                  Browse Internships
                </Button>
                {currentUser && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        if (!currentUser) return;
                        try {
                          await applyToInternship({
                            id: 'test-internship-' + Date.now(),
                            title: 'Test Software Engineer Intern',
                            company: 'Test Company',
                            location: 'Remote',
                            type: 'Full-time'
                          });
                        } catch (error) {
                          console.error('Test application failed:', error);
                        }
                      }}
                    >
                      Add Test Application
                    </Button>
                    <div className="text-xs text-muted-foreground mt-2 space-y-1">
                      <div>Debug: User ID: {currentUser.uid.slice(0, 8)}...</div>
                      <div>Applications loaded: {applications.length}</div>
                      <div>Loading: {loading ? 'Yes' : 'No'}</div>
                      {error && <div className="text-red-500">Error: {error}</div>}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApplications.map((application) => (
              <ApplicationCard 
                key={application.id} 
                application={application} 
                onWithdraw={withdrawApplication}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;