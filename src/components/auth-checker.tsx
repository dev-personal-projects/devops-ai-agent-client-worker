// components/auth/auth-checker.tsx
"use client";

import { useAuth } from "@/app/hooks/auth";
import { useEffect } from "react";

// const publicRoutes = [
//   "/login",
//   "/signup",
//   "/forgot-password",
//   "/reset-password",
// ];

export function AuthChecker({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();

  useEffect(() => {
    // Check token validity periodically (every 5 minutes)
    const tokenCheckInterval = setInterval(() => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        // Token was removed, but don't auto-logout unless we're on a protected route
        // Let the middleware handle redirects
        return;
      }

      // Optional: Check token expiration
      try {
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const currentTime = Date.now() / 1000;

          if (payload.exp && payload.exp < currentTime) {
            // Token expired, logout user
            logout();
            return;
          }
        }
      } catch (error) {
        // Invalid token format - let middleware handle it
        console.warn("Invalid token format detected");
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    // Cleanup interval on unmount
    return () => clearInterval(tokenCheckInterval);
  }, [logout]);

  return <>{children}</>;
}
