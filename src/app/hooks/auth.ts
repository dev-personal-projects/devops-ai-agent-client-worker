"use client"
import { apiClient } from '@/lib/api/auth-apiclient';
import { LoginRequest, SignupRequest } from '@/types/auth/auth,types';
import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = apiClient.getUser();
    setUser(storedUser);
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.login(credentials);
      
      if (response.error) {
        setError(response.error.detail);
        return false;
      }

      if (response.data) {
        setUser(response.data.user);
        return true;
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
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

      // Auto-login after successful signup
      if (response.data) {
        const loginSuccess = await login({
          email: userData.email,
          password: userData.password,
        });
        return loginSuccess;
      }
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
    
    return false;
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
  };

  const isAuthenticated = apiClient.isAuthenticated();

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