"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { GitHubApiClient } from "@/lib/api/github/github-api-client";
import {
  PullRequest,
  PullRequestState,
} from "@/types/github/pull-request/pullrequest";
import { PullRequestCard } from "@/components/github/pull-request-card";
import {
  LoadingGrid,
  EmptyState,
  ErrorState,
  PageLoadingSpinner,
} from "@/components/github/loading-states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RefreshCw,
  Search,
  Filter,
  GitPullRequest,
  GitMerge,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface PullRequestWithRepo extends PullRequest {
  repositoryInfo: {
    owner: string;
    name: string;
    fullName: string;
  };
}

export default function PullRequestsPage() {
  const params = useParams();
  const userId = params.userId as string;

  const [pullRequests, setPullRequests] = useState<PullRequestWithRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"open" | "closed" | "merged">(
    "open"
  );
  const [refreshing, setRefreshing] = useState(false);

  const githubClient = new GitHubApiClient();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the new efficient endpoint to get all user pull requests
      const [openResponse, closedResponse] = await Promise.all([
        githubClient.pullRequests.getUserPullRequests(
          PullRequestState.OPEN,
          50
        ),
        githubClient.pullRequests.getUserPullRequests(
          PullRequestState.CLOSED,
          25
        ),
      ]);

      const allPullRequests: PullRequestWithRepo[] = [];

      // Process open PRs
      if (openResponse.data) {
        const openPRsWithRepo = openResponse.data.map((pr) => ({
          ...pr,
          repositoryInfo: {
            owner: pr.base?.repo?.full_name?.split("/")[0] || "unknown",
            name: pr.base?.repo?.name || "unknown",
            fullName: pr.base?.repo?.full_name || "unknown/unknown",
          },
        }));
        allPullRequests.push(...openPRsWithRepo);
      }

      // Process closed PRs
      if (closedResponse.data) {
        const closedPRsWithRepo = closedResponse.data.map((pr) => ({
          ...pr,
          repositoryInfo: {
            owner: pr.base?.repo?.full_name?.split("/")[0] || "unknown",
            name: pr.base?.repo?.name || "unknown",
            fullName: pr.base?.repo?.full_name || "unknown/unknown",
          },
        }));
        allPullRequests.push(...closedPRsWithRepo);
      }

      setPullRequests(allPullRequests);

      if (openResponse.error && closedResponse.error) {
        throw new Error(
          openResponse.error.detail || "Failed to fetch pull requests"
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPullRequests = pullRequests
    .filter((pr) => {
      // Filter by state/tab
      switch (activeTab) {
        case "open":
          return pr.state === PullRequestState.OPEN && !pr.merged;
        case "closed":
          return pr.state === PullRequestState.CLOSED && !pr.merged;
        case "merged":
          return pr.merged;
        default:
          return true;
      }
    })
    .filter((pr) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          pr.title.toLowerCase().includes(searchLower) ||
          pr.body?.toLowerCase().includes(searchLower) ||
          pr.user.login.toLowerCase().includes(searchLower) ||
          pr.repositoryInfo.fullName.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .filter((pr) => {
      // Repository filter
      if (selectedRepo !== "all") {
        return pr.repositoryInfo.fullName === selectedRepo;
      }
      return true;
    });

  const openCount = pullRequests.filter(
    (pr) => pr.state === PullRequestState.OPEN && !pr.merged
  ).length;
  const closedCount = pullRequests.filter(
    (pr) => pr.state === PullRequestState.CLOSED && !pr.merged
  ).length;
  const mergedCount = pullRequests.filter((pr) => pr.merged).length;

  // Get unique repositories for filter dropdown
  const uniqueRepositories = Array.from(
    new Set(pullRequests.map((pr) => pr.repositoryInfo.fullName))
  ).sort();

  if (loading) {
    return (
      <div>
        <PageLoadingSpinner message="Loading pull requests..." />
        <LoadingGrid type="pullRequests" count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load pull requests"
        description={error}
        onRetry={() => fetchData()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Pull Requests</h1>
          <p className="text-muted-foreground">
            {pullRequests.length} pull requests across{" "}
            {uniqueRepositories.length} repositories
          </p>
        </div>

        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pull requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedRepo} onValueChange={setSelectedRepo}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All repositories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All repositories</SelectItem>
            {uniqueRepositories.map((repoName) => (
              <SelectItem key={repoName} value={repoName}>
                {repoName.split("/")[1]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as any)}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="open" className="flex items-center gap-2">
            <GitPullRequest className="h-4 w-4" />
            Open ({openCount})
          </TabsTrigger>
          <TabsTrigger value="closed" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Closed ({closedCount})
          </TabsTrigger>
          <TabsTrigger value="merged" className="flex items-center gap-2">
            <GitMerge className="h-4 w-4" />
            Merged ({mergedCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredPullRequests.length === 0 ? (
            <EmptyState
              title={`No ${activeTab} pull requests found`}
              description={
                searchTerm || selectedRepo !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : `You don't have any ${activeTab} pull requests.`
              }
              icon={
                <GitPullRequest className="h-8 w-8 text-muted-foreground" />
              }
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPullRequests.map((pr) => (
                <PullRequestCard
                  key={`${pr.repositoryInfo.fullName}-${pr.id}`}
                  pullRequest={pr}
                  userId={userId}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      {pullRequests.length > 0 && (
        <div className="flex flex-wrap gap-4 pt-4 border-t">
          <Badge variant="secondary" className="px-3 py-1">
            <GitPullRequest className="h-3 w-3 mr-1" />
            {openCount} Open
          </Badge>

          <Badge variant="secondary" className="px-3 py-1">
            <GitMerge className="h-3 w-3 mr-1" />
            {mergedCount} Merged
          </Badge>

          <Badge variant="secondary" className="px-3 py-1">
            <XCircle className="h-3 w-3 mr-1" />
            {closedCount} Closed
          </Badge>

          <Badge variant="secondary" className="px-3 py-1">
            <AlertCircle className="h-3 w-3 mr-1" />
            {pullRequests.filter((pr) => pr.mergeable === false).length}{" "}
            Conflicts
          </Badge>
        </div>
      )}
    </div>
  );
}
