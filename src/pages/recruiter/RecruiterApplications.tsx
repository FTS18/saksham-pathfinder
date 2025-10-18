import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ApplicationService, Application } from '@/services/applicationService';
import InternshipMigrationService, { FirebaseInternship } from '@/services/internshipMigrationService';
import AdminService from '@/services/adminService';

export default function RecruiterApplications() {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [internships, setInternships] = useState<FirebaseInternship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const loadData = async () => {
      try {
        setLoading(true);

        // Check if admin
        const adminStatus = await AdminService.isAdmin(currentUser.uid);
        setIsAdmin(adminStatus);

        // Get recruiter's internships
        const internshipsData = adminStatus
          ? await InternshipMigrationService.getAllInternships()
          : await InternshipMigrationService.getRecruiterInternships(currentUser.uid);

        setInternships(internshipsData);

        // Get applications for these internships
        const internshipIds = internshipsData.map(i => i.id);
        const applicationsData = await ApplicationService.getRecruiterApplications(
          currentUser.uid,
          internshipIds
        );

        setApplications(applicationsData);
      } catch (error) {
        console.error('Error loading applications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser?.uid]);

  const getInternshipTitle = (internshipId: string) => {
    const internship = internships.find(i => i.id === internshipId);
    return internship?.title || 'Unknown Position';
  };

  const getCompanyName = (internshipId: string) => {
    const internship = internships.find(i => i.id === internshipId);
    return internship?.company || 'Unknown Company';
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      app.internshipTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending' || a.status === 'applied').length,
    accepted: applications.filter(a => a.status === 'accepted' || a.status === 'shortlisted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'shortlisted':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
      case 'withdrawn':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'withdrawn':
        return 'bg-red-100 text-red-800';
      case 'interview':
      case 'interview_scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Applications</h1>
        <p className="text-muted-foreground">Manage applications for your internships</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by position or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="shortlisted">Shortlisted</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="withdrawn">Withdrawn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              {searchTerm || statusFilter !== 'all'
                ? 'No applications match your filters'
                : 'No applications received yet'}
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {application.internshipTitle || getInternshipTitle(application.internshipId)}
                      </h3>
                      <Badge className={getStatusColor(application.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(application.status)}
                          {application.status}
                        </span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {application.companyName || getCompanyName(application.internshipId)}
                    </p>
                    
                    {application.notes && (
                      <div className="mb-3 p-3 bg-muted rounded text-sm">
                        <p className="font-medium mb-1">Notes:</p>
                        <p>{application.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-4 text-sm text-muted-foreground">
                      {application.appliedAt && (
                        <span>
                          Applied: {new Date(application.appliedAt).toLocaleDateString()}
                        </span>
                      )}
                      {application.updatedAt && (
                        <span>
                          Updated: {new Date(application.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
