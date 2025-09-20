"use client";

import { useAuth } from "@/app/hooks/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredUserId?: string;
}

export function AuthGuard({ children, requiredUserId }: AuthGuardProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) {
      return;
    }

    console.log("AuthGuard check:", { 
      isAuthenticated, 
      userId: user?.id, 
      requiredUserId,
      isLoading 
    });

    // Not authenticated - redirect to login
    if (!isAuthenticated || !user) {
      console.log("Not authenticated, redirecting to login");
      router.push("/auth/login");
      return;
    }

    // Wrong user - redirect to correct user dashboard
    if (requiredUserId && user.id !== requiredUserId) {
      console.log("Wrong user, redirecting to correct dashboard");
      router.push(`/${user.id}/dashboard`);
      return;
    }

    // All good
    setIsChecking(false);
  }, [isAuthenticated, user, requiredUserId, router, isLoading]);

  // Show loading while auth is loading or checking
  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}