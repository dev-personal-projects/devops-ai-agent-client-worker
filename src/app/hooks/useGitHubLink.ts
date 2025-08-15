import { apiClient } from "@/lib/api/auth-apiclient";
import { useState } from "react";

export function useGitHubLink() {
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const linkGitHub = async (forceAccountSelection = false) => {
    setIsLinking(true);
    setLinkError(null);

    try {
      if (forceAccountSelection) {
        const logoutWindow = window.open(
          "https://github.com/logout",
          "github-logout",
          "width=500,height=600"
        );
        
        await new Promise((resolve) => setTimeout(resolve, 1500));
        logoutWindow?.close();
      }

      const response = await apiClient.linkGitHubAccount(forceAccountSelection);

      if (response.error) {
        setLinkError(response.error.detail);
        setIsLinking(false);
        return; 
      }

      if (response.data) {
        sessionStorage.setItem("github_link_state", response.data.state);
        sessionStorage.setItem("github_link_timestamp", Date.now().toString());
        window.location.href = response.data.auth_url;
      }
    } catch (error) {
      setLinkError("Failed to initiate GitHub linking");
      setIsLinking(false);
    }
  };

  const updateGitHub = async () => {
    setIsLinking(true);
    setLinkError(null);

    try {
      // Force GitHub logout for account selection
      const logoutWindow = window.open(
        "https://github.com/logout",
        "github-logout",
        "width=500,height=600"
      );
      
      await new Promise((resolve) => setTimeout(resolve, 1500));
      logoutWindow?.close();

      const response = await apiClient.updateGitHubAccount();

      if (response.error) {
        setLinkError(response.error.detail);
        setIsLinking(false);
        return;
      }

      if (response.data) {
        sessionStorage.setItem("github_update_state", response.data.state);
        sessionStorage.setItem("github_update_timestamp", Date.now().toString());
        window.location.href = response.data.auth_url;
      }
    } catch (error) {
      setLinkError("Failed to update GitHub account");
      setIsLinking(false);
    }
  };

  const disconnectGitHub = async () => {
    try {
      const response = await apiClient.disconnectGitHub();
      if (response.error) {
        setLinkError(response.error.detail);
        return false;
      }
      return true;
    } catch (error) {
      setLinkError("Failed to disconnect GitHub account");
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
