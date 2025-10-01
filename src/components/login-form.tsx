"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/api/utils/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useGitHubOAuth } from "@/hooks/useGitHubOAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Suspense } from "react";
import { OAUTH_CONFIG } from "@/constants/oauth-constants";

function LoginFormContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const {
    initiateGitHubLogin,
    isLoading: githubLoading,
    error: githubError,
    clearError: clearGitHubError,
  } = useGitHubOAuth();

  const handleGitHubLogin = async (forceAccountSelection: boolean = false) => {
    clearGitHubError();
    await initiateGitHubLogin({
      forceAccountSelection,
      redirectTo,
    });
  };

  return (
    <div
      className={cn("w-full max-w-sm mx-auto space-y-6", className)}
      {...props}
    >
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Sign in with your GitHub account to continue
        </p>
      </div>

      {redirectTo !== "/dashboard" && (
        <Alert>
          <AlertDescription>Please login to access that page</AlertDescription>
        </Alert>
      )}

      {githubError && (
        <Alert variant="destructive">
          <AlertDescription>{githubError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1 h-11"
            type="button"
            disabled={githubLoading}
            onClick={() => handleGitHubLogin(false)}
          >
            <GitHubLogo className="mr-2 h-5 w-5" />
            {githubLoading ? "Connecting..." : "Continue with GitHub"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11"
                type="button"
                disabled={githubLoading}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleGitHubLogin(true)}>
                Use different GitHub account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="underline underline-offset-4 hover:text-primary"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}

export function LoginForm(props: React.ComponentProps<"div">) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginFormContent {...props} />
    </Suspense>
  );
}

function GitHubLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}
