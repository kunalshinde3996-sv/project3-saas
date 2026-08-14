"use client";

import Link from "next/link";
import { LogOut, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { menuItems } from "./menu";

interface Props {
  open: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

export default function MobileSidebar({
  open,
  onClose,
  onLogout,
}: Props) {
  const pathname = usePathname();

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 lg:hidden"
      />

      {/* Drawer */}
      <aside className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-white shadow-xl lg:hidden">
        <div className="flex h-16 items-center justify-between border-b px-6">
          <h2 className="text-lg font-bold">
            Analytics Pro
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition
                  ${
                    active
                      ? "bg-blue-600 text-white"
                      : "hover:bg-slate-100"
                  }`}
              >
                <Icon size={20} />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout?.();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={20} />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}