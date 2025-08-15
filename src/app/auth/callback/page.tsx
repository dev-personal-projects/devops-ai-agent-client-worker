"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGitHubOAuth } from "@/app/hooks/useGitHubOAuth";
import { Suspense } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Loader2, Link } from "lucide-react";

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

    // Check if this is a linking flow
    const linkState = sessionStorage.getItem("github_link_state");
    const oauthState = sessionStorage.getItem("github_oauth_state");
    const linking = linkState === state;
    setIsLinking(linking);

    // Handle GitHub OAuth errors
    if (errorParam) {
      console.error("GitHub OAuth error:", errorParam, errorDescription);
      setProcessed(true);

      // Clear session storage
      if (linking) {
        sessionStorage.removeItem("github_link_state");
        sessionStorage.removeItem("github_link_timestamp");
      } else {
        sessionStorage.removeItem("github_oauth_state");
        sessionStorage.removeItem("github_oauth_timestamp");
      }
      return;
    }

    if (code && state) {
      setProcessed(true);
      handleCallback(code, state).then((success) => {
        if (success) {
          // Clear linking state if it was a linking flow
          if (linking) {
            sessionStorage.removeItem("github_link_state");
            sessionStorage.removeItem("github_link_timestamp");
            // Redirect with linked parameter
            router.push("/dashboard?linked=true");
          } else {
            sessionStorage.removeItem("github_oauth_state");
            sessionStorage.removeItem("github_oauth_timestamp");
            // Regular redirect to dashboard
            router.push("/dashboard");
          }
        }
      });
    } else if (!code) {
      setProcessed(true);
    }
  }, [searchParams, handleCallback, processed, router]);

  // Handle GitHub OAuth errors
  const githubError = searchParams.get("error");
  if (githubError) {
    const errorDescription = searchParams.get("error_description");
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {isLinking ? "GitHub Linking Failed" : "Authentication Failed"}
            </AlertTitle>
            <AlertDescription>
              {githubError === "access_denied"
                ? isLinking
                  ? "You cancelled the GitHub account linking."
                  : "You cancelled the GitHub authorization."
                : errorDescription ||
                  (isLinking
                    ? "An error occurred while linking your GitHub account."
                    : "An error occurred during GitHub authentication.")}
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button
              onClick={() =>
                router.push(isLinking ? "/dashboard" : "/auth/login")
              }
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
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-lg font-semibold mb-2">
            {isLinking ? "Linking GitHub Account" : "Completing Authentication"}
          </h2>
          <p className="text-muted-foreground">
            {isLinking
              ? "Please wait while we link your GitHub account..."
              : "Please wait while we verify your GitHub account..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {isLinking ? "Linking Error" : "Authentication Error"}
            </AlertTitle>
            <AlertDescription>
              {error === "This GitHub account is already linked to another user"
                ? "This GitHub account is already connected to a different user. Please use a different GitHub account."
                : error}
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex gap-2 justify-center">
            <Button
              variant="outline"
              onClick={() =>
                router.push(isLinking ? "/dashboard" : "/auth/login")
              }
            >
              {isLinking ? "Back to Dashboard" : "Back to Login"}
            </Button>
            {!isLinking && (
              <Button onClick={() => (window.location.href = "/auth/login")}>
                Try Again
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Success state (briefly shown before redirect)
  if (processed && !error && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          {isLinking ? (
            <>
              <div className="flex justify-center mb-4">
                <Link className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-lg font-semibold mb-2">
                GitHub Account Linked Successfully
              </h2>
              <p className="text-muted-foreground">
                Your GitHub account has been connected. Redirecting to
                dashboard...
              </p>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">
                Authentication Successful
              </h2>
              <p className="text-muted-foreground">
                Redirecting to your dashboard...
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">
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
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
