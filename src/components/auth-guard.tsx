"use client";

import { useAuth } from "@/app/hooks/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredUserId?: string;
}

export function AuthGuard({ children, requiredUserId }: AuthGuardProps) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated) {
        router.push("/auth/login");
        return;
      }

      if (requiredUserId && user?.id !== requiredUserId) {
        router.push(`/${user?.id}/dashboard`);
        return;
      }

      setIsChecking(false);
    };

    // Small delay to ensure auth state is loaded
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, requiredUserId, router]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}