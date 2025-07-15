import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800 mb-2">
              <span className="text-lg">⚠️</span>
              <span className="font-medium">Something went wrong</span>
            </div>
            <p className="text-sm text-red-600">
              The progress component encountered an error. Please refresh the
              page to try again.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-3 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-sm rounded border border-red-300"
            >
              Try Again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
