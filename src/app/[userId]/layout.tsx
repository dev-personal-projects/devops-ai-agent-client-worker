import { AppSidebar } from "@/components/app-sidebar";
import { UserProvider } from "@/components/user-provider";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface UserLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    userId: string;
  }>;
}

function LayoutLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <Card className="w-full max-w-md mx-4 border-0 shadow-lg">
        <CardContent className="flex flex-col items-center gap-6 p-8">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse rounded-full"></div>
            <Loader2 className="relative h-12 w-12 animate-spin text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold tracking-tight">
              Loading Dashboard
            </h3>
            <p className="text-sm text-muted-foreground">
              Please wait while we prepare your workspace
            </p>
          </div>
          <div className="w-full space-y-2">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full animate-pulse"
                style={{ width: "60%" }}
              ></div>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Initializing your DevOps environment...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

//

export default async function UserLayout({
  children,
  params,
}: UserLayoutProps) {
  const { userId } = await params;

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!userId || !uuidRegex.test(userId)) {
    redirect("/auth/login?error=invalid_user_id");
  }

  return (
    <UserProvider userId={userId}>
      <div className="flex h-screen w-full bg-background">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 flex flex-col overflow-hidden">
              <Suspense fallback={<LayoutLoading />}>
                <div className="flex-1 overflow-auto">{children}</div>
              </Suspense>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </UserProvider>
  );
}

export async function generateMetadata() {
  return {
    title: "DevOps AI Agent - Dashboard",
    description: "Manage your DevOps workflows with AI assistance",
    robots: "noindex, nofollow",
    other: {
      "theme-color": "#000000",
      "color-scheme": "light dark",
    },
  };
}

export function generateStaticParams() {
  return [];
}
