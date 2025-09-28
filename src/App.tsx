import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { useNavigationLoading } from "./hooks/useNavigationLoading";
import { useTimeTracking } from "./hooks/useTimeTracking";
import { useTimeBasedPoints } from "./hooks/useTimeBasedPoints";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ComparisonProvider } from "./contexts/ComparisonContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { OnboardingRedirect } from "@/components/OnboardingRedirect";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { InstallPrompt } from "@/components/InstallPrompt";

import { ScrollToTop } from "@/components/ScrollToTop";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { CollapsibleSidebar } from "@/components/CollapsibleSidebar";
import { AccessibilitySidebar } from "@/components/AccessibilitySidebar";
import { MobileSidebar } from "@/components/MobileSidebar";
import { TopNavigation } from "@/components/TopNavigation";
import { RouteLoader } from "@/components/RouteLoader";
import { Footer } from "@/components/Footer";
import { Chatbot } from "@/components/Chatbot";
import { EmailVerification } from "@/components/EmailVerification";
import { useAuth } from "@/contexts/AuthContext";
import "./accessibility.css";
import "./styles/animations.css";
import { lazy, Suspense } from "react";
import { OptimizedLoader } from "@/components/OptimizedLoader";

// Lazy load all pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const About = lazy(() => import("./pages/About"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Profile = lazy(() => import("./pages/Profile"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const OnboardingPreferences = lazy(() => import("./pages/OnboardingPreferences"));
const OnboardingSteps = lazy(() => import("./pages/OnboardingSteps"));

const Referrals = lazy(() => import("./pages/Referrals"));
const DashboardSettings = lazy(() => import("./pages/DashboardSettings"));
const NewsEvents = lazy(() => import("./pages/NewsEvents"));
const Tutorials = lazy(() => import("./pages/Tutorials"));
const RecruiterDashboard = lazy(() => import("./pages/RecruiterDashboard"));
const RecruiterOnboarding = lazy(() => import("./pages/RecruiterOnboarding"));

const AdminDemo = lazy(() => import("./pages/AdminDemo"));
const CompanyPage = lazy(() => import("./pages/CompanyPage"));
const SkillPage = lazy(() => import("./pages/SkillPage").then(module => ({ default: module.SkillPage })));
const SectorPage = lazy(() => import("./pages/SectorPage").then(module => ({ default: module.SectorPage })));
const CityPage = lazy(() => import("./pages/CityPage").then(module => ({ default: module.CityPage })));
const TitlePage = lazy(() => import("./pages/TitlePage").then(module => ({ default: module.TitlePage })));

const queryClient = new QueryClient();

const AppContent = () => {
  const isNavigationLoading = useNavigationLoading();
  const { currentUser, needsEmailVerification } = useAuth();
  useTimeTracking();
  useTimeBasedPoints();
  
  // Show email verification if needed
  if (currentUser && needsEmailVerification) {
    return (
      <EmailVerification 
        user={currentUser} 
        onVerified={() => window.dispatchEvent(new CustomEvent('emailVerified'))}
      />
    );
  }
  
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <ScrollToTop />
        {isNavigationLoading && <LoadingSpinner />}
        {/* Desktop Sidebars */}
        <div className="hidden md:block">
          <CollapsibleSidebar />
          <AccessibilitySidebar />
        </div>
        
        {/* Mobile Sidebar */}
        <MobileSidebar />
        
        {/* Top Navigation */}
        <TopNavigation />
        
        <RouteLoader />
        <OnboardingRedirect>
          <main 
            className="transition-all duration-300 md:ml-[var(--sidebar-width,60px)] md:mr-[60px] pt-16"
            onClick={() => {
              // Collapse sidebar when clicking on main content
              window.dispatchEvent(new CustomEvent('collapseSidebar'));
            }}
          >
                    <Suspense fallback={<OptimizedLoader size="lg" />}>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/u/:username" element={<PublicProfile />} />

                        
                        {/* Protected Routes */}
                        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/onboarding" element={<ProtectedRoute><OnboardingSteps /></ProtectedRoute>} />
                        <Route path="/onboarding-old" element={<ProtectedRoute><OnboardingPreferences /></ProtectedRoute>} />
                        <Route path="/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
                        <Route path="/dashboard/settings" element={<ProtectedRoute><DashboardSettings /></ProtectedRoute>} />
                        <Route path="/dashboard/news-events" element={<ProtectedRoute><NewsEvents /></ProtectedRoute>} />
                        <Route path="/dashboard/tutorials" element={<ProtectedRoute><Tutorials /></ProtectedRoute>} />
                        
                        {/* Recruiter Routes */}
                        <Route path="/recruiter/dashboard" element={<ProtectedRoute requiredUserType="recruiter"><RecruiterDashboard /></ProtectedRoute>} />
                        <Route path="/recruiter/onboarding" element={<ProtectedRoute requiredUserType="recruiter"><RecruiterOnboarding /></ProtectedRoute>} />
                        

                        
                        {/* Company Page Route */}
                        <Route path="/company/:company" element={<CompanyPage />} />
                        
                        {/* Skill, Sector, and City Routes */}
                        <Route path="/skill/:skill" element={<SkillPage />} />
                        <Route path="/sector/:sector" element={<SectorPage />} />
                        <Route path="/city/:city" element={<CityPage />} />
                        <Route path="/title/:title" element={<TitlePage />} />
                        
                        {/* Admin Demo Route */}
                        <Route path="/admin-demo" element={<AdminDemo />} />
                        
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
          </main>
        </OnboardingRedirect>
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
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
