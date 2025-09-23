import { GitHubRepositoryService } from "@/services/github/repository_service";
import { GitHubOrganizationService } from "@/services/github/organisation_service";
import { GitHubPullRequestService } from "@/services/github/pull-request_service";
import { GitHubAutoMergeService } from "@/services/github/automerge_service";


export class GitHubApiClient {
  public readonly repositories: GitHubRepositoryService;
  public readonly organizations: GitHubOrganizationService;
  public readonly pullRequests: GitHubPullRequestService;
  public readonly autoMerge: GitHubAutoMergeService;

  constructor() {
    this.repositories = new GitHubRepositoryService();
    this.organizations = new GitHubOrganizationService();
    this.pullRequests = new GitHubPullRequestService();
    this.autoMerge = new GitHubAutoMergeService();
  }

}