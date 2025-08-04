"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "../hooks/auth";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={logout} variant="outline">
          Logout
        </Button>
      </div>

      <div className="bg-card p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Welcome back!</h2>
        {user && (
          <div>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>User ID:</strong> {user.id}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
