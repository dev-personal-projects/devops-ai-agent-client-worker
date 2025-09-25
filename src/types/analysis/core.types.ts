export enum AnalysisStatus {
  PENDING = "pending",
  ANALYZING = "analyzing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum Priority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum AnalysisType {
  CODEBASE_SCAN = "CODEBASE_SCAN",
  INFRASTRUCTURE_AUDIT = "INFRASTRUCTURE_AUDIT",
  RECOMMENDATION_GENERATION = "RECOMMENDATION_GENERATION",
}

export enum ExecutionStatus {
  PENDING = "pending",
  EXECUTING = "executing",
  COMPLETED = "completed",
  FAILED = "failed",
  ROLLED_BACK = "rolled_back",
}

export interface Timestamped {
  created_at: string;
  updated_at: string;
}

export interface Identifiable {
  id: string;
}

export interface UserOwned {
  user_id: string;
}
export interface RepositoryReference {
  repository_name: string;
  repository_url: string;
}
