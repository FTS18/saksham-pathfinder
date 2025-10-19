import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApplication } from '@/contexts/ApplicationContext';
import { ApplicationService } from '@/services/applicationService';
import { NotificationService } from '@/services/notificationService';

/**
 * Hook to monitor application status changes and notify user
 * Checks Firestore for status updates periodically
 */
export const useApplicationStatusWatcher = () => {
  const { currentUser } = useAuth();
  const { applications, refreshApplications } = useApplication();

  useEffect(() => {
    if (!currentUser || applications.length === 0) return;

    // Store last known statuses to detect changes
    const lastStatusMap = new Map(applications.map(app => [app.id, app.status]));

    const checkStatusUpdates = async () => {
      try {
        const updatedApplications = await ApplicationService.getUserApplications(currentUser.uid);

        // Check for status changes
        updatedApplications.forEach((app: any) => {
          const lastStatus = lastStatusMap.get(app.id);
          
          if (lastStatus && lastStatus !== app.status) {
            // Status has changed!
            const statusMessages: { [key: string]: string } = {
              'shortlisted': `🎉 Great news! You've been shortlisted for ${app.companyName}`,
              'interview': `📅 Interview scheduled for your application at ${app.companyName}`,
              'interview_scheduled': `📅 Interview scheduled for your application at ${app.companyName}`,
              'accepted': `🏆 Congratulations! You've been accepted by ${app.companyName}`,
              'rejected': `Your application to ${app.companyName} was not selected this time`,
              'under_review': `👀 Your application to ${app.companyName} is under review`,
            };

            const message = statusMessages[app.status] || `Your application status has been updated to: ${app.status}`;

            // Send notification to Firestore
            NotificationService.createNotification({
              userId: currentUser.uid,
              type: 'application_update',
              title: `Application Status Update`,
              message,
              read: false,
              priority: 'high',
              category: 'application',
              data: {
                applicationId: app.id,
                companyName: app.companyName,
              }
            }).catch(err => console.error('Failed to create notification:', err));

            // Send browser notification if available
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Saksham Pathfinder', {
                body: message,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
              });
            }

            // Update last known status
            lastStatusMap.set(app.id, app.status);
          }
        });
      } catch (error) {
        console.error('Error checking application status updates:', error);
      }
    };

    // Check for updates every 30 seconds when user has applications
    const intervalId = setInterval(checkStatusUpdates, 30000);

    return () => clearInterval(intervalId);
  }, [currentUser, applications]);
};
