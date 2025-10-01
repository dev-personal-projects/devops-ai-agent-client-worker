import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/auth/auth-apiclient";
import { getPostAuthRedirect } from "@/constants/oauth-constants";
import { getValidationError, getAuthErrorMessage } from "@/utils/auth-constants";

interface SignupData {
  email: string;
  password: string;
  full_name: string;
}

interface LoginData {
  email: string;
  password: string;
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const signup = useCallback(async (data: SignupData) => {
    setIsLoading(true);
    setError(null);

    // Validate form data
    const emailError = getValidationError("email", data.email);
    const passwordError = getValidationError("password", data.password);
    const nameError = getValidationError("full_name", data.full_name);
    
    if (emailError || passwordError || nameError) {
      setError(emailError || passwordError || nameError);
      setIsLoading(false);
      return false;
    }

    try {
      const response = await apiClient.signup(data);

      if (response.error) {
        setError(getAuthErrorMessage(response.error.detail));
        setIsLoading(false);
        return false;
      }

      if (response.data) {
        // Redirect to login with success message
        router.push("/auth/login?message=signup_success");
        return true;
      }
    } catch (err) {
      setError(getAuthErrorMessage(err as string | Error, "Registration failed. Please try again."));
      setIsLoading(false);
    }

    return false;
  }, [router]);

  const login = useCallback(async (data: LoginData, redirectTo?: string) => {
    setIsLoading(true);
    setError(null);

    // Validate form data
    const emailError = getValidationError("email", data.email);
    const passwordError = getValidationError("password", data.password);
    
    if (emailError || passwordError) {
      setError(emailError || passwordError);
      setIsLoading(false);
      return false;
    }

    try {
      const response = await apiClient.login(data);

      if (response.error) {
        setError(getAuthErrorMessage(response.error.detail));
        setIsLoading(false);
        return false;
      }

      if (response.data) {
        const userData = apiClient.getUser();
        const userId = userData?.id;
        const redirectUrl = getPostAuthRedirect(userId, redirectTo);
        router.push(redirectUrl);
        return true;
      }
    } catch (err) {
      setError(getAuthErrorMessage(err as string | Error, "Login failed. Please try again."));
      setIsLoading(false);
    }

    return false;
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
      router.push("/auth/login");
    } catch (err) {
      // Still redirect to login even if logout fails
      apiClient.logout(); // Clear local tokens
      router.push("/auth/login");
    }
  }, [router]);

  return {
    signup,
    login,
    logout,
    isLoading,
    error,
    clearError: () => setError(null),
    isAuthenticated: apiClient.isAuthenticated(),
  };
}