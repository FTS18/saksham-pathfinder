import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class GoogleTranslateErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('Google Translate error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null; // Silently fail for Google Translate
    }

    return this.props.children;
  }
}