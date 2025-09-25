import { ExecutionClient } from "@/lib/api/analysis/clients/execution-client";
import { ApiResponse } from "@/types/auth/auth.types";
import {
  ExecutionRequest,
  ExecutionResponse,
  ExecutionSummary,
  AnalysisResult,
} from "@/types/analysis";

export class ExecutionService {
  constructor(private client: ExecutionClient) {}

  async executeRecommendations(
    analysisId: string,
    recommendationIds: string[],
    analysisResult: AnalysisResult,
    token: string,
    options: {
      createPr?: boolean;
      prTitle?: string;
      targetBranch?: string;
      branchName?: string;
      autoMerge?: boolean;
    } = {}
  ): Promise<ApiResponse<ExecutionResponse>> {
    const validation = this.validateExecutionRequest(
      analysisId,
      recommendationIds,
      analysisResult
    );
    if (!validation.valid) {
      return {
        error: { detail: validation.error! },
        status: 400,
      };
    }

    const request: ExecutionRequest = {
      analysis_id: analysisId,
      recommendation_ids: recommendationIds,
      repository_url: analysisResult.repository_url,
      execution_options: {
        create_pr: options.createPr ?? true,
        pr_title:
          options.prTitle || this.generatePrTitle(recommendationIds.length),
        target_branch: options.targetBranch || "main",
        branch_name: options.branchName || this.generateBranchName(),
        auto_merge: options.autoMerge ?? false,
      },
    };

    return this.client.executeRecommendations(request, token);
  }

  async getExecutionStatus(
    executionId: string,
    token: string
  ): Promise<ApiResponse<ExecutionSummary>> {
    if (!executionId?.trim()) {
      return {
        error: { detail: "Execution ID is required" },
        status: 400,
      };
    }

    return this.client.getExecutionStatus(executionId, token);
  }

  async getExecutionHistory(
    token: string
  ): Promise<ApiResponse<ExecutionSummary[]>> {
    const response = await this.client.getExecutionHistory(token);

    if (response.data) {
      response.data.sort(
        (a, b) =>
          new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
      );
    }

    return response;
  }

  private validateExecutionRequest(
    analysisId: string,
    recommendationIds: string[],
    analysisResult: AnalysisResult
  ): { valid: boolean; error?: string } {
    if (!analysisId?.trim()) {
      return { valid: false, error: "Analysis ID is required" };
    }

    if (!recommendationIds?.length) {
      return {
        valid: false,
        error: "At least one recommendation must be selected",
      };
    }

    const availableIds = analysisResult.recommendations?.map((r) => r.id) || [];
    const invalidIds = recommendationIds.filter(
      (id) => !availableIds.includes(id)
    );

    if (invalidIds.length > 0) {
      return {
        valid: false,
        error: `Invalid recommendation IDs: ${invalidIds.join(", ")}`,
      };
    }

    return { valid: true };
  }

  private generatePrTitle(count: number): string {
    return count === 1
      ? "Apply DevOps recommendation"
      : `Apply ${count} DevOps recommendations`;
  }

  private generateBranchName(): string {
    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:-]/g, "");
    return `devops-recommendations-${timestamp}`;
  }
}
