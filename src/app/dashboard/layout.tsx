"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { isLoggedIn, removeToken } from "@/lib/auth";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    setIsAuthChecked(true);
  }, [router]);

  function handleLogout() {
    removeToken();
    router.push("/login");
  }

  if (!isAuthChecked) {
    return null;
  }

  return <DashboardLayout onLogout={handleLogout}>{children}</DashboardLayout>;
}
