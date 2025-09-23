import {
  AutoMergeRequest,
  AutoMergeResponse,
  MergeMethod,
} from "@/types/github/automerge/automerge";
import { ApiResponse } from "@/types/auth/auth.types";
import { BaseApiClient } from "@/lib/api/base-client";
import { TokenManager } from "@/lib/api/token/token-manager";

export class GitHubAutoMergeService extends BaseApiClient {
  private tokenManager: TokenManager;

  constructor() {
    super();
    this.tokenManager = TokenManager.getInstance();
  }

  async autoMergePullRequest(
    pullNumber: number,
    autoMergeRequest: AutoMergeRequest
  ): Promise<ApiResponse<AutoMergeResponse>> {
    const token = this.tokenManager.getToken();
    const authError = this.requireAuth(token);
    if (authError) return authError;

    return this.request<AutoMergeResponse>(
      `/ai-analysis/pull-requests/${pullNumber}/auto-merge`,
      {
        method: "POST",
        body: JSON.stringify(autoMergeRequest),
      },
      token!
    );
  }

  async mergePullRequestWithSquash(
    pullNumber: number,
    repositoryUrl: string,
    commitMessage?: string
  ): Promise<ApiResponse<AutoMergeResponse>> {
    return this.autoMergePullRequest(pullNumber, {
      repository_url: repositoryUrl,
      merge_method: MergeMethod.SQUASH,
      commit_message: commitMessage,
    });
  }

  async mergePullRequestWithMerge(
    pullNumber: number,
    repositoryUrl: string,
    commitMessage?: string
  ): Promise<ApiResponse<AutoMergeResponse>> {
    return this.autoMergePullRequest(pullNumber, {
      repository_url: repositoryUrl,
      merge_method: MergeMethod.MERGE,
      commit_message: commitMessage,
    });
  }

  async mergePullRequestWithRebase(
    pullNumber: number,
    repositoryUrl: string,
    commitMessage?: string
  ): Promise<ApiResponse<AutoMergeResponse>> {
    return this.autoMergePullRequest(pullNumber, {
      repository_url: repositoryUrl,
      merge_method: MergeMethod.REBASE,
      commit_message: commitMessage,
    });
  }
}
