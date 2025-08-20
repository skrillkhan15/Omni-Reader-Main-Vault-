import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: null, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Card className="w-full max-w-md p-6 text-center">
            <CardHeader>
              <CardTitle className="text-destructive text-2xl">Something went wrong.</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We apologize for the inconvenience. Please try refreshing the page.
              </p>
              <Button onClick={() => window.location.reload()} variant="hero">
                Refresh Page
              </Button>
              {this.state.error && (
                <details className="mt-4 text-sm text-left text-muted-foreground">
                  <summary className="cursor-pointer">Error Details</summary>
                  <pre className="mt-2 p-2 bg-muted rounded-md overflow-auto">
                    {this.state.error.toString()}
                    <br />
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
