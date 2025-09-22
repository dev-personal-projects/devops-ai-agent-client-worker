import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

interface GitHubLayoutProps {
  children: React.ReactNode;
}

export default function GitHubLayout({ children }: GitHubLayoutProps) {
  const params = useParams();
  const pathname = usePathname();
  const userId = params.userId as string;

  const navItems = [
    {
      href: `/${userId}/repositories`,
      label: "Repositories",
      path: "repositories",
    },
    {
      href: `/${userId}/pull-requests`,
      label: "Pull Requests",
      path: "pull-requests",
    },
    {
      href: `/${userId}/organizations`,
      label: "Organizations",
      path: "organizations",
    },
  ];

  const isActive = (path: string) => pathname.includes(path);

  return (
    <div className="flex flex-col h-full">
      {/* GitHub Navigation */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-6">
          <nav className="flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.path)
                    ? "text-foreground border-b-2 border-primary pb-4"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
