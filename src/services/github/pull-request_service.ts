
import { 
  PullRequest, 
  PullRequestState 
} from "@/types/github/pull-request/pullrequest";
import { ApiResponse } from "@/types/auth/auth.types";
import { BaseApiClient } from "@/lib/api/base-client";
import { TokenManager } from "@/lib/api/token/token-manager";
export class GitHubPullRequestService extends BaseApiClient {
  private tokenManager: TokenManager;

  constructor() {
    super();
    this.tokenManager = TokenManager.getInstance();
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
}