"use client";

import { useAuth } from "@/hooks/auth";
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
    if (isLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      router.push("/auth/login");
      return;
    }

    if (requiredUserId && user.id !== requiredUserId) {
      router.push(`/${user.id}/dashboard`);
      return;
    }

    setIsChecking(false);
  }, [isAuthenticated, user, requiredUserId, router, isLoading]);

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