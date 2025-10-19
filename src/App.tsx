import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useNavigationLoading } from "./hooks/useNavigationLoading";
import { useTimeTracking } from "./hooks/useTimeTracking";
import { useTimeBasedPoints } from "./hooks/useTimeBasedPoints";
import { useThemeColor } from "./hooks/useThemeColor";
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


// Import all pages directly for component-based routing
import Index from "./pages/Index";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import OnboardingSteps from "./pages/OnboardingSteps";
import SimplifiedOnboarding from "./pages/SimplifiedOnboarding";
import ImprovedOnboarding from "./pages/ImprovedOnboarding";
import RecruiterOnboarding from "./pages/RecruiterOnboarding";
import Referrals from "./pages/Referrals";
import DashboardSettings from "./pages/DashboardSettings";
import NewsEvents from "./pages/NewsEvents";
import Tutorials from "./pages/Tutorials";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import AdminDemo from "./pages/AdminDemo";
import CompanyPage from "./pages/CompanyPage";
import { SkillPage } from "./pages/SkillPage";
import { SectorPage } from "./pages/SectorPage";
import { CityPage } from "./pages/CityPage";
import { SharedComparisonPage } from "./pages/SharedComparisonPage";
import { InternshipDetailPage } from "./pages/InternshipDetailPage";
import { TitlePage } from "./pages/TitlePage";
import { SearchPage } from "./pages/SearchPage";
import StudentDashboard from "./pages/StudentDashboard";
import Applications from "./pages/Applications";
import ApplicationDashboard from "./pages/ApplicationDashboard";
import FAQ from "./pages/FAQ";
import ReportIssuePage from "./pages/ReportIssuePage";
import Sitemap from "./pages/Sitemap";

// Recruiter portal imports
import { RecruiterLayout } from "./pages/recruiter/RecruiterLayout";
import RecruiterDashboardNew from "./pages/recruiter/RecruiterDashboard";
import PostJob from "./pages/recruiter/PostJob";
import ManageInternships from "./pages/recruiter/ManageInternships";
import Candidates from "./pages/recruiter/Candidates";
import RecruiterApplications from "./pages/recruiter/RecruiterApplications";

const queryClient = new QueryClient();

const AppContent = () => {
  const isNavigationLoading = useNavigationLoading();
  const { currentUser, needsEmailVerification, userType, loading } = useAuth();
  
  useTimeTracking();
  useTimeBasedPoints();
  useThemeColor();
  
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
          <Route path="/u/*" element={<Layout><PublicProfile /></Layout>} />
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