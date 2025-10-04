import { useState } from 'react';
import { useApplication } from '@/contexts/ApplicationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Building, Calendar, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const Applications = () => {
  const { applications, loading, withdrawApplication } = useApplication();
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  const filteredApplications = applications.filter(app => 
    filter === 'all' || app.status === filter
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <X className="w-4 h-4 text-red-500" />;
      case 'withdrawn': return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'withdrawn': return 'bg-gray-100 text-gray-800 border-gray-200';
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
          <h1 className="text-3xl font-bold text-foreground mb-2">My Applications</h1>
          <p className="text-muted-foreground">Track and manage your internship applications</p>
        </div>

        <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({applications.filter(a => a.status === 'pending').length})</TabsTrigger>
            <TabsTrigger value="accepted">Accepted ({applications.filter(a => a.status === 'accepted').length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({applications.filter(a => a.status === 'rejected').length})</TabsTrigger>
          </TabsList>
        </Tabs>

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
              <Button onClick={() => window.location.href = '/'}>
                Browse Internships
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{application.internshipTitle}</CardTitle>
                        <p className="text-muted-foreground">{application.companyName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(application.status)}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1 capitalize">{application.status}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Applied: {application.appliedAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                      </div>
                      {application.updatedAt && application.appliedAt !== application.updatedAt && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Updated: {application.updatedAt?.toDate?.()?.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    {application.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => application.id && withdrawApplication(application.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Withdraw
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;