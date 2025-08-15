"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "../hooks/auth";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/auth-apiclient";
import { Github, Link, CheckCircle, AlertCircle, Loader2, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGitHubLink } from "../hooks/useGitHubLink";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { linkGitHub, isLinking, linkError, clearError } = useGitHubLink();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (user?.id) {
        try {
          const response = await apiClient.getCurrentProfile();
          if (response.data) {
            setProfile(response.data);
          }
        } finally {
          setLoading(false);
        }
      }
    }
    fetchProfile();
  }, [user]);

  // Check if user has GitHub linked - improved logic
  const hasGitHubLinked =
    profile?.oauth_github_id ||
    profile?.oauth_provider === "github" ||
    // If user signed up via GitHub OAuth, they already have it linked
    (profile?.oauth_provider && !profile?.oauth_github_id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">DevOps AI Dashboard</h1>
        <Button onClick={logout} variant="outline">
          Logout
        </Button>
      </div>

      {/* GitHub Linking Card - Only show for email-only users */}
      {!hasGitHubLinked && (
        <Card className="mb-6 border-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Link GitHub Account Required
            </CardTitle>
            <CardDescription>
              To access DevOps AI features, you need to link your GitHub account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {linkError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  {linkError === "This GitHub account is already linked to another user"
                    ? "This GitHub account is already connected to a different user. Please try with a different GitHub account."
                    : linkError}
                </AlertDescription>
              </Alert>
            )}
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  clearError();
                  linkGitHub();
                }}
                disabled={isLinking}
                size="lg"
                className="flex-1"
              >
                {isLinking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Github className="mr-2 h-4 w-4" />
                    Link GitHub Account
                  </>
                )}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="lg"
                    disabled={isLinking}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => {
                      clearError();
                      linkGitHub(true); // Force account selection
                    }}
                  >
                    Use different GitHub account
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success State - GitHub Connected */}
      {hasGitHubLinked && (
        <Card className="mb-6 border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              GitHub Connected
            </CardTitle>
            <CardDescription>
              {profile?.oauth_provider === "github"
                ? "You signed up with GitHub - full access enabled"
                : "GitHub account linked - full access enabled"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage 
                  src={profile?.avatar_url} 
                  alt={profile?.full_name || 'User avatar'}
                />
                <AvatarFallback>
                  <Github className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{profile?.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {profile?.email}
                </p>
                {profile?.oauth_provider === "github" && (
                  <p className="text-xs text-green-600">OAuth User</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* DevOps Features - Show for all GitHub-connected users */}
      {hasGitHubLinked ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Repository Analysis</CardTitle>
              <CardDescription>
                Analyze your GitHub repositories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Analyze Repos</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CI/CD Pipelines</CardTitle>
              <CardDescription>Manage deployment pipelines</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Manage Pipelines</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Infrastructure</CardTitle>
              <CardDescription>
                Deploy and manage infrastructure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Deploy Infrastructure</Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Alert>
          <AlertDescription>
            DevOps features will be available after linking your GitHub account
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
