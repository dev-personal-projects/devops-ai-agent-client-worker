import { GlobalNotFound } from "@/components/global-not-found";

export default function NotFound() {
  return (
    <GlobalNotFound 
      title="404 - Page Not Found"
      description="Sorry, the page you are looking for does not exist or has been moved."
      homeUrl="/"
      showQuickLinks={true}
      showSearch={true}
    />
  );
}