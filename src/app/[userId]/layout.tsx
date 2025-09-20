import { AppSidebar } from "@/components/app-sidebar";
import { UserProvider } from "@/components/user-provider";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

interface UserLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    userId: string;
  }>;
}

function LayoutLoading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>
  );
}

export default async function UserLayout({
  children,
  params,
}: UserLayoutProps) {
  const { userId } = await params;

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    redirect("/auth/login");
  }

  return (
    <UserProvider userId={userId}>
      <div className="flex h-screen w-full">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="flex-1 flex flex-col">
            <div className="flex-1 flex flex-col overflow-hidden">
              <Suspense fallback={<LayoutLoading />}>{children}</Suspense>
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
    robots: "noindex, nofollow", // User-specific pages shouldn't be indexed
  };
}

export function generateStaticParams() {
  return [];
}
