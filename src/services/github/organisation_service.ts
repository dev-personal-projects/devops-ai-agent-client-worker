import { Organization } from "@/types/github/organizations/organizations";
import { ApiResponse } from "@/types/auth/auth.types";
import { TokenManager } from "@/lib/api/token/token-manager";
import { BaseApiClient } from "@/lib/api/base-client";

export class GitHubOrganizationService extends BaseApiClient {
  private tokenManager: TokenManager;

  constructor() {
    super();
    this.tokenManager = TokenManager.getInstance();
  }

  async getOrganizations(): Promise<ApiResponse<Organization[]>> {
    const token = this.tokenManager.getToken();
    const authError = this.requireAuth(token);
    if (authError) return authError;

    return this.request<Organization[]>(
      "/github/organizations",
      { method: "GET" },
      token!
    );
  }

  async getOrganizationByLogin(
    login: string
  ): Promise<ApiResponse<Organization | null>> {
    const response = await this.getOrganizations();
    if (response.error || !response.data)
      return {
        data: null,
        status: response.status,
        error: response.error,
      } as ApiResponse<Organization | null>;

    const organization = response.data.find((org) => org.login === login);

    return {
      data: organization || null,
      status: response.status,
    };
  }

  async getOrganizationsWithRepos(): Promise<ApiResponse<Organization[]>> {
    const response = await this.getOrganizations();
    if (response.error || !response.data) return response;

    return {
      data: response.data.filter((org) => org.total_repos > 0),
      status: response.status,
    };
  }
}
