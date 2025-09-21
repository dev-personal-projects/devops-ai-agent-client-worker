// src/components/global-not-found.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Home, 
  ArrowLeft, 
  Search, 
  MapPin, 
  Compass,
  ExternalLink,
  GitBranch,
  Settings,
  BarChart3,
  MessageSquare,
  WifiOff,
  Wifi
} from "lucide-react";
import { useState, useEffect } from "react";

interface NotFoundProps {
  title?: string;
  description?: string;
  showQuickLinks?: boolean;
  showSearch?: boolean;
  homeUrl?: string;
  className?: string;
}

const quickLinks = [
  {
    icon: Home,
    title: "Dashboard",
    description: "Return to your main workspace",
    href: "/dashboard",
    color: "text-blue-600 dark:text-blue-400"
  },
  {
    icon: MessageSquare,
    title: "AI Chat",
    description: "Start a conversation with your AI assistant",
    href: "/chat",
    color: "text-green-600 dark:text-green-400"
  },
  {
    icon: GitBranch,
    title: "Repositories",
    description: "Manage your GitHub repositories",
    href: "/repositories",
    color: "text-purple-600 dark:text-purple-400"
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "View your DevOps performance metrics",
    href: "/analytics",
    color: "text-orange-600 dark:text-orange-400"
  }
];

const commonIssues = [
  {
    issue: "Page moved or deleted",
    solution: "The page you're looking for might have been relocated or removed in a recent update."
  },
  {
    issue: "Incorrect URL",
    solution: "Please check the URL for any typos or formatting errors."
  },
  {
    issue: "Permission required",
    solution: "You may need additional permissions to access this resource."
  },
  {
    issue: "Temporary issue",
    solution: "Our servers might be experiencing temporary issues. Try again in a few moments."
  }
];

export function GlobalNotFound({
  title = "Page Not Found",
  description = "The page you're looking for doesn't exist or has been moved to a different location.",
  showQuickLinks = true,
  showSearch = true,
  homeUrl = "/",
  className = ""
}: NotFoundProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className={`flex h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4 ${className}`}>
      <div className="w-full max-w-4xl space-y-8">
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted/50 border-4 border-dashed border-muted-foreground/20">
              <MapPin className="h-12 w-12 text-muted-foreground/60" />
            </div>
            <CardTitle className="text-4xl font-bold">{title}</CardTitle>
            <CardDescription className="text-lg mt-3 max-w-md mx-auto">
              {description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {!isOnline && (
              <Alert className="border-orange-200 dark:border-orange-800">
                <WifiOff className="h-4 w-4" />
                <AlertDescription>
                  You appear to be offline. Some features may not work properly.
                </AlertDescription>
              </Alert>
            )}

            {showSearch && (
              <div className="max-w-md mx-auto">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search for pages or resources..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button type="submit" disabled={!searchQuery.trim() || !isOnline}>
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Try searching for specific features or tools
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <Button asChild className="flex-1 group">
                <Link href={homeUrl}>
                  <Home className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  Go Home
                </Link>
              </Button>
              <Button variant="outline" onClick={() => window.history.back()} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>

        {showQuickLinks && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((link, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer border-0">
                <Link href={link.href}>
                  <CardContent className="p-6 text-center space-y-3">
                    <div className={`mx-auto w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform ${link.color}`}>
                      <link.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{link.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{link.description}</p>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Common Issues and Solutions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {commonIssues.map((item, index) => (
                <div key={index} className="space-y-2 p-4 rounded-lg bg-muted/30">
                  <h4 className="font-medium text-sm">{item.issue}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.solution}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Still need help finding what you're looking for?
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/help" className="flex items-center">
                <ExternalLink className="mr-2 h-3 w-3" />
                Help Center
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/support" className="flex items-center">
                <ExternalLink className="mr-2 h-3 w-3" />
                Contact Support
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}