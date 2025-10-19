import { Application } from '@/services/applicationService';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface ApplicationTimelineProps {
  application: Application;
}

export const ApplicationTimeline = ({ application }: ApplicationTimelineProps) => {
  // Mock timeline data - in production, this would come from statusHistory in the application
  const getTimelineEvents = () => {
    const events = [
      {
        date: application.appliedAt,
        status: 'Application Submitted',
        message: 'Your application was successfully submitted',
        icon: 'applied',
        completed: true,
      },
    ];

    // Add status progression based on current status
    const statusProgression: { [key: string]: Array<{ status: string; message: string; icon: string }> } = {
      pending: [
        { status: 'Under Review', message: 'Your application is being reviewed by the team', icon: 'clock' },
      ],
      'in-review': [
        { status: 'Under Review', message: 'Your application is being reviewed by the team', icon: 'clock' },
      ],
      'under_review': [
        { status: 'Under Review', message: 'Your application is being reviewed by the team', icon: 'clock' },
      ],
      shortlisted: [
        { status: 'Under Review', message: 'Your application is being reviewed by the team', icon: 'clock' },
        { status: 'Shortlisted', message: 'Congratulations! You have been shortlisted', icon: 'check' },
      ],
      interview: [
        { status: 'Under Review', message: 'Your application is being reviewed by the team', icon: 'clock' },
        { status: 'Shortlisted', message: 'Congratulations! You have been shortlisted', icon: 'check' },
        { status: 'Interview Call', message: 'An interview has been scheduled for you', icon: 'calendar' },
      ],
      interview_scheduled: [
        { status: 'Under Review', message: 'Your application is being reviewed by the team', icon: 'clock' },
        { status: 'Shortlisted', message: 'Congratulations! You have been shortlisted', icon: 'check' },
        { status: 'Interview Call', message: 'An interview has been scheduled for you', icon: 'calendar' },
      ],
      accepted: [
        { status: 'Under Review', message: 'Your application is being reviewed by the team', icon: 'clock' },
        { status: 'Shortlisted', message: 'Congratulations! You have been shortlisted', icon: 'check' },
        { status: 'Interview Call', message: 'An interview has been scheduled for you', icon: 'calendar' },
        { status: 'Accepted', message: 'Congratulations! Your application has been accepted', icon: 'accepted' },
      ],
      rejected: [
        { status: 'Under Review', message: 'Your application is being reviewed by the team', icon: 'clock' },
        { status: 'Rejected', message: 'Unfortunately, your application was not selected', icon: 'rejected' },
      ],
      withdrawn: [
        { status: 'Withdrawn', message: 'You have withdrawn your application', icon: 'rejected' },
      ],
    };

    const progressionEvents = statusProgression[application.status] || [];
    progressionEvents.forEach((event, index) => {
      events.push({
        date: null,
        status: event.status,
        message: event.message,
        icon: event.icon,
        completed: index < progressionEvents.length - 1 || 
                   (application.status !== 'pending' && application.status !== 'in-review' && application.status !== 'under_review'),
      });
    });

    return events;
  };

  const events = getTimelineEvents();

  const getIconComponent = (icon: string) => {
    const iconProps = 'w-5 h-5';
    switch (icon) {
      case 'applied':
        return <CheckCircle className={`${iconProps} text-blue-600`} />;
      case 'check':
        return <CheckCircle className={`${iconProps} text-green-600`} />;
      case 'accepted':
        return <CheckCircle className={`${iconProps} text-green-600`} />;
      case 'rejected':
        return <XCircle className={`${iconProps} text-red-600`} />;
      case 'calendar':
        return <Calendar className={`${iconProps} text-purple-600`} />;
      case 'clock':
        return <Clock className={`${iconProps} text-yellow-600`} />;
      default:
        return <AlertCircle className={`${iconProps} text-gray-600`} />;
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    const d = date.toDate?.() || new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="relative">
      <div className="space-y-6">
        {events.map((event, index) => (
          <div key={index} className="flex gap-4">
            {/* Timeline line and dot */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                event.completed 
                  ? 'bg-primary/20' 
                  : 'bg-muted'
              }`}>
                {getIconComponent(event.icon)}
              </div>
              {index < events.length - 1 && (
                <div className={`w-0.5 h-12 ${event.completed ? 'bg-primary/30' : 'bg-muted'}`}></div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <div className="flex items-start justify-between mb-1">
                <h4 className="font-semibold text-foreground">{event.status}</h4>
                {event.date && (
                  <span className="text-xs text-muted-foreground">{formatDate(event.date)}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{event.message}</p>
              {event.completed && index < events.length - 1 && (
                <Badge variant="outline" className="mt-2 text-xs">
                  Completed
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
