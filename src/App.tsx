import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useServiceWorker } from "./hooks/useServiceWorker";
import { useNavigationLoading } from "./hooks/useNavigationLoading";
import { useTimeTracking } from "./hooks/useTimeTracking";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { OnboardingRedirect } from "@/components/OnboardingRedirect";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { InstallPrompt } from "@/components/InstallPrompt";
import { ScrollToTop } from "@/components/ScrollToTop";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Chatbot } from "@/components/Chatbot";
import { EmailVerification } from "@/components/EmailVerification";
import { useAuth } from "@/contexts/AuthContext";
import "./accessibility.css";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";

import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import OnboardingPreferences from "./pages/OnboardingPreferences";
import OnboardingSteps from "./pages/OnboardingSteps";
import LiveJobs from "./pages/LiveJobs";
import Referrals from "./pages/Referrals";
import DashboardSettings from "./pages/DashboardSettings";
import NewsEvents from "./pages/NewsEvents";
import Tutorials from "./pages/Tutorials";

const queryClient = new QueryClient();

const AppContent = () => {
  const isNavigationLoading = useNavigationLoading();
  const { currentUser, needsEmailVerification } = useAuth();
  useTimeTracking();
  
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
        <Navbar />
        <OnboardingRedirect>
          <main>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/u/:username" element={<PublicProfile />} />
                      <Route path="/live-jobs" element={<LiveJobs />} />
                      
                      {/* Protected Routes */}
                      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                      <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <Route path="/onboarding" element={<ProtectedRoute><OnboardingSteps /></ProtectedRoute>} />
                      <Route path="/onboarding-old" element={<ProtectedRoute><OnboardingPreferences /></ProtectedRoute>} />
                      <Route path="/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
                      <Route path="/dashboard/settings" element={<ProtectedRoute><DashboardSettings /></ProtectedRoute>} />
                      <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                      <Route path="/dashboard/news-events" element={<ProtectedRoute><NewsEvents /></ProtectedRoute>} />
                      <Route path="/dashboard/tutorials" element={<ProtectedRoute><Tutorials /></ProtectedRoute>} />
                      
                      <Route path="*" element={<NotFound />} />
                    </Routes>
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
  useServiceWorker();
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <WishlistProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <AppContent />
              </BrowserRouter>
            </TooltipProvider>
          </WishlistProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
