import { BaseApiClient } from "@/lib/api/base-client";
import { TokenManager } from "@/lib/api/token/token-manager";
import { 
  PullRequest, 
  PullRequestState 
} from "@/types/github/pull-request/pullrequest";
import { ApiResponse } from "@/types/auth/auth.types";

export class GitHubPullRequestService extends BaseApiClient {
  private tokenManager: TokenManager;

  constructor() {
    super();
    this.tokenManager = TokenManager.getInstance();
  }

  async getUserPullRequests(
    state: PullRequestState = PullRequestState.OPEN,
    perPage: number = 50
  ): Promise<ApiResponse<PullRequest[]>> {
    const token = this.tokenManager.getToken();
    const authError = this.requireAuth(token);
    if (authError) return authError;

    const params = new URLSearchParams({
      state,
      per_page: perPage.toString()
    });

    return this.request<PullRequest[]>(
      `/github/pulls?${params.toString()}`,
      { method: 'GET' },
      token!
    );
  }

  async getPullRequests(
    owner: string,
    repo: string,
    state: PullRequestState = PullRequestState.OPEN,
    perPage: number = 50
  ): Promise<ApiResponse<PullRequest[]>> {
    const token = this.tokenManager.getToken();
    const authError = this.requireAuth(token);
    if (authError) return authError;

    const params = new URLSearchParams({
      state,
      per_page: perPage.toString()
    });

    return this.request<PullRequest[]>(
      `/github/repositories/${owner}/${repo}/pulls?${params.toString()}`,
      { method: 'GET' },
      token!
    );
  }

  async getPullRequest(
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<ApiResponse<PullRequest>> {
    const token = this.tokenManager.getToken();
    const authError = this.requireAuth(token);
    if (authError) return authError;

    return this.request<PullRequest>(
      `/github/repositories/${owner}/${repo}/pulls/${pullNumber}`,
      { method: 'GET' },
      token!
    );
  }

  // Convenience methods
  async getOpenPullRequests(
    owner: string,
    repo: string
  ): Promise<ApiResponse<PullRequest[]>> {
    return this.getPullRequests(owner, repo, PullRequestState.OPEN);
  }

  async getMergeablePullRequests(
    owner: string,
    repo: string
  ): Promise<ApiResponse<PullRequest[]>> {
    const response = await this.getOpenPullRequests(owner, repo);
    if (response.error || !response.data) return response;

    return {
      data: response.data.filter(pr => pr.mergeable === true && !pr.draft),
      status: response.status
    };
  }

  async getDraftPullRequests(
    owner: string,
    repo: string
  ): Promise<ApiResponse<PullRequest[]>> {
    const response = await this.getOpenPullRequests(owner, repo);
    if (response.error || !response.data) return response;

    return {
      data: response.data.filter(pr => pr.draft),
      status: response.status
    };
  }

  // Get user's open PRs across all repositories
  async getAllOpenPullRequests(): Promise<ApiResponse<PullRequest[]>> {
    return this.getUserPullRequests(PullRequestState.OPEN);
  }

  // Get user's closed PRs across all repositories  
  async getAllClosedPullRequests(): Promise<ApiResponse<PullRequest[]>> {
    return this.getUserPullRequests(PullRequestState.CLOSED);
  }

  // Fetch PRs from multiple repositories (for backwards compatibility)
  async getPullRequestsFromRepositories(
    repositories: Array<{owner: string, name: string}>,
    state: PullRequestState = PullRequestState.OPEN
  ): Promise<ApiResponse<Record<string, PullRequest[]>>> {
    const token = this.tokenManager.getToken();
    const authError = this.requireAuth(token);
    if (authError) return authError;

    try {
      const promises = repositories.map(async (repo) => {
        try {
          const response = await this.getPullRequests(repo.owner, repo.name, state, 20);
          return {
            repoKey: `${repo.owner}/${repo.name}`,
            prs: response.data || []
          };
        } catch (err) {
          console.warn(`Failed to fetch PRs for ${repo.owner}/${repo.name}:`, err);
          return { repoKey: `${repo.owner}/${repo.name}`, prs: [] };
        }
      });

      const results = await Promise.all(promises);
      const prsByRepo: Record<string, PullRequest[]> = {};
      
      results.forEach(({ repoKey, prs }) => {
        prsByRepo[repoKey] = prs;
      });

      return {
        data: prsByRepo,
        status: 200
      };
    } catch (error) {
      return {
        error: { detail: 'Failed to fetch pull requests from repositories' },
        status: 500
      };
    }
  }
}