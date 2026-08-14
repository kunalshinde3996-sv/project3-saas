"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { api } from "@/lib/api";
import { PLAN_ORDER, type PlanTier, type Subscription } from "@/types";

/**
 * Wrap anything that should be locked behind a paid plan:
 *
 *   <PlanGate requiredPlan="pro">
 *     <AdvancedChartBuilder />
 *   </PlanGate>
 *
 * IMPORTANT: this only hides UI. It is NOT the security boundary — the matching
 * backend route must also use `Depends(require_plan(PlanTier.pro))` (see
 * backend/auth/plan_gates.py), because anyone can call the API directly and skip
 * the frontend entirely.
 */
export function PlanGate({
  requiredPlan,
  children,
}: {
  requiredPlan: PlanTier;
  children: ReactNode;
}) {
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    api.get<Subscription>("/api/billing/me").then((res) => setSubscription(res.data));
  }, []);

  // While loading, render nothing rather than a flash of the locked state.
  if (subscription === null) return null;

  const hasAccess =
    PLAN_ORDER.indexOf(subscription.plan) >= PLAN_ORDER.indexOf(requiredPlan);

  if (hasAccess) return <>{children}</>;

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-black/[.12] bg-zinc-50 p-8 text-center dark:border-white/[.15] dark:bg-zinc-900">
      <LockIcon />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        This feature requires the{" "}
        <span className="font-medium capitalize text-black dark:text-zinc-50">
          {requiredPlan}
        </span>{" "}
        plan.
      </p>
      <button
        type="button"
        onClick={() => router.push("/dashboard/billing")}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
      >
        Upgrade to {requiredPlan}
      </button>
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-6 w-6 text-zinc-400"
    >
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
