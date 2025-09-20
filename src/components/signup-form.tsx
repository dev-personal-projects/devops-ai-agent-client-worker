"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { SignupRequest } from "@/types/auth/auth.types";
import { useAuth } from "@/hooks/auth";
import { useGitHubOAuth } from "@/hooks/useGitHubOAuth";
import { LucideGithub } from "lucide-react";

const schema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { signup, isLoading, error, clearError } = useAuth();
  const {
    initiateGitHubLogin,
    isLoading: githubLoading,
    error: githubError,
  } = useGitHubOAuth();

  const handleGitHubLogin = async () => {
    clearError();
    await initiateGitHubLogin();
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

    const signupData: SignupRequest = {
      email: data.email,
      password: data.password,
      full_name: data.full_name,
    };

    const success = await signup(signupData);

    if (success) {
      router.push("/auth/login");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {displayError && (
          <p className="text-sm text-red-600 text-center">{displayError}</p>
        )}

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>

        <Button
          variant="outline"
          className="w-full"
          type="button"
          disabled={isSubmitting}
          onClick={handleGitHubLogin}
        >
          <LucideGithub className="mr-2 h-4 w-4" />
          {githubLoading ? "Connecting..." : "Login with GitHub"}
        </Button>
      </form>

      </div>
  );
}