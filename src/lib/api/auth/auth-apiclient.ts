import { BaseApiClient } from "../base-client";
import { TokenManager } from "../token/token-manager";
import {
  ApiResponse,
  LoginResponse,
  OAuthInitiateResponse,
  ProfileResponse,
} from "@/types/auth/auth.types";

/**
 * Authentication API Client
 * Handles all auth-related API calls with automatic token refresh
 */
class ApiClient extends BaseApiClient {
  private tokenManager: TokenManager;

  constructor() {
    super();
    this.tokenManager = TokenManager.getInstance();
    this.tokenManager.loadTokens();
  }

  /**
   * Make authenticated request with automatic token refresh
   */
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

    // Handle 401 with token refresh
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

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.tokenManager.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await this.request<LoginResponse>("/refresh", {
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
      console.error("Token refresh failed:", error);
    }

    this.tokenManager.clearTokens();
    return false;
  }

  // ============================================
  // AUTH METHODS
  // ============================================

  /**
   * Sign up with email and password
   */
  async signup(payload: {
    email: string;
    password: string;
    full_name: string;
  }): Promise<ApiResponse<{ message: string; user: any }>> {
    return this.request("/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Login with email and password
   */
  async login(payload: {
    email: string;
    password: string;
  }): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>("/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    // Save tokens and user data on successful authentication
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

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<{ message: string }>> {
    const authError = this.requireAuth(this.tokenManager.getToken());
    if (authError) return authError;

    const response = await this.requestWithAuth<{ message: string }>(
      "/logout",
      {
        method: "POST",
      }
    );

    // Clear tokens regardless of response
    this.tokenManager.clearTokens();
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }

    return response;
  }

  // ============================================
  // OAUTH METHODS
  // ============================================

  /**
   * Initiate GitHub OAuth login flow
   * Backend generates and validates state
   */
  async initiateGitHubOAuth(
    forceReauth: boolean = false
  ): Promise<ApiResponse<OAuthInitiateResponse>> {
    const params = new URLSearchParams();
    if (forceReauth) params.append("force_reauth", "true");
    
    const endpoint = `/oauth/github${params.toString() ? `?${params.toString()}` : ""}`;
    return this.request<OAuthInitiateResponse>(endpoint);
  }

  /**
   * Handle GitHub OAuth callback
   * Backend validates state and exchanges code for tokens
   */
  async handleGitHubCallback(payload: {
    code: string;
    state?: string;
  }): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>(
      "/oauth/github/callback/api",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    // Save tokens and user data on successful authentication
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

  /**
   * Link GitHub account to authenticated user
   * Requires authentication
   */
  async linkGitHubAccount(
    forceReauth: boolean = false,
    replace: boolean = false
  ): Promise<ApiResponse<OAuthInitiateResponse>> {
    const authError = this.requireAuth(this.tokenManager.getToken());
    if (authError) return authError;

    const params = new URLSearchParams();
    if (forceReauth) params.append("force_reauth", "true");
    if (replace) params.append("replace", "true");
    
    const endpoint = `/oauth/github/link${params.toString() ? `?${params.toString()}` : ""}`;
    return this.requestWithAuth<OAuthInitiateResponse>(endpoint);
  }

  /**
   * Get GitHub account info
   * Requires authentication
   */
  async getGitHubInfo(): Promise<ApiResponse<{
    provider: string;
    linked: boolean;
    github_id?: string;
    is_primary: boolean;
    avatar_url?: string;
  }>> {
    const authError = this.requireAuth(this.tokenManager.getToken());
    if (authError) return authError;

    return this.requestWithAuth("/oauth/github/info");
  }

  /**
   * Update/change linked GitHub account
   * Requires authentication
   */
  async updateGitHubAccount(): Promise<ApiResponse<OAuthInitiateResponse>> {
    const authError = this.requireAuth(this.tokenManager.getToken());
    if (authError) return authError;

    return this.requestWithAuth<OAuthInitiateResponse>(
      "/oauth/github/update"
    );
  }

  /**
   * Disconnect GitHub account
   * Requires authentication
   */
  async disconnectGitHub(): Promise<ApiResponse<{ message: string }>> {
    const authError = this.requireAuth(this.tokenManager.getToken());
    if (authError) return authError;

    return this.requestWithAuth<{ message: string }>(
      "/oauth/github/disconnect",
      {
        method: "DELETE",
      }
    );
  }

  // ============================================
  // PROFILE METHODS
  // ============================================

  /**
   * Get user profile by ID
   * Requires authentication
   */
  async getProfile(userId: string): Promise<ApiResponse<ProfileResponse>> {
    return this.requestWithAuth<ProfileResponse>(`/profile/${userId}`);
  }

  /**
   * Get current authenticated user's profile
   * Requires authentication
   */
  async getCurrentProfile(): Promise<ApiResponse<ProfileResponse>> {
    return this.requestWithAuth<ProfileResponse>("/profile");
  }

  /**
   * Update current user's profile
   * Requires authentication
   */
  async updateProfile(updates: Partial<ProfileResponse>): Promise<ApiResponse<ProfileResponse>> {
    return this.requestWithAuth<ProfileResponse>("/profile", {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Save user data to localStorage
   */
  private saveUser(user: any) {
    if (typeof window !== "undefined" && user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }

  /**
   * Get stored user data
   */
  getUser() {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  /**
   * Clear local tokens and redirect to login
   */
  clearSession() {
    this.tokenManager.clearTokens();
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      window.location.href = "/auth/login";
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.tokenManager.getToken();
  }

  /**
   * Get current access token
   */
  getToken(): string | null {
    return this.tokenManager.getToken();
  }

  /**
   * Get current refresh token
   */
  getRefreshToken(): string | null {
    return this.tokenManager.getRefreshToken();
  }
}

export const apiClient = new ApiClient();