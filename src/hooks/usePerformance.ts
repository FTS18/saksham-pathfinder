import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
}

export const usePerformance = (componentName: string) => {
  const startTime = useRef<number>(performance.now());
  const metricsRef = useRef<PerformanceMetrics[]>([]);

  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    
    const metrics: PerformanceMetrics = {
      renderTime,
      componentName,
      timestamp: Date.now()
    };
    
    metricsRef.current.push(metrics);
    
    // Log slow renders (>16ms for 60fps)
    if (renderTime > 16) {
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
    
    // Keep only last 100 metrics
    if (metricsRef.current.length > 100) {
      metricsRef.current = metricsRef.current.slice(-100);
    }
  });

  const getMetrics = () => metricsRef.current;
  
  const getAverageRenderTime = () => {
    const metrics = metricsRef.current;
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, metric) => sum + metric.renderTime, 0);
    return total / metrics.length;
  };

  return { getMetrics, getAverageRenderTime };
};

export const measureAsync = async <T>(
  fn: () => Promise<T>,
  label: string
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await fn();
    const end = performance.now();
    console.log(`${label}: ${(end - start).toFixed(2)}ms`);
    return result;
  } catch (error) {
    const end = performance.now();
    console.error(`${label} failed after ${(end - start).toFixed(2)}ms:`, error);
    throw error;
  }
};