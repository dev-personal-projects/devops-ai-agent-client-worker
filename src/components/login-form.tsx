"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useAuth } from "@/hooks/auth";
import { LoginRequest } from "@/types/auth/auth.types";
import { useGitHubOAuth } from "@/hooks/useGitHubOAuth";
import { apiClient } from "@/lib/api/auth-apiclient";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const { login, isLoading, error, clearError, user, isAuthenticated } = useAuth();
  const {
    initiateGitHubLogin,
    isLoading: githubLoading,
    error: githubError,
    clearError: clearGitHubError,
  } = useGitHubOAuth();

  const [loginAttempted, setLoginAttempted] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      if (redirectTo && redirectTo !== "/dashboard") {
        router.push(redirectTo);
      } else {
        router.push(`/${user.id}/dashboard`);
      }
    }
  }, [isAuthenticated, user, isLoading, router, redirectTo]);

  const handleGitHubLogin = async (forceAccountSelection: boolean = false) => {
    clearError();
    clearGitHubError();
    await initiateGitHubLogin({
      forceAccountSelection,
      redirectTo,
    });
  };

  const displayError = error || githubError;
  const isSubmitting = isLoading || githubLoading;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  const onSubmit = async (data: FormValues) => {
    clearError();
    setLoginAttempted(true);

    const loginData: LoginRequest = {
      email: data.email,
      password: data.password,
    };

    const success = await login(loginData);

    if (success) {
    } else {
      setLoginAttempted(false);
    }
  };

  if (loginAttempted && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Signing you in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {searchParams.get("redirectTo") && (
        <Alert>
          <AlertDescription>Please login to access that page</AlertDescription>
        </Alert>
      )}

        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {displayError && (
          <Alert variant="destructive">
            <AlertDescription>{displayError}</AlertDescription>
          </Alert>
        )}

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>

      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="underline underline-offset-4">
          Sign up
        </Link>
      </div>
    </div>
  );
}

function GitHubLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}