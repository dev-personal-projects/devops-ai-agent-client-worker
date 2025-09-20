export interface SignupRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ProfileResponse {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  location?: string;
  oauth_provider?: string; // 'github', 'google', etc.
  oauth_github_id?: string; // GitHub user ID if linked
  oauth_google_id?: string; // Google user ID if linked
}

export interface SignupResponse {
  message: string;
  user_id: string;
  email: string;
  full_name: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    fullName: string;
    avatar_url?: string;
  };
}

export interface ErrorResponse {
  detail: string;
  code?: string;
  field?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ErrorResponse;
  status: number;
}

export interface OAuthInitiateResponse {
  auth_url: string;
  state: string;
  provider?: string;
}

export interface OAuthCallbackRequest {
  code: string;
  state?: string;
}
