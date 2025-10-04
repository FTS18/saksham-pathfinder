import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useNavigationLoading } from "./hooks/useNavigationLoading";
import { useTimeTracking } from "./hooks/useTimeTracking";
import { useTimeBasedPoints } from "./hooks/useTimeBasedPoints";
import { useThemeColor } from "./hooks/useThemeColor";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ComparisonProvider } from "./contexts/ComparisonContext";
import { GamificationProvider } from "./contexts/GamificationContext";
import { ApplicationProvider } from "./contexts/ApplicationContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { InstallPrompt } from "@/components/InstallPrompt";

import { ScrollToTop } from "@/components/ScrollToTop";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { CollapsibleSidebar } from "@/components/CollapsibleSidebar";
import { AccessibilitySidebar } from "@/components/AccessibilitySidebar";
import { MobileSidebar } from "@/components/MobileSidebar";
import { TopNavigation } from "@/components/TopNavigation";
import { Footer } from "@/components/Footer";
import { Chatbot } from "@/components/Chatbot";
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
import { TitlePage } from "./pages/TitlePage";
import { SearchPage } from "./pages/SearchPage";
import StudentDashboard from "./pages/StudentDashboard";
import Applications from "./pages/Applications";

// Recruiter portal imports
import { RecruiterLayout } from "./pages/recruiter/RecruiterLayout";
import RecruiterDashboardNew from "./pages/recruiter/RecruiterDashboard";
import PostJob from "./pages/recruiter/PostJob";
import ManageInternships from "./pages/recruiter/ManageInternships";
import Candidates from "./pages/recruiter/Candidates";

const queryClient = new QueryClient();

const AppContent = () => {
  const isNavigationLoading = useNavigationLoading();
  const { currentUser, needsEmailVerification, userType } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  
  useTimeTracking();
  useTimeBasedPoints();
  useThemeColor();
  
  // Initialize PWA features
  useEffect(() => {
    registerSW();
    preloadImages();
    requestNotificationPermission();
  }, []);
  

  
  // Listen for sidebar state changes with proper cleanup
  useEffect(() => {
    const handleSidebarToggle = (e: CustomEvent) => {
      setSidebarExpanded(e.detail.expanded);
    };
    
    const controller = new AbortController();
    window.addEventListener('sidebarToggle', handleSidebarToggle as EventListener, {
      signal: controller.signal
    });
    
    return () => {
      controller.abort();
    };
  }, []);
  
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
    return currentUser ? <>{children}</> : <Navigate to="/login" replace />;
  };
  
  const RecruiterRoute = ({ children }: { children: React.ReactNode }) => {
    return currentUser && userType === 'recruiter' ? <>{children}</> : <Navigate to="/login" replace />;
  };
  
  // If user is a recruiter, show recruiter portal
  if (currentUser && userType === 'recruiter' && !needsEmailVerification) {
    return (
      <ErrorBoundary>
        <SEOHead />
        <Routes>
          <Route path="/recruiter/*" element={<RecruiterRoute><RecruiterLayout /></RecruiterRoute>}>
            <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
            <Route path="dashboard" element={<RecruiterDashboardNew />} />
            <Route path="post-job" element={<PostJob />} />
            <Route path="manage-internships" element={<ManageInternships />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="applications" element={<div className="p-6">Applications - Coming Soon</div>} />
            <Route path="interviews" element={<div className="p-6">Interviews - Coming Soon</div>} />
            <Route path="analytics" element={<div className="p-6">Analytics - Coming Soon</div>} />
            <Route path="settings" element={<div className="p-6">Settings - Coming Soon</div>} />
          </Route>
          <Route path="*" element={<Navigate to="/recruiter/dashboard" replace />} />
        </Routes>
      </ErrorBoundary>
    );
  }
  
  return (
    <ErrorBoundary>
      <SEOHead />
      <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
        <ScrollToTop />
        {isNavigationLoading && <LoadingSpinner />}
        
        {/* Top Navigation */}
        <TopNavigation />
        
        <div className="flex flex-1">
          {/* Desktop Sidebars */}
          <div className="hidden md:block fixed left-0 top-16 bottom-16 z-30">
            <CollapsibleSidebar />
          </div>
          <div className="hidden md:block fixed right-0 top-16 bottom-0 z-20">
            <AccessibilitySidebar />
          </div>
          
          {/* Mobile Sidebar */}
          <MobileSidebar />
          
          {/* Main Content Area */}
          <main 
            className={`flex-1 transition-all duration-300 pt-16 overflow-x-hidden mobile-content ${
              sidebarExpanded 
                ? 'md:ml-[280px] md:mr-[60px]' 
                : 'md:ml-[60px] md:mr-[60px]'
            }`}
            onClick={() => {
              window.dispatchEvent(new CustomEvent('collapseSidebar'));
            }}
          >
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingSteps /></ProtectedRoute>} />
              <Route path="/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute><DashboardSettings /></ProtectedRoute>} />
              <Route path="/dashboard/news-events" element={<ProtectedRoute><NewsEvents /></ProtectedRoute>} />
              <Route path="/dashboard/tutorials" element={<ProtectedRoute><Tutorials /></ProtectedRoute>} />
              <Route path="/recruiter/dashboard" element={<Navigate to="/recruiter" replace />} />
              <Route path="/admin-demo" element={<AdminDemo />} />
              <Route path="/profiles/:username" element={<PublicProfile />} />
              <Route path="/u/*" element={<PublicProfile />} />
              <Route path="/company/:company" element={<CompanyPage />} />
              <Route path="/skill/:skill" element={<SkillPage />} />
              <Route path="/sector/:sector" element={<SectorPage />} />
              <Route path="/city/:city" element={<CityPage />} />
              <Route path="/title/:title" element={<TitlePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
        
        {/* Footer */}
        <Footer />
        <InstallPrompt />
        <Chatbot />
      </div>
    </ErrorBoundary>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <ApplicationProvider>
                <GamificationProvider>
                  <WishlistProvider>
                    <ComparisonProvider>
                <TooltipProvider>
                  <Toaster />
                  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <AppContent />
                  </BrowserRouter>
                </TooltipProvider>
                    </ComparisonProvider>
                  </WishlistProvider>
                </GamificationProvider>
              </ApplicationProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
  );
};

export default App;