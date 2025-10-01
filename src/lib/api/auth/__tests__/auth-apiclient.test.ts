// Mock environment config before importing
jest.mock("@/config/env-config", () => ({
  env: {
    apiUrl: "http://localhost:8000",
    apiTimeout: 30000,
  },
}));

import { apiClient } from "../auth-apiclient";

// Mock fetch
global.fetch = jest.fn();

describe("AuthApiClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("signup", () => {
    it("should call signup endpoint with correct data", async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ message: "User created successfully" }),
        status: 201,
        headers: new Headers({ "content-type": "application/json" }),
      };
      
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const signupData = {
        email: "test@example.com",
        password: "password123",
        full_name: "Test User",
      };

      const result = await apiClient.signup(signupData);

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8000/auth/signup",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(signupData),
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          credentials: "include",
        })
      );

      expect(result.data).toEqual({ message: "User created successfully" });
    });
  });

  describe("initiateGitHubOAuth", () => {
    it("should call GitHub OAuth endpoint", async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          auth_url: "https://github.com/login/oauth/authorize?...",
          state: "random-state",
          provider: "github",
        }),
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
      };
      
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await apiClient.initiateGitHubOAuth();

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8000/auth/oauth/github",
        expect.objectContaining({
          credentials: "include",
        })
      );

      expect(result.data).toHaveProperty("auth_url");
      expect(result.data).toHaveProperty("state");
    });
  });

  describe("handleGitHubCallback", () => {
    it("should call callback API endpoint", async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          access_token: "token",
          refresh_token: "refresh",
          user: { id: "123", email: "test@example.com" },
        }),
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
      };
      
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const callbackData = {
        code: "auth-code",
        state: "oauth-state",
      };

      const result = await apiClient.handleGitHubCallback(callbackData);

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8000/auth/oauth/github/callback/api",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(callbackData),
          credentials: "include",
        })
      );

      expect(result.data).toHaveProperty("access_token");
      expect(result.data).toHaveProperty("user");
    });
  });
});