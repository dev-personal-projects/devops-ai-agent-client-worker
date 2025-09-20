import { apiClient } from "@/lib/api/auth-apiclient";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

interface GitHubOAuthOptions {
  forceAccountSelection?: boolean;
  redirectTo?: string;
}

export function useGitHubOAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const initiateGitHubLogin = useCallback(
    async (options?: GitHubOAuthOptions) => {
      setIsLoading(true);
      setError(null);

      try {
        // Clear any existing GitHub session to force account selection
        if (options?.forceAccountSelection) {
          // Open GitHub logout in a popup to clear session
          const logoutWindow = window.open(
            "https://github.com/logout",
            "github-logout",
            "width=500,height=600"
          );

          // Wait a bit for logout to complete
          await new Promise((resolve) => setTimeout(resolve, 1000));
          logoutWindow?.close();
        }

        const response = await apiClient.initiateGitHubOAuth(
          options?.forceAccountSelection
        );

        if (response.error) {
          setError(response.error.detail);
          setIsLoading(false);
          return;
        }

        if (response.data) {
          // Store state for CSRF validation
          sessionStorage.setItem("github_oauth_state", response.data.state);
          sessionStorage.setItem(
            "github_oauth_timestamp",
            Date.now().toString()
          );

          if (options?.redirectTo) {
            sessionStorage.setItem("github_oauth_redirect", options.redirectTo);
          }

          // Redirect to GitHub
          window.location.href = response.data.auth_url;
        }
      } catch (error) {
        setError(`Failed to initiate GitHub login: ${error}`);
        setIsLoading(false);
      }
    },
    []
  );

  const handleCallback = useCallback(
    async (code: string, state: string) => {
      setIsLoading(true);
      setError(null);

      try {
        // Check both OAuth and linking states
        const oauthState = sessionStorage.getItem("github_oauth_state");
        const linkState = sessionStorage.getItem("github_link_state");
        const oauthTimestamp = sessionStorage.getItem("github_oauth_timestamp");
        const linkTimestamp = sessionStorage.getItem("github_link_timestamp");
        const redirectTo = sessionStorage.getItem("github_oauth_redirect");

        // Determine which flow this is and validate accordingly
        const isLinking = linkState === state;
        const storedState = isLinking ? linkState : oauthState;
        const storedTimestamp = isLinking ? linkTimestamp : oauthTimestamp;

        if (!storedState || storedState !== state) {
          setError("Invalid authentication state. Please try again.");
          setIsLoading(false);
          return false;
        }

        // Check if state isn't expired (10 minutes)
        if (storedTimestamp) {
          const age = Date.now() - parseInt(storedTimestamp);
          if (age > 10 * 60 * 1000) {
            setError("Authentication session expired. Please try again.");
            setIsLoading(false);
            return false;
          }
        }

        // Call backend to complete OAuth
        const response = await apiClient.handleGitHubCallback({ code, state });

        if (response.error) {
          setError(response.error.detail);
          setIsLoading(false);
          return false;
        }

        if (response.data) {
          // Clear session data based on flow type
          if (isLinking) {
            sessionStorage.removeItem("github_link_state");
            sessionStorage.removeItem("github_link_timestamp");
            // Don't redirect here for linking - let callback page handle it
          } else {
            sessionStorage.removeItem("github_oauth_state");
            sessionStorage.removeItem("github_oauth_timestamp");
            sessionStorage.removeItem("github_oauth_redirect");
            // Redirect to intended destination or user-scoped dashboard
            const userData = apiClient.getUser();
            const userId = userData?.id;
            if (redirectTo) {
              router.push(redirectTo);
            } else if (userId) {
              router.push(`/${userId}/dashboard`);
            } else {
              router.push("/dashboard");
            }
          }
          return true;
        }
      } catch (err) {
        console.error("GitHub OAuth callback error:", err);
        setError("GitHub authentication failed. Please try again.");
        setIsLoading(false);
      }

      return false;
    },
    [router]
  );

  return {
    initiateGitHubLogin,
    handleCallback,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}
