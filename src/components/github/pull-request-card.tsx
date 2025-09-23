"use client";

import {
  PullRequest,
  PullRequestState,
  MergeableState,
} from "@/types/github/pull-request/pullrequest";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  GitPullRequest,
  GitMerge,
  MessageSquare,
  GitCommit,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Calendar,
  Edit,
} from "lucide-react";
import Link from "next/link";

interface PullRequestCardProps {
  pullRequest: PullRequest;
  userId: string;
  className?: string;
}

export function PullRequestCard({
  pullRequest,
  userId,
  className,
}: PullRequestCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStateIcon = () => {
    if (pullRequest.merged) {
      return <GitMerge className="h-4 w-4" />;
    }

    switch (pullRequest.state) {
      case PullRequestState.OPEN:
        return <GitPullRequest className="h-4 w-4" />;
      case PullRequestState.CLOSED:
        return <XCircle className="h-4 w-4" />;
      default:
        return <GitPullRequest className="h-4 w-4" />;
    }
  };

  const getStateColor = () => {
    if (pullRequest.merged) {
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
    }

    switch (pullRequest.state) {
      case PullRequestState.OPEN:
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      case PullRequestState.CLOSED:
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
    }
  };

  const getMergeabilityBadge = () => {
    if (pullRequest.state !== PullRequestState.OPEN) return null;

    if (pullRequest.mergeable === false) {
      return (
        <Badge variant="destructive" className="text-xs">
          <XCircle className="h-3 w-3 mr-1" />
          Conflicts
        </Badge>
      );
    }

    if (pullRequest.mergeable === true) {
      return (
        <Badge
          variant="default"
          className="text-xs bg-green-500/10 text-green-600 dark:text-green-400"
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Ready
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="text-xs">
        <AlertCircle className="h-3 w-3 mr-1" />
        Checking
      </Badge>
    );
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
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs ${getStateColor()}`}
                >
                  {getStateIcon()}
                  <span className="ml-1 capitalize">
                    {pullRequest.merged ? "Merged" : pullRequest.state}
                  </span>
                </Badge>

                {pullRequest.draft && (
                  <Badge variant="secondary" className="text-xs">
                    <Edit className="h-3 w-3 mr-1" />
                    Draft
                  </Badge>
                )}

                {getMergeabilityBadge()}
              </div>

              <Button
                variant="ghost"
                size="sm"
                asChild
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <a
                  href={pullRequest.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>

            <Link
              href={`/${userId}/pull-requests/${pullRequest.number}`}
              className="block"
            >
              <h3 className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-2">
                {pullRequest.title}
              </h3>
            </Link>

            <p className="text-sm text-muted-foreground mt-1">
              #{pullRequest.number} opened {formatDate(pullRequest.created_at)}
            </p>
          </div>
        </div>

        {pullRequest.body && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {pullRequest.body}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={pullRequest.user.avatar_url}
                  alt={pullRequest.user.login}
                />
                <AvatarFallback className="text-xs">
                  {getInitials(pullRequest.user.login)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {pullRequest.user.login}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{pullRequest.comments}</span>
              </div>

              <div className="flex items-center gap-1">
                <GitCommit className="h-4 w-4" />
                <span>{pullRequest.commits}</span>
              </div>

              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <span>+{pullRequest.additions}</span>
              </div>

              <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <span>-{pullRequest.deletions}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(pullRequest.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Branch Information */}
        <div className="flex items-center gap-2 mt-3 text-sm">
          <Badge variant="outline" className="text-xs font-mono">
            {pullRequest.head.ref}
          </Badge>
          <span className="text-muted-foreground">→</span>
          <Badge variant="outline" className="text-xs font-mono">
            {pullRequest.base.ref}
          </Badge>
        </div>

        {/* Labels */}
        {pullRequest.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {pullRequest.labels.slice(0, 3).map((label) => (
              <Badge
                key={label.id}
                variant="secondary"
                className="text-xs px-2 py-1"
                style={{
                  backgroundColor: `#${label.color}20`,
                  color: `#${label.color}`,
                }}
              >
                {label.name}
              </Badge>
            ))}
            {pullRequest.labels.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-1">
                +{pullRequest.labels.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
