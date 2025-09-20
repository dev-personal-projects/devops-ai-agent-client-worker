"use client";
import { apiClient } from "@/lib/api/auth-apiclient";
import { LoginRequest, SignupRequest } from "@/types/auth/auth.types";
import { useState, useEffect } from "react";

export function useAuth() {
  const [user, setUser] = useState<{
    id: string;
    email: string;
    fullName: string;
    avatar_url?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with true
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = () => {
      const storedUser = apiClient.getUser();
      const token = apiClient.getToken();

      if (token && storedUser) {
        setUser(storedUser);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.login(credentials);

      if (response.error) {
        setError(response.error.detail);
        setIsLoading(false);
        return false;
      }

      if (response.data) {
        setUser(response.data.user);
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setIsLoading(false);
        return true;
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      setIsLoading(false);
    }

    return false;
  };

  const signup = async (userData: SignupRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.signup(userData);

      if (response.error) {
        setError(response.error.detail);
        return false;
      }

      if (response.data) {
        const loginSuccess = await login({
          email: userData.email,
          password: userData.password,
        });
        return loginSuccess;
      }
    } catch (err) {
      setError("Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    apiClient.logout();
  };

  const isAuthenticated = !!user && !!apiClient.getToken();

  return {
    user,
    isLoading,
    error,
    login,
    signup,
    logout,
    isAuthenticated,
    clearError: () => setError(null),
  };
}