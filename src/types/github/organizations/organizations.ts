export enum MembershipRole {
  MEMBER = "member",
  ADMIN = "admin",
  OWNER = "owner",
}

export enum MembershipState {
  ACTIVE = "active",
  PENDING = "pending",
}

export interface Organization {
  id: number;
  login: string;
  name?: string;
  description?: string;
  avatar_url?: string;
  html_url?: string;
  public_repos: number;
  private_repos: number;
  total_repos: number;
  location?: string;
  email?: string;
  blog?: string;
  company?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrganizationMembership {
  organization: Organization;
  role: MembershipRole;
  state: MembershipState;
}
