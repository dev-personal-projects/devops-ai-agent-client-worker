import { getOAuthErrorMessage, GITHUB_OAUTH_ERRORS, OAuthErrorCode } from "@/types/auth/oauth";

/**
 * OAuth Error Handler
 * Centralized error handling for OAuth flows
 */

export interface OAuthError {
  code: string;
  message: string;
  userMessage: string;
  canRetry: boolean;
  action?: "retry" | "contact_support" | "set_password" | "login";
}

/**
 * Parse and handle OAuth errors
 */
export function handleOAuthError(
  error: string | Error | unknown,
  context: "login" | "linking" | "update" | "disconnect" = "login"
): OAuthError {
  // Handle Error objects
  if (error instanceof Error) {
    return {
      code: "unknown_error",
      message: error.message,
      userMessage: "An unexpected error occurred. Please try again.",
      canRetry: true,
      action: "retry",
    };
  }

  // Handle string error codes
  if (typeof error === "string") {
    const errorCode = error.toLowerCase();

    // GitHub OAuth errors
    if (errorCode === GITHUB_OAUTH_ERRORS.ACCESS_DENIED) {
      return {
        code: errorCode,
        message: getOAuthErrorMessage(errorCode),
        userMessage:
          context === "linking"
            ? "You cancelled the GitHub account linking."
            : "You cancelled the GitHub authorization.",
        canRetry: true,
        action: "retry",
      };
    }

    // Backend OAuth errors
    if (errorCode.includes(OAuthErrorCode.ALREADY_LINKED)) {
      return {
        code: OAuthErrorCode.ALREADY_LINKED,
        message: getOAuthErrorMessage(OAuthErrorCode.ALREADY_LINKED),
        userMessage:
          "This GitHub account is already connected to a different user. Please use a different GitHub account.",
        canRetry: false,
        action: context === "login" ? "login" : undefined,
      };
    }

    if (errorCode.includes(OAuthErrorCode.CANNOT_DISCONNECT)) {
      return {
        code: OAuthErrorCode.CANNOT_DISCONNECT,
        message: getOAuthErrorMessage(OAuthErrorCode.CANNOT_DISCONNECT),
        userMessage:
          "Cannot disconnect your only authentication method. Please set a password first.",
        canRetry: false,
        action: "set_password",
      };
    }

    if (errorCode.includes(OAuthErrorCode.INVALID_STATE)) {
      return {
        code: OAuthErrorCode.INVALID_STATE,
        message: getOAuthErrorMessage(OAuthErrorCode.INVALID_STATE),
        userMessage: "Security validation failed. Please try again.",
        canRetry: true,
        action: "retry",
      };
    }

    if (errorCode.includes(OAuthErrorCode.EXPIRED_STATE)) {
      return {
        code: OAuthErrorCode.EXPIRED_STATE,
        message: getOAuthErrorMessage(OAuthErrorCode.EXPIRED_STATE),
        userMessage: "Your authentication session expired. Please try again.",
        canRetry: true,
        action: "retry",
      };
    }

    // Generic server errors
    if (errorCode.includes("server") || errorCode.includes("500")) {
      return {
        code: "server_error",
        message: error,
        userMessage: "Server error occurred. Please try again later.",
        canRetry: true,
        action: "retry",
      };
    }

    // Network errors
    if (errorCode.includes("network") || errorCode.includes("fetch")) {
      return {
        code: "network_error",
        message: error,
        userMessage: "Network error. Please check your connection and try again.",
        canRetry: true,
        action: "retry",
      };
    }

    // Default string error
    return {
      code: "unknown_error",
      message: error,
      userMessage: getOAuthErrorMessage(error, error),
      canRetry: true,
      action: "retry",
    };
  }

  // Unknown error type
  return {
    code: "unknown_error",
    message: String(error),
    userMessage: "An unexpected error occurred. Please try again.",
    canRetry: true,
    action: "retry",
  };
}

/**
 * Log OAuth errors for debugging
 */
export function logOAuthError(
  error: OAuthError,
  context: string,
  additionalInfo?: Record<string, any>
) {
  if (process.env.NODE_ENV === "development") {
    console.error(`[OAuth ${context}]`, {
      code: error.code,
      message: error.message,
      userMessage: error.userMessage,
      canRetry: error.canRetry,
      action: error.action,
      ...additionalInfo,
    });
  }
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: OAuthError): boolean {
  return error.canRetry && error.action === "retry";
}

/**
 * Get action button text based on error
 */
export function getErrorActionText(error: OAuthError, context: "login" | "linking" = "login"): string {
  switch (error.action) {
    case "retry":
      return "Try Again";
    case "contact_support":
      return "Contact Support";
    case "set_password":
      return "Set Password";
    case "login":
      return "Back to Login";
    default:
      return context === "linking" ? "Back to Dashboard" : "Back to Login";
  }
}