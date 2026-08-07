import React, { ReactNode, ErrorInfo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  declare props: Props;
  state: State = {
    hasError: false,
  };

  constructor(props: Props) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-[300px] flex items-center justify-center p-6">
            <Card className="p-8 text-center max-w-md w-full bg-card border-border shadow-xl rounded-2xl">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-foreground">Something went wrong</h2>
              <p className="text-muted-foreground text-sm mt-2 mb-6">
                {this.state.error?.message || "An unexpected error occurred while rendering this section."}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-2.5 rounded-lg transition-colors"
              >
                Refresh Page
              </Button>
            </Card>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
