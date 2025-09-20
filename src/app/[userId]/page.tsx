import { redirect } from "next/navigation";

interface UserPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function UserPage({ params }: UserPageProps) {
  const { userId } = await params;
  // Redirect to the user's dashboard
  redirect(`/${userId}/dashboard`);
}
