'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { GitHubApiClient } from '@/lib/api/github/github-api-client';
import { PullRequest, PullRequestState } from '@/types/github/pull-request/pullrequest';
import { MergeMethod } from '@/types/github/automerge/automerge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageLoadingSpinner, ErrorState } from '@/components/github/loading-states';
import { 
  ArrowLeft,
  GitPullRequest, 
  GitMerge, 
  MessageSquare, 
  GitCommit,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Calendar,
  Edit,
  GitBranch,
  Building2
} from 'lucide-react';

export default function PullRequestPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = params.userId as string;
  const pullNumber = parseInt(params.number as string);
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');

  const [pullRequest, setPullRequest] = useState<PullRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [merging, setMerging] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [mergeSuccess, setMergeSuccess] = useState<string | null>(null);

  const githubClient = new GitHubApiClient();

  const fetchPullRequest = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!owner || !repo) {
        throw new Error('Repository owner and name are required. Please navigate from the pull requests list.');
      }

      const response = await githubClient.pullRequests.getPullRequest(owner, repo, pullNumber);

      if (response.error) {
        throw new Error(response.error.detail || 'Failed to fetch pull request');
      }

      if (!response.data) {
        throw new Error('Pull request not found');
      }

      setPullRequest(response.data);
      setCommitMessage(`Auto-merge PR #${response.data.number}: ${response.data.title}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoMerge = async (method: MergeMethod) => {
    if (!pullRequest || !owner || !repo) return;
    
    try {
      setMerging(true);
      setError(null);
      setMergeSuccess(null);
      
      // Use the correct auto-merge endpoint from your backend
      const response = await githubClient.autoMerge.autoMergePullRequest(pullNumber, {
        repository_url: `https://github.com/${owner}/${repo}`,
        merge_method: method,
        commit_message: commitMessage || undefined
      });
      
      if (response.error) {
        throw new Error(response.error.detail || 'Failed to merge pull request');
      }
      
      if (response.data?.merged) {
        setMergeSuccess(`Pull request successfully merged with ${method} method!`);
        // Refresh pull request data
        setTimeout(() => {
          fetchPullRequest();
        }, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to merge pull request');
    } finally {
      setMerging(false);
    }
  };

  useEffect(() => {
    if (!pullNumber || isNaN(pullNumber)) {
      setError('Invalid pull request number');
      return;
    }

    fetchPullRequest();
  }, [pullNumber, owner, repo]);

  if (loading) {
    return <PageLoadingSpinner message="Loading pull request..." />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Pull Requests
        </Button>
        <ErrorState
          title="Failed to load pull request"
          description={error}
          onRetry={() => fetchPullRequest()}
        />
      </div>
    );
  }

  if (!pullRequest) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Pull Requests
        </Button>
        <ErrorState
          title="Pull request not found"
          description="The pull request you're looking for doesn't exist or you don't have access to it."
        />
      </div>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStateIcon = () => {
    if (pullRequest.merged) {
      return <GitMerge className="h-5 w-5 text-purple-600" />;
    }
    
    switch (pullRequest.state) {
      case PullRequestState.OPEN:
        return <GitPullRequest className="h-5 w-5 text-green-600" />;
      case PullRequestState.CLOSED:
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <GitPullRequest className="h-5 w-5" />;
    }
  };

  const canMerge = pullRequest.state === PullRequestState.OPEN && 
                   pullRequest.mergeable === true && 
                   !pullRequest.draft;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Pull Requests
      </Button>

      {/* Success Alert */}
      {mergeSuccess && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            {mergeSuccess}
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-medium">
              {owner}/{repo}
            </span>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            {getStateIcon()}
            <h1 className="text-3xl font-bold">{pullRequest.title}</h1>
          </div>
          
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>#{pullRequest.number}</span>
            <span>•</span>
            <span>{pullRequest.merged ? 'Merged' : pullRequest.state}</span>
            <span>•</span>
            <span>opened {formatDate(pullRequest.created_at)}</span>
            <span>by {pullRequest.user.login}</span>
          </div>
        </div>

        <Button variant="outline" asChild>
          <a href={pullRequest.html_url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            View on GitHub
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              {pullRequest.body ? (
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{pullRequest.body}</p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">No description provided.</p>
              )}
            </CardContent>
          </Card>

          {/* Merge Section */}
          {canMerge && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GitMerge className="h-5 w-5" />
                  Merge Pull Request
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter commit message (optional)"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  rows={3}
                />
                
                <div className="flex flex-wrap gap-2">
                  <Button 
                    onClick={() => handleAutoMerge(MergeMethod.SQUASH)} 
                    disabled={merging}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {merging ? 'Merging...' : 'Squash and Merge'}
                  </Button>
                  
                  <Button 
                    onClick={() => handleAutoMerge(MergeMethod.MERGE)} 
                    disabled={merging}
                    variant="outline"
                  >
                    {merging ? 'Merging...' : 'Create Merge Commit'}
                  </Button>
                  
                  <Button 
                    onClick={() => handleAutoMerge(MergeMethod.REBASE)} 
                    disabled={merging}
                    variant="outline"
                  >
                    {merging ? 'Merging...' : 'Rebase and Merge'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Author */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Author</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={pullRequest.user.avatar_url} alt={pullRequest.user.login} />
                  <AvatarFallback>
                    {pullRequest.user.login[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{pullRequest.user.login}</p>
                  <p className="text-sm text-muted-foreground">
                    <a href={pullRequest.user.html_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      View profile
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={pullRequest.merged ? "default" : pullRequest.state === PullRequestState.OPEN ? "secondary" : "outline"}>
                  {pullRequest.merged ? 'Merged' : pullRequest.state}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Mergeable</span>
                {pullRequest.mergeable === true ? (
                  <Badge variant="default" className="bg-green-500/10 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ready
                  </Badge>
                ) : pullRequest.mergeable === false ? (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Conflicts
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Checking
                  </Badge>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span>{pullRequest.comments} comments</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <GitCommit className="h-4 w-4 text-muted-foreground" />
                  <span>{pullRequest.commits} commits</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-600">+{pullRequest.additions}</span>
                  <span className="text-red-600">-{pullRequest.deletions}</span>
                  <span className="text-muted-foreground">changes</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-xs">{pullRequest.head.ref}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-mono text-xs">{pullRequest.base.ref}</span>
                </div>
              </div>

              {pullRequest.labels.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Labels</span>
                    <div className="flex flex-wrap gap-1">
                      {pullRequest.labels.map((label) => (
                        <Badge 
                          key={label.id} 
                          variant="secondary" 
                          className="text-xs"
                          style={{ backgroundColor: `#${label.color}20`, color: `#${label.color}` }}
                        >
                          {label.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}