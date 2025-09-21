// src/components/global-loading.tsx
"use client";

import { Loader2, Database, GitBranch, Settings, BarChart3, Wifi, WifiOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";

interface LoadingProps {
  variant?: 'default' | 'page' | 'inline' | 'minimal';
  message?: string;
  showProgress?: boolean;
  showSteps?: boolean;
  className?: string;
}

const loadingSteps = [
  { icon: Database, label: "Connecting to services", duration: 1000 },
  { icon: GitBranch, label: "Loading data", duration: 1500 },
  { icon: BarChart3, label: "Processing information", duration: 1200 },
  { icon: Settings, label: "Finalizing", duration: 800 },
];

export function GlobalLoading({ 
  variant = 'default',
  message = "Loading...",
  showProgress = false,
  showSteps = false,
  className = ""
}: LoadingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    if (showProgress || showSteps) {
      const totalDuration = loadingSteps.reduce((sum, step) => sum + step.duration, 0);
      let elapsed = 0;

      const interval = setInterval(() => {
        elapsed += 100;
        const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
        setProgress(newProgress);

        let stepElapsed = 0;
        for (let i = 0; i < loadingSteps.length; i++) {
          stepElapsed += loadingSteps[i].duration;
          if (elapsed <= stepElapsed) {
            setCurrentStep(i);
            break;
          }
        }

        if (elapsed >= totalDuration) {
          clearInterval(interval);
          setCurrentStep(loadingSteps.length - 1);
          setProgress(100);
        }
      }, 100);

      return () => {
        clearInterval(interval);
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
      };
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [showProgress, showSteps]);

  const CurrentIcon = showSteps && loadingSteps[currentStep] ? loadingSteps[currentStep].icon : Loader2;

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-lg animate-pulse rounded-full"></div>
            <Loader2 className="relative h-8 w-8 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">{message}</p>
          {!isOnline && (
            <Alert className="border-orange-200 dark:border-orange-800 max-w-sm">
              <WifiOff className="h-4 w-4" />
              <AlertDescription className="text-xs">
                You appear to be offline
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 ${className}`}>
      <Card className="w-full max-w-lg mx-4 border-0 shadow-2xl">
        <CardContent className="flex flex-col items-center gap-8 p-12">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse rounded-full"></div>
            <div className="relative flex items-center justify-center h-20 w-20 bg-primary/10 rounded-full">
              <CurrentIcon className="h-10 w-10 text-primary animate-pulse" />
            </div>
          </div>

          <div className="text-center space-y-3 w-full">
            <h3 className="text-2xl font-semibold tracking-tight">
              {variant === 'page' ? 'Loading Page' : 'Loading'}
            </h3>
            <p className="text-muted-foreground">
              {showSteps && loadingSteps[currentStep] ? loadingSteps[currentStep].label : message}
            </p>
          </div>

          {!isOnline && (
            <Alert className="border-orange-200 dark:border-orange-800 w-full">
              <WifiOff className="h-4 w-4" />
              <AlertDescription>
                You appear to be offline. Some features may not work properly.
              </AlertDescription>
            </Alert>
          )}

          {showProgress && (
            <div className="w-full space-y-4">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Initializing</span>
                <span>{Math.round(progress)}%</span>
                <span>Complete</span>
              </div>
            </div>
          )}

          {showSteps && (
            <div className="flex justify-center space-x-6 w-full">
              {loadingSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <div
                    key={index}
                    className={`flex flex-col items-center space-y-2 transition-all duration-300 ${
                      isActive 
                        ? 'scale-110 text-primary' 
                        : isCompleted 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-muted-foreground'
                    }`}
                  >
                    <div className={`p-2 rounded-full transition-colors ${
                      isActive 
                        ? 'bg-primary/20' 
                        : isCompleted 
                          ? 'bg-green-100 dark:bg-green-900/30' 
                          : 'bg-muted'
                    }`}>
                      <StepIcon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium hidden sm:block">
                      {step.label.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Please wait while we prepare your content
            </p>
            <div className="flex items-center justify-center space-x-1">
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}