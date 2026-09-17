import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export interface TabErrorBoundaryProps {
  tabName?: string;
  children?: ReactNode;
  onReset?: () => void;
  fallback?: ReactNode;
}

export interface TabErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class TabErrorBoundary extends Component<TabErrorBoundaryProps, TabErrorBoundaryState> {
  public override state: TabErrorBoundaryState;

  constructor(props: TabErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): TabErrorBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const name = this.props.tabName || 'Tab';
    console.error(`[TabErrorBoundary] Error caught in "${name}":`, error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      try {
        this.props.onReset();
      } catch (err) {
        console.warn('[TabErrorBoundary] Error during onReset callback:', err);
      }
    }
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      const label = this.props.tabName || 'Section';
      return (
        <div className="p-8 rounded-2xl bg-slate-900 border border-rose-900/50 space-y-4 text-center my-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">
              Unable to load {label}
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              A temporary display error occurred while rendering this tab. You can safely retry or switch to another section.
            </p>
            {this.state.error?.message && (
              <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-rose-300 max-w-lg mx-auto break-all">
                {this.state.error.message}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry {label}
          </button>
        </div>
      );
    }

    return this.props.children ?? null;
  }
}

export default TabErrorBoundary;
