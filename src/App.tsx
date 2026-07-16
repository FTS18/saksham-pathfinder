import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

import { useNavigationLoading } from "./hooks/useNavigationLoading";
import { useTimeTracking } from "./hooks/useTimeTracking";
import { useTimeBasedPoints } from "./hooks/useTimeBasedPoints";
import { useThemeColor } from "./hooks/useThemeColor";
import { useApplicationStatusWatcher } from "./hooks/useApplicationStatusWatcher";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { RouteTransitionProvider } from "@/contexts/RouteTransitionContext";
import { AuthProvider } from "./contexts/AuthContext";
import { GamificationProvider } from "./contexts/GamificationContext";
import { ApplicationProvider } from "./contexts/ApplicationContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { InstallPrompt } from "@/components/InstallPrompt";
import { OnboardingRouter } from "@/components/OnboardingRouter";

import { ScrollToTop } from "@/components/ScrollToTop";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Layout } from "@/components/Layout";
import { EmailVerification } from "@/components/EmailVerification";
import { useAuth } from "@/contexts/AuthContext";
import "./accessibility.css";
import "./styles/animations.css";
import "./styles/glass-effects.css";

import "./utils/consoleWarningFixes";
import { useState, useEffect } from "react";
import { SEOHead } from "@/components/SEOHead";
import { registerSW, preloadImages, requestNotificationPermission } from "@/utils/pwa";

// Lazy load page components for code splitting
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Profile = lazy(() => import("./pages/Profile"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const ImprovedOnboarding = lazy(() => import("./pages/ImprovedOnboarding"));
const RecruiterOnboarding = lazy(() => import("./pages/RecruiterOnboarding"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));
const Referrals = lazy(() => import("./pages/Referrals"));
const NewsEvents = lazy(() => import("./pages/NewsEvents"));
const Tutorials = lazy(() => import("./pages/Tutorials"));
const AdminDemo = lazy(() => import("./pages/AdminDemo"));
const CompanyPage = lazy(() => import("./pages/CompanyPage"));
const SkillPage = lazy(() => import("./pages/SkillPage"));
const SectorPage = lazy(() => import("./pages/SectorPage"));
const CityPage = lazy(() => import("./pages/CityPage"));
const SharedComparisonPage = lazy(() => import("./pages/SharedComparisonPage"));
const InternshipDetailPage = lazy(() => import("./pages/InternshipDetailPage"));
const TitlePage = lazy(() => import("./pages/TitlePage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const Applications = lazy(() => import("./pages/Applications"));
const ApplicationDashboard = lazy(() => import("./pages/ApplicationDashboard"));
const FAQ = lazy(() => import("./pages/FAQ"));
const ReportIssuePage = lazy(() => import("./pages/ReportIssuePage"));
const ResumeDashboard = lazy(() => import("./pages/ResumeDashboard"));
const Sitemap = lazy(() => import("./pages/Sitemap"));

// Lazy load recruiter pages
const RecruiterLayout = lazy(() => import("./pages/recruiter/RecruiterLayout").then(m => ({ default: m.RecruiterLayout })));
const RecruiterDashboard = lazy(() => import("./pages/recruiter/RecruiterDashboard").then(m => ({ default: m.RecruiterDashboard })));
const PostJob = lazy(() => import("./pages/recruiter/PostJob"));
const ManageInternships = lazy(() => import("./pages/recruiter/ManageInternships"));
const Candidates = lazy(() => import("./pages/recruiter/Candidates"));
const RecruiterApplications = lazy(() => import("./pages/recruiter/RecruiterApplications"));

// FIX #13: Properly configured QueryClient to prevent unnecessary Firestore reads.
// Without staleTime, every route change triggers a full refetch.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,       // Data is fresh for 5 minutes
      gcTime: 10 * 60 * 1000,          // Keep unused data in cache for 10 minutes
      retry: 2,                          // Retry failed requests twice before showing error
      refetchOnWindowFocus: false,       // Don't refetch when user switches tabs
      refetchOnReconnect: true,          // Do refetch when connection is restored
    },
    mutations: {
      retry: 1,
    },
  },
});

