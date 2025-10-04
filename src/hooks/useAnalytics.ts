import { useEffect } from 'react';
import { getAnalytics, logEvent, setUserProperties } from 'firebase/analytics';
import { useAuth } from '@/contexts/AuthContext';

export const useAnalytics = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const analytics = getAnalytics();
      setUserProperties(analytics, {
        user_id: user.uid,
        user_type: 'student'
      });
    }
  }, [user]);

  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    try {
      const analytics = getAnalytics();
      logEvent(analytics, eventName, {
        ...parameters,
        timestamp: new Date().toISOString(),
        user_id: user?.uid
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  };

  const trackPageView = (pageName: string) => {
    trackEvent('page_view', { page_name: pageName });
  };

  const trackInternshipView = (internshipId: string, company: string) => {
    trackEvent('internship_view', { 
      internship_id: internshipId,
      company_name: company
    });
  };

  const trackApplication = (internshipId: string, company: string) => {
    trackEvent('internship_application', {
      internship_id: internshipId,
      company_name: company
    });
  };

  const trackSearch = (query: string, resultsCount: number) => {
    trackEvent('search', {
      search_term: query,
      results_count: resultsCount
    });
  };

  const trackFilterUsage = (filterType: string, filterValue: string) => {
    trackEvent('filter_usage', {
      filter_type: filterType,
      filter_value: filterValue
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackInternshipView,
    trackApplication,
    trackSearch,
    trackFilterUsage
  };
};