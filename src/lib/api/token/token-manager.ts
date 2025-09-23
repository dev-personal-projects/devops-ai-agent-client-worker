export class TokenManager {
  private static instance: TokenManager;
  private token: string | null = null;
  private refreshToken: string | null = null;

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  loadTokens() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("access_token");
      this.refreshToken = localStorage.getItem("refresh_token");
    }
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.token = accessToken;
    this.refreshToken = refreshToken;

    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);

      const secure = window.location.protocol === "https:";
      const cookieOptions = `path=/; SameSite=strict${
        secure ? "; Secure" : ""
      }`;

      document.cookie = `access_token=${accessToken}; max-age=${
        60 * 60 * 24 * 7
      }; ${cookieOptions}`;
      document.cookie = `refresh_token=${refreshToken}; max-age=${
        60 * 60 * 24 * 30
      }; ${cookieOptions}`;
    }
  }

  setUserCookie(userId: string) {
    if (typeof window !== "undefined") {
      const secure = window.location.protocol === "https:";
      document.cookie = `user_id=${userId}; path=/; max-age=${
        60 * 60 * 24 * 7
      }; SameSite=strict${secure ? "; Secure" : ""}`;
    }
  }

  clearTokens() {
    this.token = null;
    this.refreshToken = null;

    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      const expiredCookie = "; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie = `access_token=${expiredCookie}`;
      document.cookie = `refresh_token=${expiredCookie}`;
      document.cookie = `user_id=${expiredCookie}`;
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }
}
