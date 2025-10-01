export const OAUTH_CONFIG = {
  STORAGE_KEYS: {
    OAUTH_REDIRECT: "github_oauth_redirect",
  },
  GITHUB_LOGOUT_DELAY_MS: 1500,
} as const;

export const TOKEN_CONFIG = {
  STORAGE_KEYS: {
    ACCESS_TOKEN: "access_token",
    REFRESH_TOKEN: "refresh_token",
    USER_DATA: "user",
    USER_ID: "user_id",
  },
  COOKIE: {
    PATH: "/",
    SAME_SITE: "strict" as const,
    SECURE: process.env.NODE_ENV === "production",
  },
} as const;

export const AUTH_ROUTES = {
  PUBLIC: ["/", "/auth/login", "/auth/signup", "/auth/callback"],
  PROTECTED: ["/dashboard", "/profile", "/settings"],
  LOGIN: "/auth/login",
  DEFAULT_REDIRECT: "/dashboard",
} as const;

export function isProtectedRoute(pathname: string): boolean {
  return AUTH_ROUTES.PROTECTED.some((route) => pathname.startsWith(route));
}

export function isPublicRoute(pathname: string): boolean {
  return AUTH_ROUTES.PUBLIC.includes(pathname as any);
}

export function getPostAuthRedirect(userId?: string, customRedirect?: string): string {
  if (customRedirect) return customRedirect;
  if (userId) return `/${userId}${AUTH_ROUTES.DEFAULT_REDIRECT}`;
  return AUTH_ROUTES.DEFAULT_REDIRECT;
}