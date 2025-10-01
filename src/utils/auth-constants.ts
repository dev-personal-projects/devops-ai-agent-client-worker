/**
 * Authentication Constants
 * Centralized constants for authentication flows
 */

export const AUTH_ERROR_MESSAGES = {
  // Generic errors
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  SERVER_ERROR: "Server error occurred. Please try again later.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
  
  // Authentication errors
  INVALID_CREDENTIALS: "Invalid email or password. Please try again.",
  EMAIL_NOT_VERIFIED: "Please verify your email address before signing in.",
  ACCOUNT_LOCKED: "Your account has been temporarily locked. Please contact support.",
  
  // OAuth errors
  OAUTH_CANCELLED: "You cancelled the authorization.",
  OAUTH_FAILED: "Authentication failed. Please try again.",
  OAUTH_STATE_INVALID: "Security validation failed. Please try again.",
  OAUTH_STATE_EXPIRED: "Authentication session expired. Please try again.",
  
  // GitHub specific
  GITHUB_ACCOUNT_ALREADY_LINKED: "This GitHub account is already connected to another user.",
  GITHUB_NO_ACCOUNT: "No GitHub account is currently linked.",
  GITHUB_CANNOT_DISCONNECT: "Cannot disconnect your only authentication method. Set a password first.",
  
  // Registration errors
  EMAIL_ALREADY_EXISTS: "An account with this email already exists.",
  WEAK_PASSWORD: "Password must be at least 6 characters long.",
  REGISTRATION_FAILED: "Registration failed. Please try again.",
  
  // Session errors
  SESSION_EXPIRED: "Your session has expired. Please sign in again.",
  TOKEN_REFRESH_FAILED: "Session refresh failed. Please sign in again.",
} as const;

export const AUTH_SUCCESS_MESSAGES = {
  SIGNUP_SUCCESS: "Account created successfully! Please sign in to continue.",
  LOGIN_SUCCESS: "Welcome back! Redirecting to your dashboard...",
  LOGOUT_SUCCESS: "You have been signed out successfully.",
  GITHUB_LINKED: "GitHub account linked successfully!",
  GITHUB_UPDATED: "GitHub account updated successfully!",
  GITHUB_DISCONNECTED: "GitHub account disconnected successfully.",
} as const;

export const AUTH_LOADING_MESSAGES = {
  SIGNING_UP: "Creating your account...",
  SIGNING_IN: "Signing you in...",
  SIGNING_OUT: "Signing you out...",
  GITHUB_CONNECTING: "Connecting to GitHub...",
  GITHUB_LINKING: "Linking GitHub account...",
  GITHUB_UPDATING: "Updating GitHub account...",
  PROCESSING: "Processing...",
} as const;

export const AUTH_VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
} as const;

export const AUTH_TIMEOUTS = {
  OAUTH_REDIRECT_DELAY: 2000, // 2 seconds
  SUCCESS_MESSAGE_DELAY: 3000, // 3 seconds
  ERROR_MESSAGE_DELAY: 5000, // 5 seconds
} as const;

/**
 * Get user-friendly error message
 */
export function getAuthErrorMessage(
  error: string | Error,
  fallback: string = AUTH_ERROR_MESSAGES.UNKNOWN_ERROR
): string {
  if (error instanceof Error) {
    error = error.message;
  }

  const errorKey = error.toUpperCase().replace(/\s+/g, "_");
  
  // Check if we have a specific message for this error
  for (const [key, message] of Object.entries(AUTH_ERROR_MESSAGES)) {
    if (errorKey.includes(key) || error.toLowerCase().includes(key.toLowerCase())) {
      return message;
    }
  }

  return fallback;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return AUTH_VALIDATION.EMAIL_REGEX.test(email);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  return password.length >= AUTH_VALIDATION.PASSWORD_MIN_LENGTH;
}

/**
 * Validate full name
 */
export function isValidName(name: string): boolean {
  return (
    name.length >= AUTH_VALIDATION.NAME_MIN_LENGTH &&
    name.length <= AUTH_VALIDATION.NAME_MAX_LENGTH &&
    name.trim().length > 0
  );
}

/**
 * Get validation error message
 */
export function getValidationError(field: string, value: string): string | null {
  switch (field) {
    case "email":
      if (!value) return "Email is required";
      if (!isValidEmail(value)) return "Please enter a valid email address";
      break;
    case "password":
      if (!value) return "Password is required";
      if (!isValidPassword(value)) return `Password must be at least ${AUTH_VALIDATION.PASSWORD_MIN_LENGTH} characters long`;
      break;
    case "full_name":
      if (!value) return "Full name is required";
      if (!isValidName(value)) return "Please enter a valid name (2-50 characters)";
      break;
  }
  return null;
}