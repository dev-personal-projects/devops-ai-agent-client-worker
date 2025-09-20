"use client";

import { useAuth } from "@/hooks/auth";
import { useEffect } from "react";

export function AuthChecker({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();

  useEffect(() => {
    const tokenCheckInterval = setInterval(() => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        return;
      }

      try {
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const currentTime = Date.now() / 1000;

          if (payload.exp && payload.exp < currentTime) {
            logout();
            return;
          }
        }
      } catch (error) {
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(tokenCheckInterval);
  }, [logout]);

  return <>{children}</>;
}
