import React, { Component, ReactNode } from 'react';
import { useTimelineStore } from '../../store/timelineStore';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class TimelineErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Timeline error:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Pause timeline on error
    useTimelineStore.getState().pause();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-red-500/10 border-t border-red-500/20 flex items-center justify-center">
          <p className="text-red-400 text-sm">
            Timeline Error: {this.state.error?.message}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}