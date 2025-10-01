/**
 * Environment Configuration
 * Type-safe access to environment variables
 */

interface EnvConfig {
  // API Configuration
  apiUrl: string;
  apiTimeout: number;

  // OAuth Configuration
  githubClientId?: string;
  googleClientId?: string;

  // App Configuration
  appUrl: string;
  environment: "development" | "staging" | "production";
  
  // Feature Flags
  enableDebugLogging: boolean;
  enableErrorReporting: boolean;

  // Security
  jwtSecret?: string; // Only for server-side
}

class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  private config: EnvConfig;

  private constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  private loadConfig(): EnvConfig {
    // Determine environment
    const nodeEnv = process.env.NODE_ENV || "development";
    const environment = this.determineEnvironment(nodeEnv);

    return {
      // API Configuration
      apiUrl: this.getRequiredEnv("NEXT_PUBLIC_API_URL"),
      apiTimeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "30000", 10),

      // OAuth Configuration (optional, backend may provide)
      githubClientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
      googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,

      // App Configuration
      appUrl: process.env.NEXT_PUBLIC_APP_URL || this.getDefaultAppUrl(),
      environment,

      // Feature Flags
      enableDebugLogging: environment === "development",
      enableErrorReporting: environment === "production",

      // Security (server-side only)
      jwtSecret: process.env.NEXT_PUBLIC_JWT_SECRET,
    };
  }

  private determineEnvironment(nodeEnv: string): "development" | "staging" | "production" {
    const appEnv = process.env.NEXT_PUBLIC_APP_ENV;
    
    if (appEnv === "staging") return "staging";
    if (appEnv === "production" || nodeEnv === "production") return "production";
    return "development";
  }

  private getRequiredEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  private getDefaultAppUrl(): string {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "http://localhost:3000";
  }

  private validateConfig(): void {
    const errors: string[] = [];

    // Validate API URL
    try {
      new URL(this.config.apiUrl);
    } catch {
      errors.push("Invalid NEXT_PUBLIC_API_URL format");
    }

    // Validate timeout
    if (this.config.apiTimeout <= 0) {
      errors.push("API timeout must be positive");
    }

    if (errors.length > 0) {
      console.error("Environment configuration errors:", errors);
      if (this.config.environment === "production") {
        throw new Error(`Invalid environment configuration: ${errors.join(", ")}`);
      }
    }
  }

  // Public getters
  get apiUrl(): string {
    return this.config.apiUrl;
  }

  get apiTimeout(): number {
    return this.config.apiTimeout;
  }

  get appUrl(): string {
    return this.config.appUrl;
  }

  get environment(): "development" | "staging" | "production" {
    return this.config.environment;
  }

  get isDevelopment(): boolean {
    return this.config.environment === "development";
  }

  get isProduction(): boolean {
    return this.config.environment === "production";
  }

  get isStaging(): boolean {
    return this.config.environment === "staging";
  }

  get enableDebugLogging(): boolean {
    return this.config.enableDebugLogging;
  }

  get enableErrorReporting(): boolean {
    return this.config.enableErrorReporting;
  }

  get githubClientId(): string | undefined {
    return this.config.githubClientId;
  }

  get googleClientId(): string | undefined {
    return this.config.googleClientId;
  }

  // Utility methods
  getCallbackUrl(provider: string): string {
    return `${this.appUrl}/auth/callback?provider=${provider}`;
  }

  getOAuthRedirectUrl(provider: string): string {
    return `${this.apiUrl}/auth/oauth/${provider}/callback`;
  }

  logConfig(): void {
    if (this.isDevelopment) {
      console.log("Environment Configuration:", {
        environment: this.environment,
        apiUrl: this.apiUrl,
        appUrl: this.appUrl,
        apiTimeout: this.apiTimeout,
        githubEnabled: !!this.githubClientId,
        googleEnabled: !!this.googleClientId,
      });
    }
  }
}

// Export singleton instance
export const env = EnvironmentConfig.getInstance();

// Export configuration getter
export function getEnvConfig(): EnvConfig {
  return {
    apiUrl: env.apiUrl,
    apiTimeout: env.apiTimeout,
    appUrl: env.appUrl,
    environment: env.environment,
    enableDebugLogging: env.enableDebugLogging,
    enableErrorReporting: env.enableErrorReporting,
    githubClientId: env.githubClientId,
    googleClientId: env.googleClientId,
  };
}