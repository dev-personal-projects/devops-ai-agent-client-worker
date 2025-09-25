export enum TechnologyType {
  LANGUAGE = "language",
  FRAMEWORK = "framework",
  DATABASE = "database",
  CLOUD_SERVICE = "cloud_service",
  BUILD_TOOL = "build_tool",
  TESTING = "testing",
  PACKAGE_MANAGER = "package_manager",
  CONFIGURATION = "configuration",
}

export interface TechnologyInfo {
  name: string;
  type: TechnologyType;
  version?: string;
  confidence: number;
  file_path?: string;
  description?: string;
  azure_compatibility?: string;
}

export interface CodebaseInfo {
  repository_name: string;
  repository_url: string;
  primary_language?: string;
  project_type?: string;
  deployment_target?: string;
  what_user_is_building?: string;
  technologies: TechnologyInfo[];
  total_files: number;
  lines_of_code?: number;

  // DevOps readiness
  devops_readiness_score?: number;
  current_deployment_issues: string[];
  recommended_azure_services: string[];

  // Project structure insights
  has_tests: boolean;
  has_documentation: boolean;
  has_ci_config: boolean;
  has_dockerfile: boolean;
  has_deployment_scripts: boolean;
}


