"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  Github,
  Loader2,
  LogOut,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/auth";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/auth-apiclient";
import { useGitHubLink } from "@/hooks/useGitHubLink";

type User = {
  name: string;
  email: string;
  avatar: string;
};

export function NavUser() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [githubInfo, setGithubInfo] = useState<any>(null);
  const { disconnectGitHub, isLinking, linkError } = useGitHubLink();

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const response = await apiClient.getCurrentProfile();
        if (response.data) {
          setProfile(response.data);
          if (
            response.data.oauth_github_id ||
            response.data.oauth_provider === "github"
          ) {
            const githubResponse = await apiClient.getGitHubInfo();
            if (githubResponse.data) {
              setGithubInfo(githubResponse.data);
            }
          }
        }
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  const hasGitHubLinked =
    profile?.oauth_github_id ||
    profile?.oauth_provider === "github" ||
    (profile?.oauth_provider && !profile?.oauth_github_id);

  const handleDisconnect = async () => {
    if (confirm("Are you sure you want to disconnect your GitHub account?")) {
      const success = await disconnectGitHub();
      if (success) {
        window.location.reload();
      }
    }
  };
  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };

  const { isMobile } = useSidebar();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={profile?.avatar_url || user?.avatar_url || ""}
                  alt={user?.fullName ?? ""}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <AvatarFallback className="rounded-lg">
                  {user?.fullName
                    ? user.fullName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                    : "CN"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user?.fullName ?? ""}
                </span>
                <span className="truncate text-xs">{user?.email ?? ""}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={profile?.avatar_url || user?.avatar_url || ""}
                    alt={user?.fullName ?? ""}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <AvatarFallback className="rounded-lg">
                    {user?.fullName ? (
                      user.fullName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                    ) : (
                      <Github className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.fullName}</span>
                  <span className="truncate text-xs">{user?.email ?? ""}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
