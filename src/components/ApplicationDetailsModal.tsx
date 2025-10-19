import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ApplicationTimeline } from './ApplicationTimeline';
import { Application } from '@/services/applicationService';
import { Internship } from '@/types';
import { Building2, Calendar, Briefcase, X } from 'lucide-react';

interface ApplicationDetailsModalProps {
  application: Application | null;
  internship: Internship | null;
  isOpen: boolean;
  onClose: () => void;
  onWithdraw?: () => void;
}

export const ApplicationDetailsModal = ({
  application,
  internship,
  isOpen,
  onClose,
  onWithdraw,
}: ApplicationDetailsModalProps) => {
  if (!application) return null;

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

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date.toDate?.() || new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{application.internshipTitle}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-2">
                <Building2 className="w-4 h-4" />
                {application.companyName}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Current Status</p>
                  <Badge className={`${getStatusColor(application.status)} capitalize`}>
                    {application.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Applied On</p>
                  <p className="font-semibold text-foreground">{formatDate(application.appliedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Details */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Application Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Applied Date</p>
                <p className="font-semibold text-foreground">{formatDate(application.appliedAt)}</p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
                <p className="font-semibold text-foreground">{formatDate(application.updatedAt)}</p>
              </div>

              {application.priority && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Priority</p>
                  <Badge variant="outline" className="capitalize">
                    {application.priority} Priority
                  </Badge>
                </div>
              )}

              {application.source && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Source</p>
                  <p className="font-semibold text-foreground capitalize">{application.source}</p>
                </div>
              )}
            </div>

            {application.notes && (
              <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Notes</p>
                <p className="text-sm text-foreground">{application.notes}</p>
              </div>
            )}
          </div>

          {/* Application Timeline */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Application Timeline</h3>
            <Card>
              <CardContent className="pt-6">
                <ApplicationTimeline application={application} />
              </CardContent>
            </Card>
          </div>

          {/* Internship Info */}
          {internship && (
            <div>
              <h3 className="font-semibold text-foreground mb-4">Internship Information</h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3 text-sm">
                    {internship.location && (
                      <div className="flex gap-2">
                        <span className="text-muted-foreground min-w-fit">Location:</span>
                        <span className="text-foreground">
                          {typeof internship.location === 'string' 
                            ? internship.location 
                            : internship.location.city}
                        </span>
                      </div>
                    )}
                    {internship.stipend && (
                      <div className="flex gap-2">
                        <span className="text-muted-foreground min-w-fit">Stipend:</span>
                        <span className="text-foreground">{internship.stipend}</span>
                      </div>
                    )}
                    {internship.duration && (
                      <div className="flex gap-2">
                        <span className="text-muted-foreground min-w-fit">Duration:</span>
                        <span className="text-foreground">{internship.duration}</span>
                      </div>
                    )}
                    {internship.work_mode && (
                      <div className="flex gap-2">
                        <span className="text-muted-foreground min-w-fit">Work Mode:</span>
                        <span className="text-foreground">{internship.work_mode}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {application.status === 'pending' && onWithdraw && (
              <Button variant="destructive" onClick={onWithdraw}>
                Withdraw Application
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
