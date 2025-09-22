import { ApiResponse } from "@/types/auth/auth.types";

export class BaseApiClient {
  protected baseURL: string;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || "") {
    this.baseURL = baseURL;
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();

      return {
        data: response.ok ? data : undefined,
        error: !response.ok ? data : undefined,
        status: response.status,
      };
    } catch (error) {
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
