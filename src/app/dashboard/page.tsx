"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import type { Organization, User } from "@/types";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [userResponse, orgResponse] = await Promise.all([
          api.get<User>("/api/auth/me"),
          api.get<Organization>("/api/org/me"),
        ]);
        if (isMounted) {
          setUser(userResponse.data);
          setOrganization(orgResponse.data);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        Welcome{user ? `, ${user.email}` : ""}
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {organization ? `Organization: ${organization.name}` : "No organization found."}
      </p>
    </div>
  );
}
