import { ApiResponse } from "@/types/auth/auth.types";

export class BaseApiClient {
  protected baseURL: string;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || "") {
    this.baseURL = baseURL;
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string,
    includeCredentials: boolean = true
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const requestOptions: RequestInit = {
      ...options,
      headers,
      // Include credentials for cookie-based auth
      ...(includeCredentials && { credentials: "include" }),
    };

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "30000", 10));
    requestOptions.signal = controller.signal;

    try {
      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);
      
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      return {
        data: response.ok ? data : undefined,
        error: !response.ok ? data : undefined,
        status: response.status,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === "AbortError") {
        return {
          error: { detail: "Request timeout. Please try again." },
          status: 408,
        };
      }
      
      return {
        error: { detail: "Network error occurred" },
        status: 0,
      };
    }
  }

  protected requireAuth(token: string | null): ApiResponse<never> | null {
    if (!token) {
      return { error: { detail: "Authentication required" }, status: 401 };
    }
    return null;
  }
}
