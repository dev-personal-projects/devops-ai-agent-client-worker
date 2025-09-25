export * from "./core.types";
export * from "./codebase.types";
export * from "./infrastructure.types";
export * from "./recommendations.types";
export * from "./models.types";

export * from "./requests.types";
export * from "./execution.types";
export * from "./errors.types";
export const isAnalysisResult = (
  obj: any
): obj is import("./models.types").AnalysisResult => {
  return (
    obj &&
    typeof obj.id === "string" &&
    typeof obj.status === "string" &&
    typeof obj.repository_url === "string"
  );
};

export const isRecommendation = (
  obj: any
): obj is import("./recommendations.types").Recommendation => {
  return (
    obj &&
    typeof obj.id === "string" &&
    typeof obj.type === "string" &&
    typeof obj.priority === "string"
  );
};

export const isExecutionSummary = (
  obj: any
): obj is import("./execution.types").ExecutionSummary => {
  return (
    obj &&
    typeof obj.execution_id === "string" &&
    typeof obj.analysis_id === "string" &&
    typeof obj.status === "string"
  );
};

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  status: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};
