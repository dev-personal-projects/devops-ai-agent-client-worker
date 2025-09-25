import { BaseApiClient } from "../../base-client";
import { ApiResponse } from "@/types/auth/auth.types";
import {
  AnalysisRequest,
  AnalysisResponse,
  AnalysisResult,
} from "@/types/analysis";

export class RepositoryAnalysisClient extends BaseApiClient {
  private readonly basePath = "/analysis/repositories";

  async analyzeRepository(
    request: AnalysisRequest,
    token: string
  ): Promise<ApiResponse<AnalysisResponse>> {
    return this.request<AnalysisResponse>(
      this.basePath,
      {
        method: "POST",
        body: JSON.stringify(request),
        headers: { "Content-Type": "application/json" },
      },
      token
    );
  }

  async getAnalysisHistory(
    token: string
  ): Promise<ApiResponse<AnalysisResult[]>> {
    return this.request<AnalysisResult[]>(
      `${this.basePath}/history`,
      { method: "GET" },
      token
    );
  }

  async getAnalysisById(
    analysisId: string,
    token: string
  ): Promise<ApiResponse<AnalysisResult>> {
    return this.request<AnalysisResult>(
      `${this.basePath}/${analysisId}`,
      { method: "GET" },
      token
    );
  }
}
