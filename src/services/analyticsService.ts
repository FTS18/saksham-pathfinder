// Analytics Service for tracking user behavior and performance metrics

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
}

class AnalyticsService {
  private static isInitialized = false;
  private static queue: AnalyticsEvent[] = [];

  static initialize() {
    if (this.isInitialized) return;
    
    // Initialize Google Analytics 4 if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      this.isInitialized = true;
      this.flushQueue();
    }
  }

  private static flushQueue() {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) this.sendEvent(event);
    }
  }

  private static sendEvent(event: AnalyticsEvent) {
    if (!this.isInitialized) {
      this.queue.push(event);
      return;
    }

    try {
      if ((window as any).gtag) {
        (window as any).gtag('event', event.action, {
          event_category: event.category,
          event_label: event.label,
          value: event.value,
          user_id: event.userId
        });
      }
      
      // Also log to console in development
      if (import.meta.env.DEV) {
        console.log('[Analytics]', event);
      }
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  // User Engagement Metrics
  static trackOnboardingCompletion(userId: string, completionTime: number) {
    this.sendEvent({
      category: 'User Engagement',
      action: 'onboarding_completed',
      label: userId,
      value: completionTime,
      userId
    });
  }

  static trackProfileCompletion(userId: string, percentage: number) {
    this.sendEvent({
      category: 'User Engagement',
      action: 'profile_completion',
      label: userId,
      value: percentage,
      userId
    });
  }

  static trackApplicationSubmission(userId: string, internshipId: string) {
    this.sendEvent({
      category: 'User Engagement',
      action: 'application_submitted',
      label: internshipId,
      userId
    });
  }

  static trackWishlistAction(userId: string, action: 'add' | 'remove', internshipId: string) {
    this.sendEvent({
      category: 'User Engagement',
      action: `wishlist_${action}`,
      label: internshipId,
      userId
    });
  }

  static trackReturnVisit(userId: string) {
    this.sendEvent({
      category: 'User Engagement',
      action: 'return_visit',
      label: userId,
      userId
    });
  }

  // Performance Metrics
  static trackPageLoad(page: string, loadTime: number) {
    this.sendEvent({
      category: 'Performance',
      action: 'page_load',
      label: page,
      value: Math.round(loadTime)
    });
  }

  static trackTimeToInteractive(page: string, time: number) {
    this.sendEvent({
      category: 'Performance',
      action: 'time_to_interactive',
      label: page,
      value: Math.round(time)
    });
  }

  static trackAPIResponse(endpoint: string, responseTime: number) {
    this.sendEvent({
      category: 'Performance',
      action: 'api_response',
      label: endpoint,
      value: Math.round(responseTime)
    });
  }

  static trackCacheHit(key: string) {
    this.sendEvent({
      category: 'Performance',
      action: 'cache_hit',
      label: key
    });
  }

  static trackError(error: Error, context: string) {
    this.sendEvent({
      category: 'Error',
      action: 'error_occurred',
      label: `${context}: ${error.message}`
    });
  }

  // Business Metrics
  static trackUserRegistration(userId: string, method: string) {
    this.sendEvent({
      category: 'Business',
      action: 'user_registration',
      label: method,
      userId
    });
  }

  static trackActiveUser(userId: string, type: 'DAU' | 'MAU') {
    this.sendEvent({
      category: 'Business',
      action: `active_user_${type}`,
      label: userId,
      userId
    });
  }

  static trackInternshipApplication(userId: string, internshipId: string) {
    this.sendEvent({
      category: 'Business',
      action: 'internship_application',
      label: internshipId,
      userId
    });
  }

  static trackRecruiterSignup(userId: string) {
    this.sendEvent({
      category: 'Business',
      action: 'recruiter_signup',
      label: userId,
      userId
    });
  }

  // Feature Usage
  static trackFeatureUsage(feature: string, userId?: string) {
    this.sendEvent({
      category: 'Feature Usage',
      action: 'feature_used',
      label: feature,
      userId
    });
  }

  static trackSearch(query: string, resultsCount: number, userId?: string) {
    this.sendEvent({
      category: 'Search',
      action: 'search_performed',
      label: query,
      value: resultsCount,
      userId
    });
  }

  static trackFilterUsage(filterType: string, value: string, userId?: string) {
    this.sendEvent({
      category: 'Filter',
      action: 'filter_applied',
      label: `${filterType}:${value}`,
      userId
    });
  }

  // Conversion Tracking
  static trackConversion(type: string, value?: number, userId?: string) {
    this.sendEvent({
      category: 'Conversion',
      action: type,
      value,
      userId
    });
  }
}

// Initialize on module load
if (typeof window !== 'undefined') {
  AnalyticsService.initialize();
}

export default AnalyticsService;
