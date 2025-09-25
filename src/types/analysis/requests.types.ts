

import { AnalysisType, ExecutionStatus} from './core.types';
import { AnalysisResult } from './models.types';
import { ExecutionResult } from './execution.types';
import { MergeMethod } from '../github/automerge/automerge';

// Analysis Request/Response
export interface AnalysisRequest {
  repository_url: string;
  analysis_types: AnalysisType[];
  force_refresh?: boolean;
  include_recommendations?: boolean;
}

export interface AnalysisResponse {
  analysis: AnalysisResult;
  message: string;
  cache_hit: boolean;
}

export interface AnalysisStatusResponse {
  operation_id: string;
  status: string;
  progress_percentage: number;
  current_stage: string;
  estimated_completion_minutes?: number;
  error_message?: string;
}

export interface AnalysisListResponse {
  analyses: AnalysisResult[];
  total_count: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

// Execution Request/Response
export interface ExecutionRequest {
  recommendation_ids: string[];
  create_pr?: boolean;
  pr_title?: string;
  target_branch?: string;
  branch_name?: string;
  auto_merge?: boolean;
}

export interface ExecutionResponse {
  execution_id: string;
  status: ExecutionStatus;
  branch_name?: string;
  message: string;
  progress_url: string;
}

// Auto-merge Request/Response
export interface AutoMergeRequest {
  repository_url: string;
  merge_method: MergeMethod;
  commit_message?: string;
}

export interface AutoMergeResponse {
  merged: boolean;
  message: string;
  commit_sha?: string;
}