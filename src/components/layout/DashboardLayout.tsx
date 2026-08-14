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
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <Sidebar onLogout={onLogout} />

      {/* Mobile Sidebar */}
      <MobileSidebar
        open={open}
        onClose={() => setOpen(false)}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className="lg:ml-72">
        <Navbar />

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}