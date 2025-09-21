"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Bug, 
  Wifi, 
  Shield,
  Copy,
  CheckCircle,
  ExternalLink,
  WifiOff
} from "lucide-react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isOnline: boolean;
  copied: boolean;
}

type ErrorType = 'network' | 'authentication' | 'permission' | 'server' | 'client' | 'unknown';

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      isOnline: true,
      copied: false 
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      isOnline: navigator.onLine,
      copied: false
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  componentDidMount() {
    const updateOnlineStatus = () => this.setState({ isOnline: navigator.onLine });
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
  }

  componentWillUnmount() {
    const updateOnlineStatus = () => this.setState({ isOnline: navigator.onLine });
    window.removeEventListener('online', updateOnlineStatus);
    window.removeEventListener('offline', updateOnlineStatus);
  }

  private getErrorType(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) return 'network';
    if (message.includes('unauthorized') || message.includes('auth')) return 'authentication';
    if (message.includes('forbidden') || message.includes('permission')) return 'permission';
    if (message.includes('server') || message.includes('500')) return 'server';
    if (message.includes('not found') || message.includes('404')) return 'client';
    
    return 'unknown';
  }

  private getErrorConfig(type: ErrorType) {
    switch (type) {
      case 'network':
        return {
          icon: Wifi,
          title: "Connection Problem",
          description: "Unable to connect to our servers. Please check your internet connection.",
          color: "text-orange-600 dark:text-orange-400",
          bgColor: "bg-orange-100 dark:bg-orange-900/30",
          suggestions: [
            "Check your internet connection",
            "Try refreshing the page",
            "Disable VPN if active",
            "Contact your network administrator"
          ]
        };
      case 'authentication':
        return {
          icon: Shield,
          title: "Authentication Error",
          description: "Your session has expired or you don't have permission to access this resource.",
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-100 dark:bg-red-900/30",
          suggestions: [
            "Sign in again",
            "Clear browser cache and cookies",
            "Check if your account is active",
            "Contact support if the problem persists"
          ]
        };
      default:
        return {
          icon: AlertTriangle,
          title: "Something went wrong",
          description: "An unexpected error occurred in the application.",
          color: "text-destructive",
          bgColor: "bg-destructive/10",
          suggestions: [
            "Try refreshing the page",
            "Clear your browser cache",
            "Try using an incognito window",
            "Contact support with the error details"
          ]
        };
    }
  }

  private copyErrorDetails = async () => {
    if (!this.state.error) return;

    const errorDetails = `
Error: ${this.state.error.message}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
URL: ${window.location.href}
Stack: ${this.state.error.stack}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorDetails);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  private handleRetry = () => {
    if (!this.state.isOnline) {
      alert('Please check your internet connection before retrying.');
      return;
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorType = this.getErrorType(this.state.error);
      const config = this.getErrorConfig(errorType);
      const IconComponent = config.icon;

      return (
        <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
          <Card className="w-full max-w-2xl border-destructive/20 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${config.bgColor}`}>
                <IconComponent className={`h-8 w-8 ${config.color}`} />
              </div>
              <CardTitle className="text-2xl font-bold">{config.title}</CardTitle>
              <CardDescription className="text-base mt-2">
                {config.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {!this.state.isOnline && (
                <Alert className="border-orange-200 dark:border-orange-800">
                  <WifiOff className="h-4 w-4" />
                  <AlertDescription>
                    You appear to be offline. Please check your internet connection.
                  </AlertDescription>
                </Alert>
              )}

              <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <p className="text-sm font-medium">Error Details</p>
                    <p className="text-sm text-muted-foreground break-words">
                      {this.state.error.message || "An unknown error occurred"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={this.copyErrorDetails}
                    className="ml-4 flex-shrink-0"
                  >
                    {this.state.copied ? (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    {this.state.copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Troubleshooting Steps</p>
                <div className="space-y-2">
                  {config.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button onClick={this.handleRetry} className="flex-1 group">
                  <RefreshCw className="mr-2 h-4 w-4 group-hover:animate-spin" />
                  Try Again
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Go Home
                  </Link>
                </Button>
              </div>

              <div className="text-center pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-3">
                  If this problem continues, our support team can help
                </p>
                <div className="flex justify-center gap-4">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/support" className="flex items-center">
                      <ExternalLink className="mr-2 h-3 w-3" />
                      Contact Support
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}