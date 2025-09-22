import { BaseApiClient } from "./base-client";
import { TokenManager } from "./token-manager";
import {
  ApiResponse,
  LoginResponse,
  OAuthInitiateResponse,
  ProfileResponse,
} from "@/types/auth/auth.types";

class ApiClient extends BaseApiClient {
  private tokenManager: TokenManager;

  constructor() {
    super();
    this.tokenManager = TokenManager.getInstance();
    this.tokenManager.loadTokens();
  }

  private async requestWithAuth<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.tokenManager.getToken();
    const response = await this.request<T>(
      endpoint,
      options,
      token ?? undefined
    );

    if (response.status === 401 && this.tokenManager.getRefreshToken()) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        return this.request<T>(
          endpoint,
          options,
          this.tokenManager.getToken() ?? undefined
        );
      }
    }

    return response;
  }

  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.tokenManager.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await this.request<LoginResponse>("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.data) {
        this.tokenManager.setTokens(
          response.data.access_token,
          response.data.refresh_token
        );
        return true;
      }
    } catch (error) {
      // Token refresh failed
    }

    this.tokenManager.clearTokens();
    return false;
  }

  async initiateGitHubOAuth(
    forceReauth: boolean = false
  ): Promise<ApiResponse<OAuthInitiateResponse>> {
    const endpoint = forceReauth
      ? "/auth/oauth/github?force_reauth=true"
      : "/auth/oauth/github";
    return this.request<OAuthInitiateResponse>(endpoint);
  }

  async handleGitHubCallback(payload: {
    code: string;
    state?: string;
  }): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>(
      "/auth/oauth/github/callback",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    if (response.data) {
      this.tokenManager.setTokens(
        response.data.access_token,
        response.data.refresh_token
      );
      this.tokenManager.setUserCookie(response.data.user.id);
      this.saveUser(response.data.user);
    }

    return response;
  }

  async linkGitHubAccount(
    forceAccountSelection: boolean = false
  ): Promise<ApiResponse<OAuthInitiateResponse>> {
    const authError = this.requireAuth(this.tokenManager.getToken());
    if (authError) return authError;

    const endpoint = forceAccountSelection
      ? "/auth/oauth/github/link?force_reauth=true"
      : "/auth/oauth/github/link";

    return this.requestWithAuth<OAuthInitiateResponse>(endpoint);
  }

  async getGitHubInfo(): Promise<ApiResponse<any>> {
    const authError = this.requireAuth(this.tokenManager.getToken());
    if (authError) return authError;

    return this.requestWithAuth<any>("/auth/oauth/github/info");
  }

  async updateGitHubAccount(): Promise<ApiResponse<OAuthInitiateResponse>> {
    const authError = this.requireAuth(this.tokenManager.getToken());
    if (authError) return authError;

    return this.requestWithAuth<OAuthInitiateResponse>(
      "/auth/oauth/github/update"
    );
  }

  async disconnectGitHub(): Promise<ApiResponse<{ message: string }>> {
    const authError = this.requireAuth(this.tokenManager.getToken());
    if (authError) return authError;

    return this.requestWithAuth<{ message: string }>(
      "/auth/oauth/github/disconnect",
      {
        method: "DELETE",
      }
    );
  }

  async getProfile(userId: string): Promise<ApiResponse<ProfileResponse>> {
    return this.requestWithAuth<ProfileResponse>(`/auth/profile/${userId}`);
  }

  async getCurrentProfile(): Promise<ApiResponse<ProfileResponse>> {
    return this.requestWithAuth<ProfileResponse>("/auth/profile");
  }

  private saveUser(user: any) {
    if (typeof window !== "undefined" && user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }

  logout() {
    this.tokenManager.clearTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  }

  isAuthenticated(): boolean {
    return !!this.tokenManager.getToken();
  }

  getUser() {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  getToken(): string | null {
    return this.tokenManager.getToken();
  }
}

export const apiClient = new ApiClient();
