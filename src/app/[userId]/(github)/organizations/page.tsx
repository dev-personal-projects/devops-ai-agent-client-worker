"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { GitHubApiClient } from "@/lib/api/github/github-api-client";
import { Organization } from "@/types/github/organizations/organizations";
import { OrganizationCard } from "@/components/github/organization-card";
import {
  LoadingGrid,
  EmptyState,
  ErrorState,
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
import {
  RefreshCw,
  Search,
  Filter,
  Building2,
  GitBranch,
  Users,
} from "lucide-react";

export default function OrganizationsPage() {
  const params = useParams();
  const userId = params.userId as string;

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "repos" | "created">("name");
  const [refreshing, setRefreshing] = useState(false);

  const githubClient = new GitHubApiClient();

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await githubClient.organizations.getOrganizations();

      if (response.error) {
        throw new Error(
          response.error.detail || "Failed to fetch organizations"
        );
      }

      setOrganizations(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrganizations();
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const filteredAndSortedOrgs = organizations
    .filter((org) => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          org.name?.toLowerCase().includes(searchLower) ||
          org.login.toLowerCase().includes(searchLower) ||
          org.description?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "repos":
          return b.total_repos - a.total_repos;
        case "created":
          if (!a.created_at || !b.created_at) return 0;
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "name":
        default:
          return (a.name || a.login).localeCompare(b.name || b.login);
      }
    });

  if (loading) {
    return <LoadingGrid type="organizations" count={6} />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load organizations"
        description={error}
        onRetry={() => fetchOrganizations()}
      />
    );
  }

  if (organizations.length === 0) {
    return (
      <EmptyState
        title="No organizations found"
        description="You're not a member of any organizations yet. Join or create an organization on GitHub to see them here."
        icon={<Building2 className="h-8 w-8 text-muted-foreground" />}
        action={{
          label: "Refresh",
          onClick: handleRefresh,
        }}
      />
    );
  }

  const totalRepos = organizations.reduce(
    (sum, org) => sum + org.total_repos,
    0
  );
  const totalPublicRepos = organizations.reduce(
    (sum, org) => sum + org.public_repos,
    0
  );
  const totalPrivateRepos = organizations.reduce(
    (sum, org) => sum + org.private_repos,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Organizations</h1>
          <p className="text-muted-foreground">
            {organizations.length} organization
            {organizations.length !== 1 ? "s" : ""}• {totalRepos} total
            repositories
          </p>
        </div>

        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as any)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="repos">Repository count</SelectItem>
            <SelectItem value="created">Recently created</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4">
        <Badge variant="secondary" className="px-3 py-1">
          <Building2 className="h-3 w-3 mr-1" />
          {organizations.length} Organizations
        </Badge>

        <Badge variant="secondary" className="px-3 py-1">
          <GitBranch className="h-3 w-3 mr-1" />
          {totalRepos} Total Repos
        </Badge>

        {totalPublicRepos > 0 && (
          <Badge variant="secondary" className="px-3 py-1">
            {totalPublicRepos} Public
          </Badge>
        )}

        {totalPrivateRepos > 0 && (
          <Badge variant="secondary" className="px-3 py-1">
            {totalPrivateRepos} Private
          </Badge>
        )}
      </div>

      {/* Results */}
      {filteredAndSortedOrgs.length === 0 ? (
        <EmptyState
          title="No organizations match your search"
          description="Try adjusting your search criteria to find what you're looking for."
          icon={<Filter className="h-8 w-8 text-muted-foreground" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedOrgs.map((org) => (
            <OrganizationCard key={org.id} organization={org} />
          ))}
        </div>
      )}
    </div>
  );
}
