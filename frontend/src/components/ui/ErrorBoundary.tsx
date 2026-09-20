import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';
import { WifiOff } from 'lucide-react';
import { API_BASE } from '../../lib/api';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // Check if it's a network/API error
      const isApiError = this.state.error?.message.includes('Network error') || 
                         this.state.error?.message.includes('API is down');

      if (isApiError) {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-app)] text-center p-4">
            <div className="bg-[var(--bg-surface)] p-8 rounded-lg shadow-sm border border-[var(--border-subtle)] max-w-md w-full">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <WifiOff className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">API Connection Lost</h1>
              <p className="text-[var(--text-secondary)] mb-8">
                We couldn't connect to the METACITY backend engine. Please ensure the backend is running on <code className="bg-gray-100 px-1 rounded">localhost:8000</code>.
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
                size="lg"
              >
                Retry Connection
              </Button>
            </div>
          </div>
        );
      }

      // Generic error fallback
      return (
        <div className="p-8 text-center bg-red-50 min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong.</h1>
          <p className="text-red-800 mb-8 max-w-lg">{this.state.error?.message}</p>
          <Button onClick={() => window.location.reload()}>Refresh Application</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
