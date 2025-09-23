"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { GitHubApiClient } from "@/lib/api/github/github-api-client";
import {
  PullRequest,
  PullRequestState,
} from "@/types/github/pull-request/pullrequest";
import { Repository } from "@/types/github/repositories/repositories";
import { PullRequestCard } from "@/components/github/pull-request";
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

export default function PullRequestsPage() {
  const params = useParams();
  const userId = params.userId as string;

  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [pullRequests, setPullRequests] = useState<
    Record<string, PullRequest[]>
  >({});
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

      // First get repositories
      const reposResponse = await githubClient.repositories.getRepositories();

      if (reposResponse.error) {
        throw new Error(
          reposResponse.error.detail || "Failed to fetch repositories"
        );
      }

      const repos = reposResponse.data!.repositories;
      setRepositories(repos);

      // Fetch pull requests for each repository (limit to first 5 repos for performance)
      const reposToFetch = repos.slice(0, 5);
      const prPromises = reposToFetch.map(async (repo) => {
        try {
          const response = await githubClient.pullRequests.getPullRequests(
            repo.owner.login,
            repo.name,
            PullRequestState.OPEN,
            20
          );
          return {
            repoId: repo.id.toString(),
            prs: response.data || [],
          };
        } catch (err) {
          console.warn(`Failed to fetch PRs for ${repo.full_name}:`, err);
          return { repoId: repo.id.toString(), prs: [] };
        }
      });

      const results = await Promise.all(prPromises);
      const prsByRepo: Record<string, PullRequest[]> = {};

      results.forEach(({ repoId, prs }) => {
        prsByRepo[repoId] = prs;
      });

      setPullRequests(prsByRepo);
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

  // Flatten all pull requests
  const allPullRequests = Object.values(pullRequests).flat();

  const filteredPullRequests = allPullRequests
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
          pr.user.login.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .filter((pr) => {
      // Repository filter
      if (selectedRepo !== "all") {
        return pr.base.repo.id.toString() === selectedRepo;
      }
      return true;
    });

  const openCount = allPullRequests.filter(
    (pr) => pr.state === PullRequestState.OPEN && !pr.merged
  ).length;
  const closedCount = allPullRequests.filter(
    (pr) => pr.state === PullRequestState.CLOSED && !pr.merged
  ).length;
  const mergedCount = allPullRequests.filter((pr) => pr.merged).length;

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
            {allPullRequests.length} pull requests across{" "}
            {Object.keys(pullRequests).length} repositories
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
            {repositories.map((repo, index) => (
              <SelectItem key={`${repo.id}-${repo.full_name}-${index}`} value={repo.id.toString()}>
                {repo.name}
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
                  : `There are no ${activeTab} pull requests in your repositories.`
              }
              icon={
                <GitPullRequest className="h-8 w-8 text-muted-foreground" />
              }
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPullRequests.map((pr) => (
                <PullRequestCard key={pr.id} pullRequest={pr} userId={userId} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      {allPullRequests.length > 0 && (
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
            {allPullRequests.filter((pr) => pr.mergeable === false).length}{" "}
            Conflicts
          </Badge>
        </div>
      )}
    </div>
  );
}
