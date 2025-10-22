import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApplicationService, Application } from '@/services/applicationService';
import { NotificationService } from '@/services/notificationService';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface ApplicationContextType {
  applications: Application[];
  loading: boolean;
  applyToInternship: (internship: any) => Promise<void>;
  withdrawApplication: (applicationId: string) => Promise<void>;
  refreshApplications: () => Promise<void>;
  hasApplied: (internshipId: string) => boolean;
  loadMoreApplications: () => Promise<void>;
  hasMoreApplications: boolean;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMoreApplications, setHasMoreApplications] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [allApplicationsLoaded, setAllApplicationsLoaded] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();

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
      // Use batched method: creates application and notification in single operation
      const applicationId = await ApplicationService.createApplicationWithNotification(
        {
          userId: currentUser.uid,
          internshipId: internship.id,
          internshipTitle: internship.title,
          companyName: internship.company,
          status: 'pending',
          priority: 'medium',
          source: 'direct',
          metadata: {},
        },
        {
          type: 'application_update',
          title: 'Application Submitted',
          message: `Your application for ${internship.title} at ${internship.company} has been submitted successfully!`,
          priority: 'medium',
          category: 'application',
          data: { internshipId: internship.id, applicationId: 'pending', companyName: internship.company }
        }
      );

      if (!applicationId) {
        throw new Error('Failed to create application');
      }

      console.log('✅ Application Submitted!', `Successfully applied to ${internship.title} at ${internship.company}`);

      toast({
        title: '✨ Application Submitted',
        description: `Your application for ${internship.title} at ${internship.company} has been submitted successfully!`,
        variant: 'default'
      });

      await refreshApplications();
    } catch (error) {
      console.error('Application error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit application. Please try again.';
      toast({
        title: '❌ Application Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const withdrawApplication = async (applicationId: string) => {
    try {
      setLoading(true);
      await ApplicationService.withdrawApplication(applicationId);
      
      console.log("✅ Application Withdrawn", "Your application has been withdrawn successfully.");

      toast({
        title: '✅ Application Withdrawn',
        description: 'Your application has been withdrawn successfully.',
        variant: 'default'
      });

      await refreshApplications();
    } catch (error) {
      console.error("Failed to withdraw application", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to withdraw application. Please try again.';
      toast({
        title: '❌ Withdrawal Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMoreApplications = async () => {
    if (!currentUser || !hasMoreApplications || allApplicationsLoaded) return;
    
    try {
      setLoading(true);
      const result = await ApplicationService.getUserApplicationsPaginated(
        currentUser.uid,
        12,
        lastDoc
      );
      
      if (result.applications.length > 0) {
        setApplications(prev => [...prev, ...result.applications]);
        setLastDoc(result.lastDoc);
        setHasMoreApplications(result.hasMore);
      } else {
        setAllApplicationsLoaded(true);
      }
    } catch (error) {
      console.error('Error loading more applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasApplied = (internshipId: string) => {
    return applications.some(app => app.internshipId === internshipId && app.status !== 'withdrawn');
  };

  useEffect(() => {
    if (!currentUser) return;

    // Real-time listener for user applications (modular SDK)
    // Assumes db is imported from '@/lib/firebase'
    let unsubscribe: (() => void) | undefined;
    try {
      // Dynamic import to avoid SSR issues
      const { collection, query, where, onSnapshot } = require('firebase/firestore');
      const { db } = require('@/lib/firebase');
      const qMod = query(collection(db, 'applications'), where('userId', '==', currentUser.uid));
      unsubscribe = onSnapshot(qMod, (querySnapshot: any) => {
        const userApplications = querySnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        setApplications(userApplications);
      }, (error: any) => {
        console.error('Error listening to user applications:', error);
      });
    } catch (e) {
      // fallback to refreshApplications if onSnapshot fails
      refreshApplications();
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  return (
    <ApplicationContext.Provider value={{
      applications,
      loading,
      applyToInternship,
      withdrawApplication,
      refreshApplications,
      hasApplied,
      loadMoreApplications,
      hasMoreApplications,
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