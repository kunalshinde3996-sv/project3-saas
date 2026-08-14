"use client";

import { Bell, ChevronDown, Search, Settings, Sparkles } from "lucide-react";

import OrganizationSwitcher from "../organization/OrganizationSwitcher";
import Avatar from "@/components/ui/Avatar";
import Input from "@/components/ui/Input";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 hidden h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur-xl lg:flex">
      {/* Left */}
      <div className="flex items-center gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          <h2 className="mt-0.5 text-lg font-bold text-slate-900">Dashboard</h2>
        </div>

        {/* Search */}
        <div className="relative ml-3">
          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <Input
            placeholder="Search anything..."
            className="h-11 w-72 rounded-xl border-slate-200 bg-slate-50 pl-11 pr-4 text-sm transition-all focus:bg-white"
          />

          <div className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 xl:block">
            ⌘ K
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Organization */}
        <div className="mr-1">
          <OrganizationSwitcher />
        </div>

        {/* Upgrade */}
        <button
          type="button"
          className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-lg xl:flex"
        >
          <Sparkles size={15} />
          Upgrade
        </button>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <Bell size={19} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Settings */}
        <button
          type="button"
          aria-label="Settings"
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <Settings size={19} />
        </button>

        {/* Divider */}
        <div className="mx-1 h-8 w-px bg-slate-200" />

        {/* User */}
        <button
          type="button"
          className="group flex items-center gap-3 rounded-xl border border-transparent px-2 py-1.5 transition hover:border-slate-200 hover:bg-slate-50"
        >
          <Avatar name="Admin User" />

          <div className="hidden text-left xl:block">
            <p className="text-sm font-semibold leading-5 text-slate-900">
              Admin User
            </p>

            <p className="text-[11px] font-medium text-slate-400">
              Administrator
            </p>
          </div>

          <ChevronDown
            size={15}
            className="text-slate-400 transition group-hover:text-slate-600"
          />
        </button>
      </div>
    </header>
  );
}
