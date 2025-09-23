export enum PullRequestState {
  OPEN = "open",
  CLOSED = "closed",
  MERGED = "merged",
}

export enum MergeableState {
  MERGEABLE = "mergeable",
  CONFLICTING = "conflicting",
  UNKNOWN = "unknown",
}

export interface PullRequestUser {
  id: number;
  login: string;
  avatar_url?: string;
  html_url: string;
}

export interface PullRequestBranch {
  label: string;
  ref: string;
  sha: string;
  repo: {
    id: number;
    name: string;
    full_name: string;
    html_url: string;
  };
}

export interface PullRequestLabel {
  id: number;
  name: string;
  color: string;
  description?: string;
}

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: PullRequestState;
  locked: boolean;
  user: PullRequestUser;
  assignees: PullRequestUser[];
  reviewers: PullRequestUser[];
  labels: PullRequestLabel[];
  milestone?: {
    id: number;
    title: string;
    description?: string;
  };
  head: PullRequestBranch;
  base: PullRequestBranch;
  html_url: string;
  diff_url: string;
  patch_url: string;
  mergeable?: boolean;
  mergeable_state: MergeableState;
  merged: boolean;
  merged_at?: string;
  merged_by?: PullRequestUser;
  comments: number;
  review_comments: number;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  draft: boolean;
}

export interface PullRequestCollection {
  pull_requests: PullRequest[];
  total_count: number;
}
