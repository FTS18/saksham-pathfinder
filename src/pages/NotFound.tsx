import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {/* Ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

      <div className="relative text-center max-w-md mx-auto">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-3xl bg-muted flex items-center justify-center border border-border shadow-lg">
            <Compass className="w-12 h-12 text-primary animate-pulse" />
          </div>
        </div>

        {/* 404 */}
        <h1 className="text-8xl font-racing font-bold text-foreground mb-2 leading-none">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-foreground mb-3">
          Page not found
        </h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Looks like this page doesn't exist or has been moved. Let's get you back on track.
        </p>

        {/* Path shown */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted border border-border text-sm text-muted-foreground mb-8 font-mono">
          <span className="text-primary">/</span>
          {location.pathname.slice(1) || 'unknown'}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="rounded-xl gap-2">
            <Link to="/">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-xl gap-2" onClick={() => window.history.back()}>
            <button onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </Button>
        </div>

        {/* Brand */}
        <p className="mt-10 text-xs text-muted-foreground/60">
          UpSkillers — India's AI-Powered Internship Platform
        </p>
      </div>
    </div>
  );
};

export default NotFound;
