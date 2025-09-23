export enum RepositoryVisibility {
  PUBLIC = "public",
  PRIVATE = "private",
  INTERNAL = "internal",
}

export interface RepositoryOwner {
  id: number;
  login: string;
  type: "User" | "Organization";
  avatar_url?: string;
}

export interface RepositoryStats {
  stars: number;
  forks: number;
  watchers: number;
  size: number;
  open_issues: number;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  visibility: RepositoryVisibility;
  owner: RepositoryOwner;
  stats: RepositoryStats;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  default_branch: string;
  language?: string;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at?: string;
  is_fork: boolean;
  is_archived: boolean;
  is_disabled: boolean;
}

export interface BasicOrganization {
  id: number;
  login: string;
  name?: string;
  avatar_url?: string;
}

export interface RepositoryCollection {
  repositories: Repository[];
  total_count: number;
  has_private_access: boolean;
  organizations: BasicOrganization[];
}

export interface GitHubUser {
  id: number;
  login: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  html_url: string;
  type: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubApiResponse<T> {
  data: T;
  rate_limit_remaining?: number;
  rate_limit_reset?: string;
}
