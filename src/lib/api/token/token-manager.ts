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
      // Try to get from localStorage first (fallback)
      this.token = localStorage.getItem("access_token");
      this.refreshToken = localStorage.getItem("refresh_token");
      
      // Try to get from cookies (preferred for httpOnly)
      const cookies = this.parseCookies();
      if (cookies.access_token) {
        this.token = cookies.access_token;
      }
      if (cookies.refresh_token) {
        this.refreshToken = cookies.refresh_token;
      }
    }
  }

  private parseCookies(): Record<string, string> {
    if (typeof window === "undefined") return {};
    
    return document.cookie
      .split(";")
      .reduce((cookies, cookie) => {
        const [name, value] = cookie.trim().split("=");
        if (name && value) {
          cookies[name] = decodeURIComponent(value);
        }
        return cookies;
      }, {} as Record<string, string>);
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.token = accessToken;
    this.refreshToken = refreshToken;

    if (typeof window !== "undefined") {
      // Store in localStorage as fallback (backend sets httpOnly cookies)
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
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

      // Clear client-side cookies (httpOnly cookies are cleared by backend)
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
