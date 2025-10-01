"use client";
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { handleOAuthError, logOAuthError, getErrorActionText } from "@/utils/oauth-error-handler";

interface OAuthErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface OAuthErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  context?: "login" | "linking" | "update" | "disconnect";
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class OAuthErrorBoundary extends React.Component<
  OAuthErrorBoundaryProps,
  OAuthErrorBoundaryState
> {
  constructor(props: OAuthErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): OAuthErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      errorInfo,
    });

    // Log error for debugging
    const oauthError = handleOAuthError(error, this.props.context);
    logOAuthError(oauthError, "OAuthErrorBoundary", {
      componentStack: errorInfo.componentStack,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  retry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      // Default error UI
      const oauthError = handleOAuthError(this.state.error, this.props.context);
      const actionText = getErrorActionText(oauthError, this.props.context === "update" || this.props.context === "disconnect" ? "login" : this.props.context);

      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <div className="max-w-md w-full space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {this.props.context === "linking"
                  ? "Account Linking Error"
                  : "Authentication Error"}
              </AlertTitle>
              <AlertDescription className="space-y-2">
                <p>{oauthError.userMessage}</p>
                {process.env.NODE_ENV === "development" && (
                  <details className="text-xs">
                    <summary>Technical Details</summary>
                    <pre className="mt-2 whitespace-pre-wrap">
                      {this.state.error.message}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 justify-center">
              {oauthError.canRetry && (
                <Button onClick={this.retry} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {actionText}
                </Button>
              )}
              <Button
                onClick={() => {
                  if (this.props.context === "linking") {
                    window.location.href = "/dashboard";
                  } else {
                    window.location.href = "/auth/login";
                  }
                }}
              >
                {this.props.context === "linking" ? "Back to Dashboard" : "Back to Login"}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook version for functional components
 */
export function useOAuthErrorHandler(context: "login" | "linking" | "update" | "disconnect" = "login") {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: unknown) => {
    if (error instanceof Error) {
      setError(error);
    } else {
      setError(new Error(String(error)));
    }
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const retry = React.useCallback(() => {
    clearError();
    // Additional retry logic can be added here
  }, [clearError]);

  React.useEffect(() => {
    if (error) {
      const oauthError = handleOAuthError(error, context);
      logOAuthError(oauthError, "useOAuthErrorHandler");
    }
  }, [error, context]);

  return {
    error,
    handleError,
    clearError,
    retry,
    hasError: !!error,
  };
}

/**
 * Simple error display component
 */
export function OAuthErrorDisplay({
  error,
  context = "login",
  onRetry,
  onBack,
}: {
  error: string | Error;
  context?: "login" | "linking" | "update" | "disconnect";
  onRetry?: () => void;
  onBack?: () => void;
}) {
  const oauthError = handleOAuthError(error, context);
  const actionText = getErrorActionText(oauthError, context);

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>
        {context === "linking" ? "Account Linking Error" : "Authentication Error"}
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{oauthError.userMessage}</p>
        <div className="flex gap-2">
          {oauthError.canRetry && onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              {actionText}
            </Button>
          )}
          {onBack && (
            <Button onClick={onBack} size="sm">
              {context === "linking" ? "Back to Dashboard" : "Back to Login"}
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}