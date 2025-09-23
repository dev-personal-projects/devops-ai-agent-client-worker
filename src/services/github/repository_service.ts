import {
  RepositoryCollection,
  Repository,
} from "@/types/github/repositories/repositories";
import { ApiResponse } from "@/types/auth/auth.types";
import { TokenManager } from "@/lib/api/token/token-manager";
import { BaseApiClient } from "@/lib/api/base-client";

export class GitHubRepositoryService extends BaseApiClient {
  private tokenManager: TokenManager;

  constructor() {
    super();
    this.tokenManager = TokenManager.getInstance();
  }

  async getRepositories(
    forceRefresh: boolean = false
  ): Promise<ApiResponse<RepositoryCollection>> {
    const token = this.tokenManager.getToken();
    const authError = this.requireAuth(token);
    if (authError) return authError;

    const params = new URLSearchParams();
    if (forceRefresh) {
      params.append("force_refresh", "true");
    }

    const endpoint = `/github/repositories${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    return this.request<RepositoryCollection>(
      endpoint,
      { method: "GET" },
      token!
    );
  }

  async getRepository(repoName: string): Promise<ApiResponse<Repository>> {
    const token = this.tokenManager.getToken();
    const authError = this.requireAuth(token);
    if (authError) return authError;

    return this.request<Repository>(
      `/github/repositories/${encodeURIComponent(repoName)}`,
      { method: "GET" },
      token!
    );
  }

  async getPublicRepositories(): Promise<ApiResponse<Repository[]>> {
    const response = await this.getRepositories();
    if (response.error || !response.data)
      return {
        data: [],
        status: response.status,
        error: response.error,
      };

    return {
      data: response.data.repositories.filter(
        (repo) => repo.visibility === "public"
      ),
      status: response.status,
    };
  }

  async getPrivateRepositories(): Promise<ApiResponse<Repository[]>> {
    const response = await this.getRepositories();
    if (response.error || !response.data)
      return {
        data: [],
        status: response.status,
        error: response.error,
      };

    return {
      data: response.data.repositories.filter(
        (repo) => repo.visibility === "private"
      ),
      status: response.status,
    };
  }
}
