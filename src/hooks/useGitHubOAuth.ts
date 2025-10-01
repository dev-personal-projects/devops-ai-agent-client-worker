import { apiClient } from "@/lib/api/auth/auth-apiclient";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { getOAuthErrorMessage } from "@/types/auth/oauth";
import { OAUTH_CONFIG, getPostAuthRedirect } from "@/constants/oauth-constants";

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
        if (options?.forceAccountSelection) {
          const logoutWindow = window.open(
            "https://github.com/logout",
            "github-logout",
            "width=500,height=600"
          );
          await new Promise((resolve) => setTimeout(resolve, OAUTH_CONFIG.GITHUB_LOGOUT_DELAY_MS));
          logoutWindow?.close();
        }

        const response = await apiClient.initiateGitHubOAuth(
          options?.forceAccountSelection
        );

        if (response.error) {
          setError(getOAuthErrorMessage(response.error.detail));
          setIsLoading(false);
          return;
        }

        if (response.data) {
          if (options?.redirectTo) {
            sessionStorage.setItem(OAUTH_CONFIG.STORAGE_KEYS.OAUTH_REDIRECT, options.redirectTo);
          }
          window.location.href = response.data.auth_url;
        }
      } catch (err) {
        setError(getOAuthErrorMessage("", "Failed to initiate GitHub login"));
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
        const redirectTo = sessionStorage.getItem(OAUTH_CONFIG.STORAGE_KEYS.OAUTH_REDIRECT);
        const response = await apiClient.handleGitHubCallback({ code, state });

        if (response.error) {
          setError(getOAuthErrorMessage(response.error.detail));
          setIsLoading(false);
          return false;
        }

        if (response.data) {
          sessionStorage.removeItem(OAUTH_CONFIG.STORAGE_KEYS.OAUTH_REDIRECT);
          const userData = apiClient.getUser();
          const userId = userData?.id;
          const redirectUrl = getPostAuthRedirect(userId, redirectTo || undefined);
          router.push(redirectUrl);
          return true;
        }
      } catch (err) {
        setError(getOAuthErrorMessage("", "GitHub authentication failed"));
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