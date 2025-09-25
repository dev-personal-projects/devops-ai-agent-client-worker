import { BaseApiClient } from "../../base-client";
import { ApiResponse } from "@/types/auth/auth.types";
import {
  ExecutionRequest,
  ExecutionResponse,
  ExecutionSummary,
} from "@/types/analysis";

export class ExecutionClient extends BaseApiClient {
  private readonly basePath = "/analysis/executions";

  async executeRecommendations(
    request: ExecutionRequest,
    token: string
  ): Promise<ApiResponse<ExecutionResponse>> {
    return this.request<ExecutionResponse>(
      this.basePath,
      {
        method: "POST",
        body: JSON.stringify(request),
        headers: { "Content-Type": "application/json" },
      },
      token
    );
  }

  async getExecutionStatus(
    executionId: string,
    token: string
  ): Promise<ApiResponse<ExecutionSummary>> {
    return this.request<ExecutionSummary>(
      `${this.basePath}/${executionId}`,
      { method: "GET" },
      token
    );
  }

  async getExecutionHistory(
    token: string
  ): Promise<ApiResponse<ExecutionSummary[]>> {
    return this.request<ExecutionSummary[]>(
      `${this.basePath}/history`,
      { method: "GET" },
      token
    );
  }
}
