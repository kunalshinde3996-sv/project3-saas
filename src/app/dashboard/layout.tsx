"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { isLoggedIn, removeToken } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/connectors", label: "Connectors" },
  { href: "/dashboard/org", label: "Organization" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
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

  return (
    <div className="flex flex-1 bg-zinc-50 dark:bg-black">
      <aside className="flex w-60 shrink-0 flex-col justify-between border-r border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-zinc-950">
        <div>
          <div className="px-2 py-2 text-lg font-semibold text-black dark:text-zinc-50">
            Project 3
          </div>
          <nav className="mt-6 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-black/[.06] text-black dark:bg-white/[.08] dark:text-zinc-50"
                      : "text-zinc-600 hover:bg-black/[.04] hover:text-black dark:text-zinc-400 dark:hover:bg-white/[.06] dark:hover:text-zinc-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md px-3 py-2 text-left text-sm font-medium text-zinc-600 transition-colors hover:bg-black/[.04] hover:text-black dark:text-zinc-400 dark:hover:bg-white/[.06] dark:hover:text-zinc-50"
        >
          Log out
        </button>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