const AppContent = () => {
  const { currentUser, needsEmailVerification, userType, loading } = useAuth();
  
  useTimeTracking();
  useTimeBasedPoints();
  useThemeColor();
  useApplicationStatusWatcher(); // Monitor application status changes
  
  // Initialize PWA features
  useEffect(() => {
    registerSW();
    preloadImages();
    requestNotificationPermission();
    // Fallback: reload if main JS fails to load (asset/SW issue)
    window.addEventListener('error', (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target && target.tagName === 'SCRIPT') {
        window.location.reload();
      }
    }, { once: true });
  }, []);
  
  // Show loading while auth is initializing
  if (loading) {
    return <LoadingSpinner />;
  }

  // Show email verification if needed
  if (currentUser && needsEmailVerification) {
    return (
      <EmailVerification 
        user={currentUser} 
        onVerified={() => window.dispatchEvent(new CustomEvent('emailVerified'))}
      />
    );
  }
  
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  };


  
  const RecruiterRoute = ({ children }: { children: React.ReactNode }) => {
    return currentUser && userType === 'recruiter' ? <>{children}</> : <Navigate to="/login" replace />;
  };
  
  // If user is a recruiter, show recruiter portal
  if (currentUser && userType === 'recruiter' && !needsEmailVerification) {
    return (
      <OnboardingRouter>
        <ErrorBoundary>
          <SEOHead />
          <Routes>
            <Route path="/recruiter/onboarding" element={<RecruiterOnboarding />} />
            <Route path="/recruiter/*" element={<RecruiterRoute><RecruiterLayout /></RecruiterRoute>}>
              <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
              <Route path="dashboard" element={<RecruiterDashboard />} />
              <Route path="post-job" element={<PostJob />} />
              <Route path="manage-internships" element={<ManageInternships />} />
              <Route path="candidates" element={<Candidates />} />
              <Route path="applications" element={<RecruiterApplications />} />
              <Route path="interviews" element={<div className="p-6">Interviews - Coming Soon</div>} />
              <Route path="analytics" element={<div className="p-6">Analytics - Coming Soon</div>} />
              <Route path="settings" element={<div className="p-6">Settings - Coming Soon</div>} />
            </Route>
            <Route path="*" element={<Navigate to="/recruiter/dashboard" replace />} />
          </Routes>
        </ErrorBoundary>
      </OnboardingRouter>
    );
  }
  
  return (
    <OnboardingRouter>
      <ErrorBoundary>
        <SEOHead />
        <ScrollToTop />
        <InstallPrompt />
        
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route element={<Layout />}>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/resume" element={<ResumeDashboard />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/sitemap" element={<Sitemap />} />
              <Route path="/report-issue" element={<ReportIssuePage />} />
              <Route path="/news-events" element={<NewsEvents />} />
              <Route path="/tutorials" element={<Tutorials />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profiles/:username" element={<PublicProfile />} />
              <Route path="/u/:username" element={<UserProfilePage />} />
              <Route path="/company/:company" element={<CompanyPage />} />
              <Route path="/skill/:skill" element={<SkillPage />} />
              <Route path="/sector/:sector" element={<SectorPage />} />
              <Route path="/city/:city" element={<CityPage />} />
              <Route path="/title/:title" element={<TitlePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/internships/:id" element={<InternshipDetailPage />} />
              <Route path="/shared-comparison" element={<SharedComparisonPage />} />
              <Route path="/admin-demo" element={<AdminDemo />} />
              <Route path="/wishlist" element={<Wishlist />} />
            
              {/* Protected Routes */}
              <Route path="/onboarding" element={<ProtectedRoute><ImprovedOnboarding /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
              <Route path="/applications" element={<Navigate to="/application-dashboard" replace />} />
              <Route path="/application-dashboard" element={<ProtectedRoute><ApplicationDashboard /></ProtectedRoute>} />
              
              {/* Catch-all Not Found */}
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Redirects (no layout needed) */}
            <Route path="/onboarding-old" element={<Navigate to="/onboarding" replace />} />
            <Route path="/onboarding-legacy" element={<Navigate to="/onboarding" replace />} />
            <Route path="/dashboard/news-events" element={<Navigate to="/news-events" replace />} />
            <Route path="/dashboard/tutorials" element={<Navigate to="/tutorials" replace />} />
            <Route path="/recruiter/dashboard" element={<Navigate to="/recruiter" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </OnboardingRouter>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <ApplicationProvider>
              <GamificationProvider>
                <TooltipProvider>
                  <Toaster />
                  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <RouteTransitionProvider>
                      <AppContent />
                    </RouteTransitionProvider>
                  </BrowserRouter>
                </TooltipProvider>
              </GamificationProvider>
            </ApplicationProvider>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};


export default App;