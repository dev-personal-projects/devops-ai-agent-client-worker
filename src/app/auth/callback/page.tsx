"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useGitHubOAuth } from "@/app/hooks/useGitHubOAuth";
import { Suspense } from "react";

function CallbackHandler() {
  const searchParams = useSearchParams();
  const { handleCallback, isLoading, error } = useGitHubOAuth();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (code && state) {
      handleCallback(code, state);
    }
  }, [searchParams, handleCallback]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Completing GitHub authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <a href="/auth/login" className="text-primary underline">
            Return to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Processing authentication...</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackHandler />
    </Suspense>
  );
}
