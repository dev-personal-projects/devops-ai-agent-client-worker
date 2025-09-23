import { apiClient } from "../auth/auth-apiclient";

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("apiClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initiateGitHubOAuth", () => {
    it("should call GitHub OAuth initiation endpoint", async () => {
      const mockResponseData = {
        auth_url: "https://github.com/login/oauth/authorize",
        state: "test-state",
      };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponseData),
      });

      const result = await apiClient.initiateGitHubOAuth();

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/auth/oauth/github",
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
      expect(result.data).toEqual(mockResponseData);
      expect(result.error).toBeUndefined();
    });

    it("should handle API errors", async () => {
      const mockErrorData = { detail: "OAuth setup failed" };
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve(mockErrorData),
      });

      const result = await apiClient.initiateGitHubOAuth();

      expect(result.data).toBeUndefined();
      expect(result.error).toEqual(mockErrorData);
      expect(result.status).toBe(400);
    });
  });

  describe("handleGitHubCallback", () => {
    it("should handle GitHub callback successfully", async () => {
      const mockResponseData = {
        access_token: "test-token",
        refresh_token: "test-refresh",
        token_type: "Bearer",
        expires_in: 3600,
        user: { id: "123", email: "test@example.com", fullName: "Test User" },
      };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponseData),
      });

      const result = await apiClient.handleGitHubCallback({
        code: "test-code",
        state: "test-state",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/auth/oauth/github/callback",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ code: "test-code", state: "test-state" }),
        })
      );
      expect(result.data).toEqual(mockResponseData);
      expect(result.error).toBeUndefined();
    });
  });
});
