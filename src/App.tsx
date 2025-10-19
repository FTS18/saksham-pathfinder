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
import { WishlistProvider } from "./contexts/WishlistContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ComparisonProvider } from "./contexts/ComparisonContext";
import { GamificationProvider } from "./contexts/GamificationContext";
import { ApplicationProvider } from "./contexts/ApplicationContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { InstallPrompt } from "@/components/InstallPrompt";
import { OnboardingRouter } from "@/components/OnboardingRouter";
import { RouteLoadingOverlay } from "@/components/RouteLoadingOverlay";

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
const OnboardingSteps = lazy(() => import("./pages/OnboardingSteps"));
const SimplifiedOnboarding = lazy(() => import("./pages/SimplifiedOnboarding"));
const ImprovedOnboarding = lazy(() => import("./pages/ImprovedOnboarding"));
const RecruiterOnboarding = lazy(() => import("./pages/RecruiterOnboarding"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));
const Referrals = lazy(() => import("./pages/Referrals"));
const DashboardSettings = lazy(() => import("./pages/DashboardSettings"));
const NewsEvents = lazy(() => import("./pages/NewsEvents"));
const Tutorials = lazy(() => import("./pages/Tutorials"));
const RecruiterDashboard = lazy(() => import("./pages/RecruiterDashboard"));
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
const Sitemap = lazy(() => import("./pages/Sitemap"));

// Lazy load recruiter pages
const RecruiterLayout = lazy(() => import("./pages/recruiter/RecruiterLayout").then(m => ({ default: m.RecruiterLayout })));
const RecruiterDashboardNew = lazy(() => import("./pages/recruiter/RecruiterDashboard"));
const PostJob = lazy(() => import("./pages/recruiter/PostJob"));
const ManageInternships = lazy(() => import("./pages/recruiter/ManageInternships"));
const Candidates = lazy(() => import("./pages/recruiter/Candidates"));
const RecruiterApplications = lazy(() => import("./pages/recruiter/RecruiterApplications"));

const queryClient = new QueryClient();

const AppContent = () => {
  const isNavigationLoading = useNavigationLoading();
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
              <Route path="dashboard" element={<RecruiterDashboardNew />} />
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
        {isNavigationLoading && <LoadingSpinner />}
        <InstallPrompt />
        
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/about" element={<Layout><About /></Layout>} />
            <Route path="/faq" element={<Layout><FAQ /></Layout>} />
            <Route path="/sitemap" element={<Layout><Sitemap /></Layout>} />
            <Route path="/report-issue" element={<Layout><ReportIssuePage /></Layout>} />
            <Route path="/news-events" element={<Layout><NewsEvents /></Layout>} />
            <Route path="/tutorials" element={<Layout><Tutorials /></Layout>} />
            <Route path="/login" element={<Layout><Login /></Layout>} />
            <Route path="/register" element={<Layout><Register /></Layout>} />
            <Route path="/profiles/:username" element={<Layout><PublicProfile /></Layout>} />
            <Route path="/u/:username" element={<Layout><UserProfilePage /></Layout>} />
            <Route path="/company/:company" element={<Layout><CompanyPage /></Layout>} />
            <Route path="/skill/:skill" element={<Layout><SkillPage /></Layout>} />
            <Route path="/sector/:sector" element={<Layout><SectorPage /></Layout>} />
            <Route path="/city/:city" element={<Layout><CityPage /></Layout>} />
            <Route path="/title/:title" element={<Layout><TitlePage /></Layout>} />
            <Route path="/search" element={<Layout><SearchPage /></Layout>} />
          <Route path="/internship/:id" element={<Layout><InternshipDetailPage /></Layout>} />
          <Route path="/shared-comparison" element={<Layout><SharedComparisonPage /></Layout>} />
          <Route path="/admin-demo" element={<Layout><AdminDemo /></Layout>} />
          
          {/* Protected Routes */}
          <Route path="/onboarding" element={<ProtectedRoute><Layout><ImprovedOnboarding /></Layout></ProtectedRoute>} />
          <Route path="/onboarding-old" element={<ProtectedRoute><Layout><SimplifiedOnboarding /></Layout></ProtectedRoute>} />
          <Route path="/onboarding-legacy" element={<ProtectedRoute><Layout><OnboardingSteps /></Layout></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Layout><StudentDashboard /></Layout></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Layout><Wishlist /></Layout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
          <Route path="/referrals" element={<ProtectedRoute><Layout><Referrals /></Layout></ProtectedRoute>} />
          <Route path="/dashboard/settings" element={<ProtectedRoute><Layout><DashboardSettings /></Layout></ProtectedRoute>} />
          <Route path="/applications" element={<ProtectedRoute><Layout><Applications /></Layout></ProtectedRoute>} />
          <Route path="/application-dashboard" element={<ProtectedRoute><Layout><ApplicationDashboard /></Layout></ProtectedRoute>} />
          
          {/* Redirects */}
          <Route path="/dashboard/news-events" element={<Navigate to="/news-events" replace />} />
          <Route path="/dashboard/tutorials" element={<Navigate to="/tutorials" replace />} />
          <Route path="/recruiter/dashboard" element={<Navigate to="/recruiter" replace />} />
          
          <Route path="*" element={<Layout><NotFound /></Layout>} />
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
                <WishlistProvider>
                  <ComparisonProvider>
                    <TooltipProvider>
                      <Toaster />
                      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <RouteTransitionProvider>
                          <RouteLoadingOverlay />
                          <AppContent />
                        </RouteTransitionProvider>
                      </BrowserRouter>
                    </TooltipProvider>
                  </ComparisonProvider>
                </WishlistProvider>
              </GamificationProvider>
            </ApplicationProvider>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};


export default App;