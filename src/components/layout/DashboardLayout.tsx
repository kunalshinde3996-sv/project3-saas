"use client";

import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileSidebar from "./MobileSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  onLogout?: () => void;
}

export default function DashboardLayout({
  children,
  onLogout,
}: DashboardLayoutProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="w-72">
          <Sidebar onLogout={onLogout} />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        open={open}
        onClose={() => setOpen(false)}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}