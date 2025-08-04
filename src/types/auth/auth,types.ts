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
  };
}


export interface ErrorResponse {
  detail: string;
}


export interface ApiResponse <T>
{
  data?: T;
  error?: ErrorResponse;
  status: number
}