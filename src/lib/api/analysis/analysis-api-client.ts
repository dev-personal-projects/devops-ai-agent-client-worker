import { TokenManager } from "../token/token-manager";
import { ApiResponse } from "@/types/auth/auth.types";

import { RepositoryAnalysisClient } from "./clients/repository-analysis-client";
import { ExecutionClient } from "./clients/execution-client";
import { RepositoryAnalysisService } from "@/services/analysis/repository-analysis-service";
import { ExecutionService } from "@/services/analysis/execution-service";
import { GitHubAutoMergeService } from "@/services/github/automerge_service";

import {
  AnalysisResponse,
  AnalysisResult,
  ExecutionResponse,
  ExecutionSummary,
  AnalysisType,
} from "@/types/analysis";
import { MergeMethod } from "@/types/github/automerge/automerge";

export class AnalysisApiClient {
  private tokenManager: TokenManager;

  public readonly repositories: RepositoryAnalysisService;
  public readonly executions: ExecutionService;
  public readonly autoMerge: GitHubAutoMergeService;

  constructor() {
    this.tokenManager = TokenManager.getInstance();

    const repositoryClient = new RepositoryAnalysisClient();
    const executionClient = new ExecutionClient();
    this.repositories = new RepositoryAnalysisService(repositoryClient);
    this.executions = new ExecutionService(executionClient);
    this.autoMerge = new GitHubAutoMergeService();
  }

  async analyzeRepository(
    repositoryUrl: string,
    options: {
      analysisTypes?: AnalysisType[];
      forceRefresh?: boolean;
      includeRecommendations?: boolean;
    } = {}
  ): Promise<ApiResponse<AnalysisResponse>> {
    const token = this.getAuthToken();
    if (!token) return this.authError();

    return this.repositories.analyzeRepository(repositoryUrl, token, options);
  }

  async getAnalysisHistory(): Promise<ApiResponse<AnalysisResult[]>> {
    const token = this.getAuthToken();
    if (!token) return this.authError();

    return this.repositories.getAnalysisHistory(token);
  }

  async getAnalysisById(
    analysisId: string
  ): Promise<ApiResponse<AnalysisResult>> {
    const token = this.getAuthToken();
    if (!token) return this.authError();

    return this.repositories.getAnalysisById(analysisId, token);
  }

  async executeRecommendations(
    analysisId: string,
    recommendationIds: string[],
    options: {
      createPr?: boolean;
      prTitle?: string;
      targetBranch?: string;
      branchName?: string;
      autoMerge?: boolean;
    } = {}
  ): Promise<ApiResponse<ExecutionResponse>> {
    const token = this.getAuthToken();
    if (!token) return this.authError();

    const analysisResponse = await this.repositories.getAnalysisById(
      analysisId,
      token
    );
    if (analysisResponse.error) {
      return analysisResponse as any;
    }

    return this.executions.executeRecommendations(
      analysisId,
      recommendationIds,
      analysisResponse.data!,
      token,
      options
    );
  }

  async getExecutionStatus(
    executionId: string
  ): Promise<ApiResponse<ExecutionSummary>> {
    const token = this.getAuthToken();
    if (!token) return this.authError();

    return this.executions.getExecutionStatus(executionId, token);
  }

  async autoMergePullRequest(
    pullNumber: number,
    options: {
      repository_url: string;
      merge_method: MergeMethod;
      commit_message?: string;
    }
  ) {
    return this.autoMerge.autoMergePullRequest(pullNumber, options);
  }

  private getAuthToken(): string | null {
    return this.tokenManager.getToken();
  }

  private authError(): ApiResponse<never> {
    return {
      error: { detail: "Authentication required" },
      status: 401,
    };
  }

  isAuthenticated(): boolean {
    return !!this.tokenManager.getToken();
  }

  logout(): void {
    this.tokenManager.clearTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  }
}
