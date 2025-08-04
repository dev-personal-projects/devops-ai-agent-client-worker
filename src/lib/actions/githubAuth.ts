// src/lib/githubAuth.ts
// -----------------------------------------------------------------------------
// Centralised GitHub OAuth logic with solid error/success handling.
// -----------------------------------------------------------------------------

import { supabase } from "@/utils/client";
import { authApi } from "../api/auth-apiclient";



type GitHubAuthSuccess = {
  ok: true;
  githubToken: string;
};
  
type GitHubAuthError = {
  ok: false;
  message: string;
};

export type GitHubAuthResult = GitHubAuthSuccess | GitHubAuthError;

/**
 * Initiate GitHub OAuth via Supabase and resolve once flow finishes.
 *
 * On success:
 *   • sends provider_token to backend (/github/link) for storage
 *   • returns { ok:true, githubToken }
 * On error/cancel:
 *   • returns { ok:false, message }
 */
export async function loginWithGitHub(): Promise<GitHubAuthResult> {
  // 1. start the flow ➜ user gets redirected to GitHub
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: { scopes: "repo read:org user:email" },
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  // 2. Wait for auth state change when redirect comes back
  return new Promise<GitHubAuthResult>((resolve) => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event: string, session: { provider_token: any; }) => {
        // cleanup listener exactly once
        listener.subscription.unsubscribe();

        if (event === "USER_SIGNED_OUT" || !session) {
          resolve({
            ok: false,
            message: "GitHub login cancelled or no session returned.",
          });
          return;
        }

        if (!session.provider_token) {
          resolve({
            ok: false,
            message:
              "GitHub token not returned; check provider scopes or user consent.",
          });
          return;
        }

        try {
          // 3. Pass token to backend for persistence
          await authApi.post("/github/link", {
            github_token: session.provider_token,
          });
        } catch (err: any) {
          resolve({
            ok: false,
            message:
              err.response?.data?.detail ??
              "Failed to store GitHub token in backend.",
          });
          return;
        }

        resolve({ ok: true, githubToken: session.provider_token });
      }
    );
  });
}
