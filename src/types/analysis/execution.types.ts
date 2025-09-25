// types/analysis/execution.types.ts
// Execution types following Open/Closed Principle

import { ExecutionStatus, Timestamped, UserOwned } from './core.types';

export interface ExecutionResult {
  recommendation_id: string;
  status: ExecutionStatus;
  files_created: string[];
  files_modified: string[];
  error_message?: string;
  execution_time_seconds?: number;
}

export interface ExecutionSummary extends UserOwned {
  execution_id: string;
  analysis_id: string;
  repository_url: string;
  status: ExecutionStatus;
  
  selected_recommendations: string[];
  results: ExecutionResult[];
  
  branch_name?: string;
  pr_url?: string;
  
  started_at: string;
  completed_at?: string;
  total_execution_time_seconds?: number;
  
  successful_executions: number;
  failed_executions: number;
  total_files_created: number;
  total_files_modified: number;
}