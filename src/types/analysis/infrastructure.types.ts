export enum InfrastructureType {
    DOCKERFILE = "dockerfile",
    DOCKER_COMPOSE = "docker_compose",
    KUBERNETES = "kubernetes",
    CI_CD = "ci_cd",
    CONFIGURATION = "configuration",
    TERRAFORM = "terraform",
    HELM = "helm",
    BICEP = "bicep",
    ARM_TEMPLATE = "arm_template",
  }
  
  export interface InfrastructureFile {
    name: string;
    type: InfrastructureType;
    path: string;
    exists: boolean;
    content_summary?: string;
    devops_issues: string[];
    azure_compatibility?: string;
    recommendations: string[];
    size_bytes?: number;
  }
  
  export interface InfrastructureInfo {
    files: InfrastructureFile[];
  
    has_docker: boolean;
    has_ci_cd: boolean;
    has_kubernetes: boolean;
    has_terraform: boolean;
    has_bicep: boolean;
    has_arm_templates: boolean;
  
    deployment_readiness_score: number;
    deployment_complexity: string;
    current_deployment_method?: string;
  
    deployment_failures_analysis: string[];
    missing_devops_components: string[];
    azure_best_practices_violations: string[];
    recommended_deployment_strategy?: string;
  }