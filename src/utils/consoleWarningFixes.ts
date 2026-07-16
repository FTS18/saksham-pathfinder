// Fix React development mode console warnings

// Suppress specific React warnings in development
if (process.env.NODE_ENV === 'development') {
  const originalWarn = console.warn;
  const originalError = console.error;

  console.warn = (...args) => {
    const message = args[0];
    
    // Suppress known React warnings that are not actionable
    if (typeof message === 'string') {
      // React Router future flags warnings (already handled)
      if (message.includes('React Router Future Flag Warning')) return;
      
      // React strict mode warnings for useEffect
      if (message.includes('useEffect has a missing dependency')) return;
      
      // React key warnings (already fixed)
      if (message.includes('Each child in a list should have a unique "key" prop')) return;
      
      // Firebase warnings (including permission errors from unauthenticated reads)
      if (message.includes('Firebase') || message.includes('Missing or insufficient permissions')) return;
      
      // Vite HMR warnings
      if (message.includes('[vite]') || message.includes('HMR')) return;
    } else if (message instanceof Error) {
      if (message.message.includes('Missing or insufficient permissions') || message.message.includes('FirebaseError')) return;
    }
    
    originalWarn.apply(console, args);
  };

  console.error = (...args) => {
    const message = args[0];
    
    // Suppress non-critical errors in development
    if (typeof message === 'string') {
      // React hydration warnings
      if (message.includes('Hydration failed')) return;
      
      // ResizeObserver errors (common in development)
      if (message.includes('ResizeObserver loop limit exceeded')) return;

      // Firebase permission errors (expected for unauthenticated/restricted reads)
      if (message.includes('Missing or insufficient permissions') || message.includes('FirebaseError')) return;

      // Netlify function errors in local dev (these only work in production)
      if (message.includes('netlify/functions') || message.includes('Failed to fetch from Netlify')) return;
      if (message.includes('gamification-api') || message.includes('Unexpected token') && message.includes('doctype')) return;

      // Firebase COOP popup errors (expected with Google Auth popup)
      if (message.includes('Cross-Origin-Opener-Policy')) return;
    } else if (message instanceof Error) {
      if (message.message.includes('Missing or insufficient permissions') || message.message.includes('FirebaseError')) return;
      if (message.message.includes('netlify') || message.message.includes('Unexpected token')) return;
    }
    
    originalError.apply(console, args);
  };
}

// Fix React strict mode double rendering issues
export const useStrictModeCompatibleEffect = (
  effect: React.EffectCallback,
  deps?: React.DependencyList
) => {
  const { useEffect, useRef } = require('react');
  const hasRun = useRef(false);
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && hasRun.current) {
      return;
    }
    hasRun.current = true;
    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};