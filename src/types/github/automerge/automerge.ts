export enum MergeMethod {
  MERGE = "merge",
  SQUASH = "squash",
  REBASE = "rebase",
}

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

export interface MergeRequestOptions {
  commit_title?: string;
  commit_message?: string;
  sha?: string;
  merge_method?: MergeMethod;
}

export interface MergeResult {
  sha: string;
  merged: boolean;
  message: string;
}
