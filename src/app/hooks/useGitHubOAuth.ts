// Updated useGitHubOAuth hook
import { apiClient } from "@/lib/api/auth-apiclient";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function useGitHubOAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const initiateGitHubLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.initiateGitHubOAuth();
      if (response.error) {
        setError(response.error.detail);
        return;
      }

      if (response.data) {
        // Store state for validation on the callback
        sessionStorage.setItem("github_oauth_state", response.data.state);

        // Add a timestamp to detect stale states
        sessionStorage.setItem("github_oauth_timestamp", Date.now().toString());

        // Redirect to GitHub
        window.location.href = response.data.auth_url;
      }
    } catch (error) {
      setError(`Failed to initiate GitHub login: ${error}`);
      setIsLoading(false);
    }
  };

  const handleCallback = async (code: string, state: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate state to prevent CSRF attacks
      const storedState = sessionStorage.getItem("github_oauth_state");
      const storedTimestamp = sessionStorage.getItem("github_oauth_timestamp");

      // Check if state matches
      if (!storedState || storedState !== state) {
        setError("Invalid authentication state. Please try again.");
        return false;
      }

      // Check if the OAuth flow isn't too old (10 minutes max)
      if (storedTimestamp) {
        const age = Date.now() - parseInt(storedTimestamp);
        const maxAge = 10 * 60 * 1000; // 10 minutes
        if (age > maxAge) {
          setError("Authentication session expired. Please try again.");
          return false;
        }
      }

      // State validation passed, now call the backend
      // We still send the state for logging purposes, but validation is done here
      const response = await apiClient.handleGitHubCallback({
        code,
        state, // Backend will receive this but won't validate it
      });

      if (response.error) {
        setError(response.error.detail);
        return false;
      }

      if (response.data) {
        // Clear stored OAuth data
        sessionStorage.removeItem("github_oauth_state");
        sessionStorage.removeItem("github_oauth_timestamp");

        // Success! Redirect to dashboard
        router.push("/dashboard");
        return true;
      }
    } catch (err) {
      console.error("GitHub OAuth callback error:", err);
      setError("GitHub authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }

    return false;
  };

  return {
    initiateGitHubLogin,
    handleCallback,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}
