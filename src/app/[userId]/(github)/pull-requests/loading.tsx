import {
  LoadingGrid,
  PageLoadingSpinner,
} from "@/components/github/loading-states";

export default function LoadingPage() {
  return (
    <div className="space-y-6">
      <PageLoadingSpinner message="Loading pull requests..." />
      <LoadingGrid type="pullRequests" count={4} />
    </div>
  );
}
