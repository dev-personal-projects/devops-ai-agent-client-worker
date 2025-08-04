import {
  ApiResponse,
  ErrorResponse,
  LoginRequest,
  LoginResponse,
  ProfileResponse,
  SignupRequest,
  SignupResponse,
} from "@/types/auth/auth,types";

// lib/api-client.ts
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(
    baseURL: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  ) {
    this.baseURL = baseURL;
    // Load token from localStorage on initialization
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("access_token");
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

    // Add authorization header if token exists
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data,
          status: response.status,
        };
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      return {
        error: { detail: "Network error occurred" },
        status: 0,
      };
    }
  }

  // Auth methods
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

    // Store token if login successful
    if (response.data && typeof window !== "undefined") {
      this.token = response.data.access_token;
      this.setToken(response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response;
  }

  async getProfile(userId: string): Promise<ApiResponse<ProfileResponse>> {
    return this.request<ProfileResponse>(`/auth/profile/${userId}`);
  }

  async getProtectedInfo(): Promise<
    ApiResponse<{ message: string; role: string }>
  > {
    return this.request<{ message: string; role: string }>("/auth/info");
  }

  // Token management
  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
      // Also set as cookie for middleware
      document.cookie = `access_token=${token}; path=/; max-age=${
        60 * 60 * 24 * 7
      }; SameSite=strict`;
    }
  }

  setRefreshToken(refreshToken: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("refresh_token", refreshToken);
      // Also set as cookie for middleware
      document.cookie = `refresh_token=${refreshToken}; path=/; max-age=${
        60 * 60 * 24 * 30
      }; SameSite=strict`;
    }
  }

  getToken(): string | null {
    return this.token;
  }

  logout() {
    this.token = null;
    if (typeof window !== "undefined") {
      // Clear localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      // Clear cookies
      document.cookie =
        "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie =
        "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

      // Redirect to login
      window.location.href = "/login";
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token;
  }
  // Get stored user data
  getUser(): { id: string; email: string } | null {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    }
    return null;
  }
}

export const apiClient = new ApiClient();
