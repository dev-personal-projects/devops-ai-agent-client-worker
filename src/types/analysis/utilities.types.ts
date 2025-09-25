import {
  AnalysisResult,
  Recommendation,
  Priority,
  AnalysisStatus,
  ExecutionSummary,
  ExecutionStatus,
  ErrorCategory,
  ErrorSeverity,
} from "./index";
export class AnalysisResultUtils {
  static isCompleted(analysis: AnalysisResult): boolean {
    return analysis.status === AnalysisStatus.COMPLETED;
  }

  static hasCriticalIssues(analysis: AnalysisResult): boolean {
    return analysis.critical_issues > 0;
  }

  static getHighPriorityRecommendations(
    analysis: AnalysisResult
  ): Recommendation[] {
    return analysis.recommendations.filter(
      (rec) =>
        rec.priority === Priority.HIGH || rec.priority === Priority.CRITICAL
    );
  }

  static getTotalEstimatedTime(analysis: AnalysisResult): number {
    return analysis.recommendations.reduce(
      (total, rec) => total + (rec.estimated_time_minutes || 0),
      0
    );
  }

  static getRecommendationsByType(
    analysis: AnalysisResult,
    type: string
  ): Recommendation[] {
    return analysis.recommendations.filter((rec) => rec.type === type);
  }
}

export class RecommendationUtils {
  static getTotalEstimatedTime(recommendation: Recommendation): number {
    if (recommendation.estimated_time_minutes) {
      return recommendation.estimated_time_minutes;
    }

    return recommendation.actions.reduce(
      (total, action) => total + (action.estimated_time_minutes || 0),
      0
    );
  }

  static isHighPriority(recommendation: Recommendation): boolean {
    return (
      recommendation.priority === Priority.HIGH ||
      recommendation.priority === Priority.CRITICAL
    );
  }

  static getTotalActions(recommendation: Recommendation): number {
    return recommendation.actions.length;
  }

  static requiresBashScript(recommendation: Recommendation): boolean {
    return (
      recommendation.bash_script_required ||
      recommendation.actions.some((a) => a.bash_commands.length > 0)
    );
  }
}

export class ExecutionUtils {
  static isSuccessful(execution: ExecutionSummary): boolean {
    return (
      execution.status === ExecutionStatus.COMPLETED &&
      execution.successful_executions > 0
    );
  }

  static getSuccessRate(execution: ExecutionSummary): number {
    const total = execution.successful_executions + execution.failed_executions;
    return total === 0 ? 0 : execution.successful_executions / total;
  }

  static hasFailures(execution: ExecutionSummary): boolean {
    return execution.failed_executions > 0;
  }

  static getTotalFilesChanged(execution: ExecutionSummary): number {
    return execution.total_files_created + execution.total_files_modified;
  }
}

export class ErrorUtils {
  static isRetryable(category: ErrorCategory): boolean {
    return [
      ErrorCategory.API_RATE_LIMIT,
      ErrorCategory.TIMEOUT,
      ErrorCategory.NETWORK_ERROR,
    ].includes(category);
  }

  static requiresUserAction(category: ErrorCategory): boolean {
    return [
      ErrorCategory.REPOSITORY_ACCESS,
      ErrorCategory.CONFIGURATION_ERROR,
    ].includes(category);
  }

  static isCritical(severity: ErrorSeverity): boolean {
    return severity === ErrorSeverity.CRITICAL;
  }
}

export class RepositoryUtils {
  static parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    const match = url.match(/github\.com[/:]([^/]+)\/([^/.]+)/);
    if (match) {
      return { owner: match[1], repo: match[2] };
    }
    return null;
  }

  static isValidGitHubUrl(url: string): boolean {
    return /^(https?:\/\/)?(www\.)?github\.com[/:][\w-]+\/[\w-]+/.test(url);
  }

  static normalizeGitHubUrl(url: string): string {
    const parsed = RepositoryUtils.parseGitHubUrl(url);
    if (parsed) {
      return `https://github.com/${parsed.owner}/${parsed.repo}`;
    }
    return url;
  }
}

export class PriorityUtils {
  static getPriorityOrder(priority: Priority): number {
    const order: Record<Priority, number> = {
      [Priority.CRITICAL]: 4,
      [Priority.HIGH]: 3,
      [Priority.MEDIUM]: 2,
      [Priority.LOW]: 1,
    };
    return order[priority] || 0;
  }

  static comparePriorities(a: Priority, b: Priority): number {
    return (
      PriorityUtils.getPriorityOrder(b) - PriorityUtils.getPriorityOrder(a)
    );
  }

  static getPriorityColor(priority: Priority): string {
    const colors: Record<Priority, string> = {
      [Priority.CRITICAL]: "#FF0000",
      [Priority.HIGH]: "#FF6B6B",
      [Priority.MEDIUM]: "#FFB347",
      [Priority.LOW]: "#77DD77",
    };
    return colors[priority] || "#808080";
  }

  static getPriorityLabel(priority: Priority): string {
    return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
  }
}
