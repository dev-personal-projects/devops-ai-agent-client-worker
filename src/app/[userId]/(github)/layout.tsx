"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitBranch, Building2, GitPullRequest, Github } from "lucide-react";

interface GitHubLayoutProps {
  children: React.ReactNode;
}

export default function GitHubLayout({ children }: GitHubLayoutProps) {
  const params = useParams();
  const pathname = usePathname();
  const userId = params.userId as string;

  const navItems = [
    {
      href: `/${userId}/repositories`,
      label: "Repositories",
      path: "repositories",
      icon: GitBranch,
      description: "Browse your repositories",
    },
    {
      href: `/${userId}/pull-requests`,
      label: "Pull Requests",
      path: "pull-requests",
      icon: GitPullRequest,
      description: "Manage pull requests",
    },
    {
      href: `/${userId}/organizations`,
      label: "Organizations",
      path: "organizations",
      icon: Building2,
      description: "View organizations",
    },
  ];

  const isActive = (path: string) => pathname.includes(path);

  const getCurrentSection = () => {
    const activeItem = navItems.find((item) => isActive(item.path));
    return activeItem?.label || "GitHub";
  };

  return (
    <div className="flex flex-col h-full">
      {/* GitHub Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Github className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">{getCurrentSection()}</h2>
              </div>
              <Badge variant="secondary" className="text-xs">
                GitHub Integration
              </Badge>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center mt-4">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    href={item.href}
                    className={`group relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      active
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>

                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {item.description}
                    </div>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
