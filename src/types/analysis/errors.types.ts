export enum ErrorSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
  }
  
  export enum ErrorCategory {
    REPOSITORY_ACCESS = "repository_access",
    API_RATE_LIMIT = "api_rate_limit",
    PARSING_ERROR = "parsing_error",
    AI_MODEL_ERROR = "ai_model_error",
    TIMEOUT = "timeout",
    VALIDATION_ERROR = "validation_error",
    CONFIGURATION_ERROR = "configuration_error",
    NETWORK_ERROR = "network_error",
    UNKNOWN = "unknown"
  }
  
  export interface AnalysisError {
    error_id: string;
    category: ErrorCategory;
    severity: ErrorSeverity;
    message: string;
    details?: string;
    error_code?: string;
    operation_id?: string;
    analysis_stage?: string;
    repository_url?: string;
    user_id?: string;
    occurred_at: string;
    stack_trace?: string;
    request_data?: Record<string, any>;
    response_data?: Record<string, any>;
    is_resolved: boolean;
    resolution_notes?: string;
    resolved_at?: string;
    
    // Computed properties (implement in class/utility)
    is_retryable?: boolean;
    requires_user_action?: boolean;
  }
  
  export interface ErrorSummary {
    operation_id: string;
    total_errors: number;
    critical_errors: number;
    high_severity_errors: number;
    retryable_errors: number;
    resolved_errors: number;
    error_categories: Record<string, number>;
    recent_errors: AnalysisError[];
    
    // Computed properties
    has_critical_errors?: boolean;
    success_rate?: number;
    most_common_error_category?: string;
  }