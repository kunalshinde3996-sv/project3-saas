"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { menuItems } from "./menu";
import { api } from "@/lib/api";
import type { User } from "@/types";

interface SidebarProps {
  onLogout?: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;

    api
      .get<User>("/api/auth/me")
      .then((response) => {
        if (isMounted) setUser(response.data);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <aside className="hidden h-screen w-72 flex-col border-r border-slate-200 bg-white lg:flex">
      {/* Logo */}
      <div className="border-b border-slate-200 px-6 py-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-xl font-bold text-white shadow-md">
            A
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Analytics Pro
            </h2>

            <p className="text-sm text-slate-500">
              Enterprise Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto p-5">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const active = pathname === item.href;

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`group flex items-center gap-4 rounded-xl px-4 py-3 font-medium transition-all duration-300 ${
                active
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              <Icon
                size={20}
                className={`transition-transform duration-300 ${
                  active ? "" : "group-hover:scale-110"
                }`}
              />

              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Card */}
      <div className="space-y-3 border-t border-slate-200 p-5">
        <div className="rounded-2xl bg-slate-50 p-4 transition hover:bg-slate-100">
          <div className="flex items-center gap-3">
            <Avatar name={user?.email ?? "U"} />

            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">
                {user?.email ?? "Loading..."}
              </p>

              <p className="text-xs capitalize text-slate-500">
                {user?.role ?? ""}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-green-100 py-2 text-center text-xs font-semibold text-green-700">
            ● System Online
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </aside>
  );
}
