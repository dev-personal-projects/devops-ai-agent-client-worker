'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { GitHubApiClient } from '@/lib/api/github/github-api-client';
import { RepositoryCollection } from '@/types/github/repositories/repositories';
import { RepositoryCard } from '@/components/github/repository-card';
import { LoadingGrid, EmptyState, ErrorState } from '@/components/github/loading-states';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  RefreshCw, 
  Search, 
  Filter, 
  Github,
  Star,
  GitFork,
  Lock,
  Globe
} from 'lucide-react';

export default function RepositoriesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = params.userId as string;

  const [repositories, setRepositories] = useState<RepositoryCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'stars' | 'forks' | 'name'>('updated');
  const [filterBy, setFilterBy] = useState<'all' | 'public' | 'private' | 'forked' | 'archived'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const githubClient = new GitHubApiClient();

  const fetchRepositories = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await githubClient.repositories.getRepositories(forceRefresh);
      
      if (response.error) {
        throw new Error(response.error.detail || 'Failed to fetch repositories');
      }
      
      setRepositories(response.data!);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRepositories(true);
  };

  useEffect(() => {
    fetchRepositories();
  }, []);

  const filteredAndSortedRepos = repositories?.repositories
    .filter(repo => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!repo.name.toLowerCase().includes(searchLower) &&
            !repo.description?.toLowerCase().includes(searchLower) &&
            !repo.topics.some(topic => topic.toLowerCase().includes(searchLower))) {
          return false;
        }
      }

      // Type filter
      switch (filterBy) {
        case 'public':
          return repo.visibility === 'public';
        case 'private':
          return repo.visibility === 'private';
        case 'forked':
          return repo.is_fork;
        case 'archived':
          return repo.is_archived;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'stars':
          return b.stats.stars - a.stats.stars;
        case 'forks':
          return b.stats.forks - a.stats.forks;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'updated':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    }) || [];

  if (loading) {
    return <LoadingGrid type="repositories" count={6} />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load repositories"
        description={error}
        onRetry={() => fetchRepositories()}
      />
    );
  }

  if (!repositories || repositories.repositories.length === 0) {
    return (
      <EmptyState
        title="No repositories found"
        description="You don't have any repositories yet. Create your first repository on GitHub to get started."
        icon={<Github className="h-8 w-8 text-muted-foreground" />}
        action={{
          label: "Refresh",
          onClick: handleRefresh
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Repositories</h1>
          <p className="text-muted-foreground">
            {repositories.total_count} repositories
            {repositories.has_private_access && (
              <span className="ml-2">
                • Private access enabled
              </span>
            )}
          </p>
        </div>
        
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Recently updated</SelectItem>
            <SelectItem value="stars">Most stars</SelectItem>
            <SelectItem value="forks">Most forks</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterBy} onValueChange={(value) => setFilterBy(value as any)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="forked">Forked</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4">
        <Badge variant="secondary" className="px-3 py-1">
          <Globe className="h-3 w-3 mr-1" />
          {repositories.repositories.filter(r => r.visibility === 'public').length} Public
        </Badge>
        
        {repositories.has_private_access && (
          <Badge variant="secondary" className="px-3 py-1">
            <Lock className="h-3 w-3 mr-1" />
            {repositories.repositories.filter(r => r.visibility === 'private').length} Private
          </Badge>
        )}
        
        <Badge variant="secondary" className="px-3 py-1">
          <GitFork className="h-3 w-3 mr-1" />
          {repositories.repositories.filter(r => r.is_fork).length} Forked
        </Badge>
        
        <Badge variant="secondary" className="px-3 py-1">
          <Star className="h-3 w-3 mr-1" />
          {repositories.repositories.reduce((total, repo) => total + repo.stats.stars, 0)} Total Stars
        </Badge>
      </div>

      {/* Results */}
      {filteredAndSortedRepos.length === 0 ? (
        <EmptyState
          title="No repositories match your filters"
          description="Try adjusting your search or filter criteria to find what you're looking for."
          icon={<Filter className="h-8 w-8 text-muted-foreground" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedRepos.map((repo) => (
            <RepositoryCard 
              key={repo.id} 
              repository={repo} 
              userId={userId}
            />
          ))}
        </div>
      )}
    </div>
  );
}