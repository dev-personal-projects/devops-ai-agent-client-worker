import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  OAuthInitiateResponse,
  ProfileResponse,
  SignupRequest,
  SignupResponse,
} from "@/types/auth/auth.types";

class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor(
    baseURL: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  ) {
    this.baseURL = baseURL;
    this.loadTokens();
  }

  private loadTokens() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("access_token");
      this.refreshToken = localStorage.getItem("refresh_token");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    // Always include auth header if token exists
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 and try to refresh token
      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          headers.Authorization = `Bearer ${this.token}`;
          const retryResponse = await fetch(url, {
            ...options,
            headers,
          });
          const retryData = await retryResponse.json();
          return {
            data: retryResponse.ok ? retryData : undefined,
            error: !retryResponse.ok ? retryData : undefined,
            status: retryResponse.status,
          };
        }
      }

      const data = await response.json();

      return {
        data: response.ok ? data : undefined,
        error: !response.ok ? data : undefined,
        status: response.status,
      };
    } catch (error) {
      console.error("API request failed:", error);
      return {
        error: { detail: "Network error occurred" },
        status: 0,
      };
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await this.request<LoginResponse>("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });

      if (response.data) {
        this.setTokens(response.data.access_token, response.data.refresh_token);
        return true;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
    }

    this.clearTokens();
    return false;
  }

  async signup(payload: SignupRequest): Promise<ApiResponse<SignupResponse>> {
    return this.request<SignupResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async login(payload: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (response.data) {
      this.setTokens(response.data.access_token, response.data.refresh_token);
      this.saveUser(response.data.user);
    }

    return response;
  }

  /**
   * Initiate GitHub account linking for authenticated users
   * This creates a special OAuth flow that links to existing account
   */
  async linkGitHubAccount(
    forceAccountSelection: boolean = false
  ): Promise<ApiResponse<OAuthInitiateResponse>> {
    if (!this.token) {
      return {
        error: { detail: "Must be logged in to link GitHub account" },
        status: 401,
      };
    }

    const endpoint = forceAccountSelection
      ? "/auth/oauth/github/link?force_reauth=true"
      : "/auth/oauth/github/link";
    
    return this.request<OAuthInitiateResponse>(endpoint);
  }

  /**
   * Initiate regular GitHub OAuth for new users/login
   */
  async initiateGitHubOAuth(
    forceReauth: boolean = false
  ): Promise<ApiResponse<OAuthInitiateResponse>> {
    const endpoint = forceReauth
      ? "/auth/oauth/github?force_reauth=true"
      : "/auth/oauth/github";
    return this.request<OAuthInitiateResponse>(endpoint);
  }

  /**
   * Handle GitHub OAuth callback
   * Automatically detects if this is a linking flow based on stored state
   */
  async handleGitHubCallback(payload: {
    code: string;
    state?: string;
  }): Promise<ApiResponse<LoginResponse>> {
    // Check if this is a linking flow by comparing states
    const isLinking =
      sessionStorage.getItem("github_link_state") === payload.state;

    console.log("OAuth callback:", {
      isLinking,
      hasToken: !!this.token,
      storedLinkState: sessionStorage.getItem("github_link_state"),
      receivedState: payload.state,
    });

    const requestOptions: RequestInit = {
      method: "POST",
      body: JSON.stringify(payload),
    };

    // For linking flows, ensure we include the auth header
    if (isLinking && this.token) {
      requestOptions.headers = {
        ...requestOptions.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    const response = await this.request<LoginResponse>(
      "/auth/oauth/github/callback",
      requestOptions
    );

    if (response.data) {
      this.setTokens(response.data.access_token, response.data.refresh_token);
      this.saveUser(response.data.user);

      // Clear session storage
      if (isLinking) {
        sessionStorage.removeItem("github_link_state");
        sessionStorage.removeItem("github_link_timestamp");
      } else {
        sessionStorage.removeItem("github_oauth_state");
        sessionStorage.removeItem("github_oauth_timestamp");
      }
    }

    return response;
  }

  async getProfile(userId: string): Promise<ApiResponse<ProfileResponse>> {
    return this.request<ProfileResponse>(`/auth/profile/${userId}`);
  }

  async getCurrentProfile(): Promise<ApiResponse<ProfileResponse>> {
    return this.request<ProfileResponse>("/auth/profile");
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.token = accessToken;
    this.refreshToken = refreshToken;

    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);

      const secure = window.location.protocol === "https:";
      document.cookie = `access_token=${accessToken}; path=/; max-age=${
        60 * 60 * 24 * 7
      }; SameSite=strict${secure ? "; Secure" : ""}`;
      document.cookie = `refresh_token=${refreshToken}; path=/; max-age=${
        60 * 60 * 24 * 30
      }; SameSite=strict${secure ? "; Secure" : ""}`;
    }
  }

  private saveUser(user: any) {
    if (typeof window !== "undefined" && user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }

  clearTokens() {
    this.token = null;
    this.refreshToken = null;

    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      document.cookie =
        "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie =
        "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    }
  }

  logout() {
    this.clearTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getUser(): {
    id: string;
    email: string;
    fullName: string;
    avatar_url?: string;
  } | null {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  getToken(): string | null {
    return this.token;
  }
}

export const apiClient = new ApiClient();
