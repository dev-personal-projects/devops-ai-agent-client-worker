import { apiClient } from "@/lib/api/auth-apiclient";
import { useState } from "react";

export function useGitHubLink() {
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const linkGitHub = async (forceAccountSelection = false) => {
    setIsLinking(true);
    setLinkError(null);

    try {
      // Clear any existing GitHub session to force account selection
      if (forceAccountSelection) {
        const logoutWindow = window.open(
          "https://github.com/logout",
          "github-logout",
          "width=500,height=600"
        );
        
        // Wait for logout to complete
        await new Promise((resolve) => setTimeout(resolve, 1500));
        logoutWindow?.close();
      }

      // Call the link endpoint
      const response = await apiClient.linkGitHubAccount(forceAccountSelection);

      if (response.error) {
        setLinkError(response.error.detail);
        setIsLinking(false);
        return; 
      }

      if (response.data) {
        // Store state for validation
        sessionStorage.setItem("github_link_state", response.data.state);
        sessionStorage.setItem("github_link_timestamp", Date.now().toString());

        // Redirect to GitHub
        window.location.href = response.data.auth_url;
      }
    } catch (error) {
      setLinkError("Failed to initiate GitHub linking");
      setIsLinking(false);
    }
  };

  return {
    linkGitHub,
    isLinking,
    linkError,
    clearError: () => setLinkError(null),
  };
}
