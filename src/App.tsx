import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useServiceWorker } from "./hooks/useServiceWorker";
import { useNavigationLoading } from "./hooks/useNavigationLoading";
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
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Features from "./pages/Features";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import OnboardingPreferences from "./pages/OnboardingPreferences";
import OnboardingSteps from "./pages/OnboardingSteps";
import LiveJobs from "./pages/LiveJobs";

const queryClient = new QueryClient();

const AppContent = () => {
  const isNavigationLoading = useNavigationLoading();
  
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
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/features" element={<Features />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/onboarding" element={<OnboardingSteps />} />
                    <Route path="/onboarding-old" element={<OnboardingPreferences />} />
                    <Route path="/u/:username" element={<PublicProfile />} />
                    <Route path="/live-jobs" element={<LiveJobs />} />
                    <Route path="*" element={<NotFound />} />
                    </Routes>
          </main>
        </OnboardingRedirect>
        <Footer />
        <InstallPrompt />
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
