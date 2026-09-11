import { Component, ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div className="border border-red-200 rounded-lg p-4 bg-red-50"><h3 className="text-sm font-semibold text-red-700">Something went wrong</h3><p className="text-xs text-red-500">{this.state.error?.message}</p></div>;
    }
    return this.props.children;
  }
}