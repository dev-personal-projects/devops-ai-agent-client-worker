"use client";
import { apiClient } from "@/lib/api/auth/auth-apiclient";
import { useState, useEffect } from "react";

export function useAuth() {
  const [user, setUser] = useState<{
    id: string;
    email: string;
    fullName: string;
    avatar_url?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const logout = () => {
    setUser(null);
    apiClient.logout();
  };

  const isAuthenticated = !!user && !!apiClient.getToken();

  return {
    user,
    isLoading,
    logout,
    isAuthenticated,
  };
}
