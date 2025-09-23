"use client";

import { Organization } from "@/types/github/organizations/organizations";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Building2,
  MapPin,
  Mail,
  ExternalLink,
  GitBranch,
  Calendar,
  Globe,
} from "lucide-react";

interface OrganizationCardProps {
  organization: Organization;
  className?: string;
}

export function OrganizationCard({
  organization,
  className,
}: OrganizationCardProps) {
  const formatDate = (date?: string) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      className={`group hover:shadow-lg transition-all duration-200 ${className}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={organization.avatar_url}
              alt={organization.login}
              className="object-cover"
            />
            <AvatarFallback className="text-lg font-semibold bg-muted">
              {getInitials(organization.name || organization.login)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  {organization.name || organization.login}
                </h3>
                <p className="text-sm text-muted-foreground">
                  @{organization.login}
                </p>
              </div>

              {organization.html_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <a
                    href={organization.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>

            {organization.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {organization.description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Repository Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{organization.total_repos}</span>
              <span className="text-muted-foreground">repositories</span>
            </div>

            {organization.public_repos > 0 && (
              <Badge variant="secondary" className="text-xs">
                {organization.public_repos} public
              </Badge>
            )}

            {organization.private_repos > 0 && (
              <Badge variant="outline" className="text-xs">
                {organization.private_repos} private
              </Badge>
            )}
          </div>

          {/* Organization Details */}
          <div className="space-y-2">
            {organization.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{organization.location}</span>
              </div>
            )}

            {organization.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{organization.email}</span>
              </div>
            )}

            {organization.blog && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                <a
                  href={
                    organization.blog.startsWith("http")
                      ? organization.blog
                      : `https://${organization.blog}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors truncate"
                >
                  {organization.blog}
                </a>
              </div>
            )}

            {organization.created_at && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Created {formatDate(organization.created_at)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
