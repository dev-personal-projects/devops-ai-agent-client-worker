"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/auth";
import { apiClient } from "@/lib/api/auth-apiclient";
import { Loader2 } from "lucide-react";

// Types
interface User {
  id: string;
  email: string;
  fullName: string;
  avatar_url?: string;
}

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  oauth_provider?: string;
  oauth_github_id?: string;
  avatar_url?: string;
}

interface UserContextType {
  userId: string;
  currentUser: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
}

// Context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Hook to use the user context
export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
}

// Provider component
interface UserProviderProps {
  children: React.ReactNode;
  userId: string;
}

export function UserProvider({ children, userId }: UserProviderProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser, logout } = useAuth();
  const router = useRouter();

  const refreshProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.getCurrentProfile();
      if (response.data) {
        setProfile(response.data);
      } else if (response.error) {
        setError(response.error.detail);
      }
    } catch (err) {
      setError("Failed to load profile");
      console.error("Profile fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check if the current user matches the URL userId
    if (currentUser && currentUser.id !== userId) {
      // User is trying to access another user's space
      console.warn(
        `User ${currentUser.id} attempting to access ${userId}'s space`
      );
      router.replace(`/${currentUser.id}/dashboard`);
      return;
    }

    // If no current user, redirect to login
    if (!currentUser) {
      router.replace("/auth/login");
      return;
    }

    // Load user profile
    refreshProfile();
  }, [userId, currentUser, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <svg
              className="h-6 w-6 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Failed to Load User Data</h3>
            <p className="text-muted-foreground mt-1">{error}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={refreshProfile}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
            <button
              onClick={() => logout()}
              className="px-4 py-2 border border-border rounded-md hover:bg-accent"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Provide context to children
  const contextValue: UserContextType = {
    userId,
    currentUser,
    profile,
    isLoading,
    error,
    refreshProfile,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}
