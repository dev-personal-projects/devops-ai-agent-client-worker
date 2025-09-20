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

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || "") {
    this.baseURL = baseURL;
    this.loadTokens();
    console.log("ApiClient initialized with baseURL:", this.baseURL);
  }

  private loadTokens() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("access_token");
      this.refreshToken = localStorage.getItem("refresh_token");
      console.log("Tokens loaded:", { hasToken: !!this.token, hasRefresh: !!this.refreshToken });
    }
  }

  async login(payload: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    console.log("🔐 API Login request started");
    
    const response = await this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    console.log("🔐 API Login response:", { 
      success: !!response.data, 
      hasUser: !!response.data?.user,
      userId: response.data?.user?.id,
      error: response.error?.detail 
    });

    if (response.data) {
      console.log("🔐 Setting tokens and user data");
      this.setTokensWithUser(
        response.data.access_token,
        response.data.refresh_token,
        response.data.user.id
      );
      this.saveUser(response.data.user);
      console.log("🔐 Tokens and user data saved successfully");
    }

    return response;
  }

  setTokensWithUser(accessToken: string, refreshToken: string, userId: string) {
    console.log("Setting tokens with user:", { userId: userId.substring(0, 8) + "..." });
    this.setTokens(accessToken, refreshToken);

    if (typeof window !== "undefined") {
      const secure = window.location.protocol === "https:";
      document.cookie = `user_id=${userId}; path=/; max-age=${
        60 * 60 * 24 * 7
      }; SameSite=strict${secure ? "; Secure" : ""}`;
    }
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
    console.log("Tokens set successfully");
  }

  private saveUser(user: any) {
    if (typeof window !== "undefined" && user) {
      localStorage.setItem("user", JSON.stringify(user));
      console.log("User data saved to localStorage:", { userId: user.id });
    }
  }

  getUser(): {
    id: string;
    email: string;
    fullName: string;
    avatar_url?: string;
  } | null {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      const userData = user ? JSON.parse(user) : null;
      console.log("Getting user from localStorage:", { hasUser: !!userData, userId: userData?.id });
      return userData;
    }
    return null;
  }

  getToken(): string | null {
    console.log("Getting token:", { hasToken: !!this.token });
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    console.log("API Request:", { method: options.method || "GET", url });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log("API Response:", { status: response.status, ok: response.ok });

      if (response.status === 401 && this.refreshToken) {
        console.log("Token expired, attempting refresh...");
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

  // ... rest of the methods remain the same ...
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

  async updateGitHubAccount(): Promise<ApiResponse<OAuthInitiateResponse>> {
    if (!this.token) {
      return {
        error: { detail: "Must be logged in to update GitHub account" },
        status: 401,
      };
    }

    return this.request<OAuthInitiateResponse>("/auth/oauth/github/update");
  }

  async getGitHubInfo(): Promise<ApiResponse<any>> {
    if (!this.token) {
      return {
        error: { detail: "Must be logged in to access the application" },
        status: 401,
      };
    }

    return this.request<any>("/auth/oauth/github/info");
  }

  async disconnectGitHub(): Promise<ApiResponse<{ message: string }>> {
    if (!this.token) {
      return {
        error: { detail: "Must be logged in" },
        status: 401,
      };
    }

    return this.request<{ message: string }>("/auth/oauth/github/disconnect", {
      method: "DELETE",
    });
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
    const isLinking =
      sessionStorage.getItem("github_link_state") === payload.state;
    const isUpdating =
      sessionStorage.getItem("github_update_state") === payload.state;

    console.log("OAuth callback:", {
      isLinking,
      isUpdating,
      hasToken: !!this.token,
      storedLinkState: sessionStorage.getItem("github_link_state"),
      storedUpdateState: sessionStorage.getItem("github_update_state"),
      receivedState: payload.state,
      authHeader: this.token
        ? `Bearer ${this.token.substring(0, 20)}...`
        : "None",
    });

    const requestOptions: RequestInit = {
      method: "POST",
      body: JSON.stringify(payload),
    };

    if ((isLinking || isUpdating) && this.token) {
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
      this.setTokensWithUser(
        response.data.access_token,
        response.data.refresh_token,
        response.data.user.id
      );
      this.saveUser(response.data.user);

      // Clear session storage
      if (isLinking) {
        sessionStorage.removeItem("github_link_state");
        sessionStorage.removeItem("github_link_timestamp");
      } else if (isUpdating) {
        sessionStorage.removeItem("github_update_state");
        sessionStorage.removeItem("github_update_timestamp");
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

  clearTokens() {
    console.log("Clearing all tokens and user data");
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
      document.cookie =
        "user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    }
  }

  logout() {
    this.clearTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  }

  isAuthenticated(): boolean {
    const authenticated = !!this.token;
    console.log("Checking authentication:", { authenticated });
    return authenticated;
  }
}

export const apiClient = new ApiClient();