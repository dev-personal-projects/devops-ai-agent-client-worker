/**
 * OAuth Type Definitions
 * Matches backend FastAPI models
 */

export interface OAuthProvider {
  name: "github" | "google";
  displayName: string;
  icon?: string;
}

export interface OAuthInitiateRequest {
  provider: string;
  force_reauth?: boolean;
  mobile?: boolean;
  linking_mode?: boolean;
  replace_existing?: boolean;
}

export interface OAuthInitiateResponse {
  auth_url: string;
  state: string;
  provider: string;
}

export interface OAuthCallbackRequest {
  code: string;
  state?: string;
}

export interface OAuthCallbackResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    fullName: string;
    avatar_url?: string;
    oauth_provider?: string;
    oauth_github_id?: string;
  };
}

export interface GitHubAccountInfo {
  provider: "github";
  linked: boolean;
  github_id?: string;
  is_primary: boolean;
  avatar_url?: string;
}

export interface OAuthLinkResponse {
  message: string;
  provider: string;
  linked: boolean;
}

export interface OAuthDisconnectResponse {
  message: string;
  provider: string;
}

/**
 * OAuth Error Codes from Backend
 */
export enum OAuthErrorCode {
  INVALID_STATE = "invalid_oauth_state",
  EXPIRED_STATE = "expired_oauth_state",
  PROVIDER_ERROR = "oauth_provider_error",
  ALREADY_LINKED = "account_already_linked",
  NO_GITHUB_ACCOUNT = "no_github_account",
  CANNOT_DISCONNECT = "cannot_disconnect_primary",
}

/**
 * GitHub OAuth Error Response
 * Returned when user cancels or GitHub returns an error
 */
export interface GitHubOAuthError {
  error: string;
  error_description?: string;
  error_uri?: string;
}

/**
 * Common OAuth error types from GitHub
 */
export const GITHUB_OAUTH_ERRORS = {
  ACCESS_DENIED: "access_denied",
  INVALID_REQUEST: "invalid_request",
  UNAUTHORIZED_CLIENT: "unauthorized_client",
  UNSUPPORTED_RESPONSE_TYPE: "unsupported_response_type",
  INVALID_SCOPE: "invalid_scope",
  SERVER_ERROR: "server_error",
  TEMPORARILY_UNAVAILABLE: "temporarily_unavailable",
} as const;

/**
 * User-friendly error messages
 */
export const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  [GITHUB_OAUTH_ERRORS.ACCESS_DENIED]: "You cancelled the authorization.",
  [GITHUB_OAUTH_ERRORS.INVALID_REQUEST]: "Invalid OAuth request. Please try again.",
  [GITHUB_OAUTH_ERRORS.UNAUTHORIZED_CLIENT]: "Application not authorized. Please contact support.",
  [GITHUB_OAUTH_ERRORS.UNSUPPORTED_RESPONSE_TYPE]: "OAuth configuration error. Please contact support.",
  [GITHUB_OAUTH_ERRORS.INVALID_SCOPE]: "Invalid permissions requested. Please contact support.",
  [GITHUB_OAUTH_ERRORS.SERVER_ERROR]: "GitHub server error. Please try again later.",
  [GITHUB_OAUTH_ERRORS.TEMPORARILY_UNAVAILABLE]: "GitHub is temporarily unavailable. Please try again later.",
  [OAuthErrorCode.INVALID_STATE]: "Invalid authentication state. Please try again.",
  [OAuthErrorCode.EXPIRED_STATE]: "Authentication session expired. Please try again.",
  [OAuthErrorCode.PROVIDER_ERROR]: "GitHub authentication failed. Please try again.",
  [OAuthErrorCode.ALREADY_LINKED]: "This GitHub account is already linked to another user.",
  [OAuthErrorCode.NO_GITHUB_ACCOUNT]: "No GitHub account is currently linked.",
  [OAuthErrorCode.CANNOT_DISCONNECT]: "Cannot disconnect your only authentication method. Set a password first.",
};

/**
 * Get user-friendly error message
 */
export function getOAuthErrorMessage(error: string, defaultMessage?: string): string {
  return OAUTH_ERROR_MESSAGES[error] || defaultMessage || "An unexpected error occurred.";
}