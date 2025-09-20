"use client";

import { use } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { useUserContext } from "@/components/user-provider";
import { AuthGuard } from "@/components/auth-guard";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  GitBranch,
  BarChart3,
  Settings,
  Github,
} from "lucide-react";

interface DashboardPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const { userId } = use(params);
  const { currentUser, profile } = useUserContext();

  return (
    <AuthGuard requiredUserId={userId}>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/${userId}/dashboard`}>
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex flex-1 justify-end">
          <ModeToggle />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  Welcome back, {currentUser?.fullName || "User"}!
                </CardTitle>
                <CardDescription>
                  Here&apos;s what&apos;s happening with your DevOps workflows
                  today.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground">
                    Email: {currentUser?.email}
                  </p>
                  {profile?.oauth_provider && (
                    <div className="flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground">
                        Connected via {profile.oauth_provider}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Active workflows
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Start New Chat
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Converse with the AI agent
              </p>
              <Button size="sm" className="mt-2 w-full">
                New Chat
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Repository Analysis
              </CardTitle>
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Analyze your GitHub repos
              </p>
              <Button size="sm" variant="outline" className="mt-2 w-full">
                Browse Repos
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Infrastructure
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Monitor your infrastructure
              </p>
              <Button size="sm" variant="outline" className="mt-2 w-full">
                View Analysis
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Settings</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Manage your preferences
              </p>
              <Button size="sm" variant="outline" className="mt-2 w-full">
                Configure
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest interactions with the AI agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  No recent activity
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connected Services</CardTitle>
              <CardDescription>Manage your integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {profile?.oauth_provider ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      <span className="text-sm">GitHub</span>
                    </div>
                    <span className="text-xs text-green-600">Connected</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No services connected
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}