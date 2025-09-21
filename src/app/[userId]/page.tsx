import { redirect } from "next/navigation";

interface UserPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function UserPage({ params }: UserPageProps) {
  const { userId } = await params;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!userId || !uuidRegex.test(userId)) {
    redirect("/auth/login?error=invalid_workspace");
  }
  
  redirect(`/${userId}/dashboard`);
}