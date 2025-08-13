"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGitHubOAuth } from "@/app/hooks/useGitHubOAuth";
import { Suspense } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { handleCallback, isLoading, error } = useGitHubOAuth();
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (processed) return;

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // Handle GitHub OAuth errors
    if (errorParam) {
      console.error("GitHub OAuth error:", errorParam, errorDescription);
      setProcessed(true);
      return;
    }

    if (code && state) {
      setProcessed(true);
      handleCallback(code, state);
    } else if (!code) {
      setProcessed(true);
    }
  }, [searchParams, handleCallback, processed]);

  // Handle GitHub OAuth errors
  const githubError = searchParams.get("error");
  if (githubError) {
    const errorDescription = searchParams.get("error_description");
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Failed</AlertTitle>
            <AlertDescription>
              {githubError === "access_denied"
                ? "You cancelled the GitHub authorization."
                : errorDescription ||
                  "An error occurred during GitHub authentication."}
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button onClick={() => router.push("/auth/login")}>
              Back to Login
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
            Completing Authentication
          </h2>
          <p className="text-muted-foreground">
            Please wait while we verify your GitHub account...
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
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 flex gap-2 justify-center">
            <Button
              variant="outline"
              onClick={() => router.push("/auth/login")}
            >
              Back to Login
            </Button>
            <Button onClick={() => (window.location.href = "/auth/login")}>
              Try Again
            </Button>
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
          <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">
            Authentication Successful
          </h2>
          <p className="text-muted-foreground">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Processing authentication...</p>
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
