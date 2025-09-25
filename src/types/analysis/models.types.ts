// types/analysis/models.types.ts
// Main model types composing from base interfaces

import { 
    AnalysisStatus, 
    AnalysisType,
    ExecutionStatus,
    Identifiable, 
    Timestamped, 
    UserOwned,
    RepositoryReference
  } from './core.types';
  import { CodebaseInfo } from './codebase.types';
  import { Recommendation } from './recommendations.types';
import { InfrastructureInfo } from './infrastructure.types';
  
  // Analysis Result - Main analysis entity
  export interface AnalysisResult extends 
    Identifiable, 
    UserOwned, 
    RepositoryReference, 
    Timestamped {
    status: AnalysisStatus;
    
    // Analysis results
    codebase?: CodebaseInfo;
    infrastructure?: InfrastructureInfo;
    recommendations: Recommendation[];
    
    // Metadata
    analysis_duration_seconds?: number;
    error_message?: string;
    
    // Summary metrics
    total_recommendations: number;
    critical_issues: number;
  }