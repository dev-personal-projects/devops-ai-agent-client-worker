import { RepositoryAnalysisClient } from "@/lib/api/analysis/clients/repository-analysis-client";
import { ApiResponse } from "@/types/auth/auth.types";
import {
  AnalysisRequest,
  AnalysisResponse,
  AnalysisResult,
  AnalysisType,
} from "@/types/analysis";
import { RepositoryUtils } from "@/types/analysis/utilities.types";

export class RepositoryAnalysisService {
  constructor(private client: RepositoryAnalysisClient) {}

  async analyzeRepository(
    repositoryUrl: string,
    token: string,
    options: {
      analysisTypes?: AnalysisType[];
      forceRefresh?: boolean;
      includeRecommendations?: boolean;
    } = {}
  ): Promise<ApiResponse<AnalysisResponse>> {
    const validation = this.validateRepositoryUrl(repositoryUrl);
    if (!validation.valid) {
      return {
        error: { detail: validation.error! },
        status: 400,
      };
    }

    const request: AnalysisRequest = {
      repository_url: RepositoryUtils.normalizeGitHubUrl(repositoryUrl),
      analysis_types: options.analysisTypes || this.getDefaultAnalysisTypes(),
      force_refresh: options.forceRefresh ?? false,
      include_recommendations: options.includeRecommendations ?? true,
    };

    return this.client.analyzeRepository(request, token);
  }

  async getAnalysisHistory(
    token: string
  ): Promise<ApiResponse<AnalysisResult[]>> {
    const response = await this.client.getAnalysisHistory(token);

    if (response.data) {
      response.data.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return response;
  }

  async getAnalysisById(
    analysisId: string,
    token: string
  ): Promise<ApiResponse<AnalysisResult>> {
    if (!analysisId?.trim()) {
      return {
        error: { detail: "Analysis ID is required" },
        status: 400,
      };
    }

    return this.client.getAnalysisById(analysisId, token);
  }

  private validateRepositoryUrl(url: string): {
    valid: boolean;
    error?: string;
  } {
    if (!url?.trim()) {
      return { valid: false, error: "Repository URL is required" };
    }

    if (!RepositoryUtils.isValidGitHubUrl(url)) {
      return { valid: false, error: "Invalid GitHub repository URL" };
    }

    return { valid: true };
  }

  private getDefaultAnalysisTypes(): AnalysisType[] {
    return [
      AnalysisType.CODEBASE_SCAN,
      AnalysisType.INFRASTRUCTURE_AUDIT,
      AnalysisType.RECOMMENDATION_GENERATION,
    ];
  }
}
