"use client";

import { Lock, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";

interface LockedFeatureProps {
  title: string;
  description: string;
  className?: string;
}

export default function LockedFeature({
  title,
  description,
  className = "",
}: LockedFeatureProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${className}`}
    >
      {/* Soft background decoration */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-purple-100/70 blur-2xl transition group-hover:bg-purple-200/70" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
            <Lock size={21} className="text-slate-500" />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700">
            <Sparkles size={13} />
            PRO
          </span>
        </div>

        <h3 className="mt-5 text-lg font-bold text-slate-900">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {description}
        </p>

        <Button
          type="button"
          className="mt-5 inline-flex items-center gap-2"
        >
          <Sparkles size={16} />
          Upgrade to Pro
        </Button>
      </div>
    </div>
  );
}