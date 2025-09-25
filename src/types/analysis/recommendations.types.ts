
import { Priority } from './core.types';

export enum RecommendationType {
  DEPLOYMENT = "deployment",
  CI_CD = "ci_cd",
  INFRASTRUCTURE = "infrastructure",
  SECURITY = "security",
  MONITORING = "monitoring",
  AUTOMATION = "automation",
  AZURE_SERVICE = "azure_service"
}

export interface RecommendationAction {
  description: string;
  file_path: string;
  action_type: string;
  bash_commands: string[];
  estimated_time_minutes?: number;
}

export interface Recommendation {
  id: string;
  type: RecommendationType;
  priority: Priority;
  
  // Content
  title: string;
  description: string;
  reasoning: string;
  
  // Azure DevOps specific
  azure_service?: string;
  bash_script_required: boolean;
  deployment_impact?: string;
  
  // Actions
  actions: RecommendationAction[];
  
  // Metadata
  estimated_time_minutes?: number;
  difficulty_level: string;
  
  // Benefits
  benefits: string[];
  potential_issues: string[];
}