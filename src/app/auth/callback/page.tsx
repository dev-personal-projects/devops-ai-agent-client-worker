"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGitHubOAuth } from "@/hooks/useGitHubOAuth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import { apiClient } from "@/lib/api/auth/auth-apiclient";
import { getOAuthErrorMessage, GITHUB_OAUTH_ERRORS } from "@/types/auth/oauth";
import { OAUTH_CONFIG } from "@/constants/oauth-constants";
import { OAuthErrorBoundary, OAuthErrorDisplay } from "@/components/oauth-error-boundary";

function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { handleCallback, isLoading, error } = useGitHubOAuth();
  const [processed, setProcessed] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  
  useEffect(() => {
    if (processed) return;

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    const redirectUrl = sessionStorage.getItem(OAUTH_CONFIG.STORAGE_KEYS.OAUTH_REDIRECT);
    const isLinkingFlow = redirectUrl?.includes("/dashboard") ?? false;
    setIsLinking(isLinkingFlow);

    if (errorParam) {
      setProcessed(true);
      return;
    }

    if (code && state) {
      setProcessed(true);

      handleCallback(code, state).then((success) => {
        if (success) {
        }
      });
    } else if (!code && !errorParam) {
      setProcessed(true);
    }
  }, [searchParams, handleCallback, processed, router]);

  const githubError = searchParams.get("error");
  if (githubError) {
    const errorDescription = searchParams.get("error_description");
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {isLinking ? "GitHub Linking Failed" : "Authentication Failed"}
            </AlertTitle>
            <AlertDescription>
              {getOAuthErrorMessage(githubError, errorDescription || "An error occurred during authentication.")}
            </AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button
              onClick={() => {
                const userData = apiClient.getUser();
                const userId = userData?.id;
                router.push(
                  isLinking
                    ? userId
                      ? `/${userId}/dashboard`
                      : "/dashboard"
                    : "/auth/login"
                );
              }}
            >
              {isLinking ? "Back to Dashboard" : "Back to Login"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <div>
            <h2 className="text-lg font-semibold mb-2">
              {isLinking
                ? "Linking GitHub Account"
                : "Completing Authentication"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isLinking
                ? "Please wait while we link your GitHub account..."
                : "Please wait while we verify your GitHub account..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {isLinking ? "Linking Error" : "Authentication Error"}
            </AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{error}</p>
              {error.includes("already linked") && (
                <p className="text-xs">
                  This GitHub account is connected to a different user. Please
                  use a different GitHub account or contact support.
                </p>
              )}
            </AlertDescription>
          </Alert>
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                const userData = apiClient.getUser();
                const userId = userData?.id;
                router.push(
                  isLinking
                    ? userId
                      ? `/${userId}/dashboard`
                      : "/dashboard"
                    : "/auth/login"
                );
              }}
            >
              {isLinking ? "Back to Dashboard" : "Back to Login"}
            </Button>
            {!isLinking && (
              <Button onClick={() => router.push("/auth/login")}>
                Try Again
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (processed && !error && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          {isLinking ? (
            <>
              <LinkIcon className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <h2 className="text-lg font-semibold mb-2">
                  GitHub Account Linked Successfully
                </h2>
                <p className="text-sm text-muted-foreground">
                  Your GitHub account has been connected. Redirecting...
                </p>
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <h2 className="text-lg font-semibold mb-2">
                  Authentication Successful
                </h2>
                <p className="text-sm text-muted-foreground">
                  Redirecting to your dashboard...
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Initial processing state
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">
          {isLinking
            ? "Processing account linking..."
            : "Processing authentication..."}
        </p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <OAuthErrorBoundary context="login">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        }
      >
        <CallbackHandler />
      </Suspense>
    </OAuthErrorBoundary>
  );
}
