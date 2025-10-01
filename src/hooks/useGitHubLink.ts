import { apiClient } from "@/lib/api/auth/auth-apiclient";
import { useState } from "react";
import { getOAuthErrorMessage } from "@/types/auth/oauth";
import { OAUTH_CONFIG } from "@/constants/oauth-constants";

export function useGitHubLink() {
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const forceGitHubLogout = async () => {
    const logoutWindow = window.open(
      "https://github.com/logout",
      "github-logout",
      "width=500,height=600"
    );
    await new Promise((resolve) => setTimeout(resolve, OAUTH_CONFIG.GITHUB_LOGOUT_DELAY_MS));
    logoutWindow?.close();
  };

  const linkGitHub = async (forceAccountSelection = false) => {
    setIsLinking(true);
    setLinkError(null);

    try {
      if (forceAccountSelection) {
        await forceGitHubLogout();
      }

      const response = await apiClient.linkGitHubAccount(forceAccountSelection);

      if (response.error) {
        setLinkError(getOAuthErrorMessage(response.error.detail));
        setIsLinking(false);
        return;
      }

      if (response.data) {
        window.location.href = response.data.auth_url;
      }
    } catch (error) {
      setLinkError(getOAuthErrorMessage("", "Failed to initiate GitHub linking"));
      setIsLinking(false);
    }
  };

  const updateGitHub = async () => {
    setIsLinking(true);
    setLinkError(null);

    try {
      await forceGitHubLogout();
      const response = await apiClient.updateGitHubAccount();

      if (response.error) {
        setLinkError(getOAuthErrorMessage(response.error.detail));
        setIsLinking(false);
        return;
      }

      if (response.data) {
        window.location.href = response.data.auth_url;
      }
    } catch (error) {
      setLinkError(getOAuthErrorMessage("", "Failed to update GitHub account"));
      setIsLinking(false);
    }
  };

  const disconnectGitHub = async (): Promise<boolean> => {
    try {
      const response = await apiClient.disconnectGitHub();
      
      if (response.error) {
        setLinkError(getOAuthErrorMessage(response.error.detail));
        return false;
      }
      
      return true;
    } catch (error) {
      setLinkError(getOAuthErrorMessage("", "Failed to disconnect GitHub account"));
      return false;
    }
  };

  return {
    linkGitHub,
    updateGitHub,
    disconnectGitHub,
    isLinking,
    linkError,
    clearError: () => setLinkError(null),
  };
}