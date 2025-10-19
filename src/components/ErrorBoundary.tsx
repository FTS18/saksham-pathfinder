import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, retryCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps, prevState: ErrorBoundaryState) {
    // Disabled auto-retry to prevent infinite reload loops
    // Users must manually click "Try Again" or "Reload Page"
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      retryCount: prevState.retryCount + 1
    }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen hero-gradient flex items-center justify-center p-4 animate-fade-in">
          <Card className="glass-card max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Oops! Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                An error occurred. You can reload the page or report the issue.
              </p>

              <div className="p-2 bg-muted rounded-lg overflow-auto max-h-48 text-xs">
                <pre>
                  <code>
                    {this.state.error?.message}
                    {this.state.error?.stack}
                  </code>
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Reload Page
                </Button>
                <Button onClick={() => window.location.href = '/'} size="sm">
                  <Home className="w-4 h-4 mr-1" />
                  Go Home
                </Button>
                <Button 
                  onClick={() => {
                    const subject = encodeURIComponent('Bug Report: Application Error');
                    const body = encodeURIComponent(`Error: ${this.state.error?.message}\nURL: ${window.location.href}\nStack: ${this.state.error?.stack}`);
                    window.open(`mailto:support@sakshami.com?subject=${subject}&body=${body}`);
                  }}
                  variant="outline" 
                  size="sm"
                  className="col-span-2"
                >
                  <Bug className="w-4 h-4 mr-1" />
                  Report Issue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};