import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('Error caught by boundary:', error);
    console.warn('Component stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-[600px] bg-red-500/90 text-white text-sm py-2 px-4 z-50 flex items-center justify-between rounded-md shadow-lg">
            <span>An error occurred: {this.state.error?.message}</span>
            <button 
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-2 py-1 bg-white/10 rounded hover:bg-white/20 text-xs"
            >
              Dismiss
            </button>
          </div>
          {this.props.children}
        </>
      );
    }

    return this.props.children;
  }
}