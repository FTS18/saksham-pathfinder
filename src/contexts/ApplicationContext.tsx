import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApplicationService, Application } from '@/services/applicationService';
import { NotificationService } from '@/services/notificationService';
import { useAuth } from './AuthContext';

interface ApplicationContextType {
  applications: Application[];
  loading: boolean;
  applyToInternship: (internship: any) => Promise<void>;
  withdrawApplication: (applicationId: string) => Promise<void>;
  refreshApplications: () => Promise<void>;
  hasApplied: (internshipId: string) => boolean;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const refreshApplications = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const userApplications = await ApplicationService.getUserApplications(currentUser.uid);
      setApplications(userApplications);
    } catch (error) {
      console.error('Error refreshing applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyToInternship = async (internship: any) => {
    if (!currentUser) {
      console.warn("Login required to apply");
      return;
    }

    // Check if already applied
    if (hasApplied(internship.id)) {
      console.warn("Already applied to this internship");
      return;
    }

    try {
      setLoading(true);
      const applicationId = await ApplicationService.applyToInternship({
        userId: currentUser.uid,
        internshipId: internship.id,
        internshipTitle: internship.title,
        companyName: internship.company,
        status: 'pending',
        priority: 'medium',
        source: 'direct',
        metadata: {},
        // Just store internship ID for fetching details later
        // internshipData removed to simplify and fetch from source
      });

      if (!applicationId) {
        throw new Error('Failed to create application');
      }

      // Create notification
      await NotificationService.createNotification({
        userId: currentUser.uid,
        type: 'application_update',
        title: 'Application Submitted',
        message: `Your application for ${internship.title} at ${internship.company} has been submitted successfully!`,
        read: false,
        priority: 'medium',
        category: 'application',
        data: { internshipId: internship.id, applicationId, companyName: internship.company }
      });

      console.log('✅ Application Submitted!', `Successfully applied to ${internship.title} at ${internship.company}`);

      await refreshApplications();
    } catch (error) {
      console.error('Application error:', error);
    } finally {
      setLoading(false);
    }
  };

  const withdrawApplication = async (applicationId: string) => {
    try {
      setLoading(true);
      await ApplicationService.withdrawApplication(applicationId);
      
      console.log("✅ Application Withdrawn", "Your application has been withdrawn successfully.");

      await refreshApplications();
    } catch (error) {
      console.error("Failed to withdraw application", error);
    } finally {
      setLoading(false);
    }
  };

  const hasApplied = (internshipId: string) => {
    return applications.some(app => app.internshipId === internshipId && app.status !== 'withdrawn');
  };

  useEffect(() => {
    if (currentUser) {
      refreshApplications();
    }
  }, [currentUser]);

  return (
    <ApplicationContext.Provider value={{
      applications,
      loading,
      applyToInternship,
      withdrawApplication,
      refreshApplications,
      hasApplied,
    }}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplication = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplication must be used within an ApplicationProvider');
  }
  return context;
};