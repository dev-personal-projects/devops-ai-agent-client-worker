"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ClientRedirectProps {
  to: string;
  delay?: number;
}

export function ClientRedirect({ to, delay = 0 }: ClientRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(to);
    }, delay);

    return () => clearTimeout(timer);
  }, [to, delay, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}