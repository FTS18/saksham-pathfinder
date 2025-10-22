import { useEffect, useRef, useState } from "react";
import {
  getAnalytics,
  logEvent,
  setUserProperties,
  isSupported,
  Analytics,
} from "firebase/analytics";
import { useAuth } from "@/contexts/AuthContext";

export const useAnalytics = () => {
  const { currentUser } = useAuth();
  const analyticsRef = useRef<Analytics | null>(null);
  const [analyticsReady, setAnalyticsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    isSupported()
      .then((supported) => {
        if (!supported || !isMounted) return;
        analyticsRef.current = getAnalytics();
        setAnalyticsReady(true);
      })
      .catch(() => {
        if (isMounted) {
          analyticsRef.current = null;
          setAnalyticsReady(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (currentUser && analyticsRef.current) {
      setUserProperties(analyticsRef.current, {
        user_id: currentUser.uid,
        user_type: "student",
      });
    }
  }, [currentUser, analyticsReady]);

  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    try {
      const analytics = analyticsRef.current;
      if (!analytics) return;

      logEvent(analytics, eventName, {
        ...parameters,
        timestamp: new Date().toISOString(),
        user_id: currentUser?.uid,
      });
    } catch (error) {
      console.error("Analytics error:", error);
    }
  };

  const trackPageView = (pageName: string) => {
    trackEvent("page_view", { page_name: pageName });
  };

  const trackInternshipView = (internshipId: string, company: string) => {
    trackEvent("internship_view", {
      internship_id: internshipId,
      company_name: company,
    });
  };

  const trackApplication = (internshipId: string, company: string) => {
    trackEvent("internship_application", {
      internship_id: internshipId,
      company_name: company,
    });
  };

  const trackSearch = (query: string, resultsCount: number) => {
    trackEvent("search", {
      search_term: query,
      results_count: resultsCount,
    });
  };

  const trackFilterUsage = (filterType: string, filterValue: string) => {
    trackEvent("filter_usage", {
      filter_type: filterType,
      filter_value: filterValue,
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackInternshipView,
    trackApplication,
    trackSearch,
    trackFilterUsage,
  };
};
