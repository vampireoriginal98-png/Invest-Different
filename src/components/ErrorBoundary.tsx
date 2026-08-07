import React from 'react';

type Props = { fallback?: React.ReactNode; onError?: (err: any, info?: any) => void; children?: React.ReactNode };
type State = { hasError: boolean; error: any | null };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    try { console.error('[React][ErrorBoundary]', error, info); } catch (_) {}
    if (this.props.onError) {
      try { this.props.onError(error, info); } catch (_) {}
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{ padding: 20 }}>
          <h2>Something went wrong.</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{process.env.NODE_ENV === 'production' ? '' : String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children ?? null;
  }
}
