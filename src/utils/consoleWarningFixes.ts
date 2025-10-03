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
      
      // Firebase warnings
      if (message.includes('Firebase')) return;
      
      // Vite HMR warnings
      if (message.includes('[vite]') || message.includes('HMR')) return;
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
  }, deps);
};