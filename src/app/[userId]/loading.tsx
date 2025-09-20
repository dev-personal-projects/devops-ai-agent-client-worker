import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">Loading Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            Please wait while we load your workspace...
          </p>
        </div>
      </div>
    </div>
  );
}
