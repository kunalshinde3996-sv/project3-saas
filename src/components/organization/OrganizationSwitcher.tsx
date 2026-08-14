"use client";

import { ChevronDown, Building2, Check } from "lucide-react";
import { useState } from "react";

interface Organization {
  id: number;
  name: string;
  plan: "Free" | "Pro" | "Enterprise";
}

const organizations: Organization[] = [
  {
    id: 1,
    name: "Acme Corporation",
    plan: "Pro",
  },
  {
    id: 2,
    name: "Nova Analytics",
    plan: "Free",
  },
];

export default function OrganizationSwitcher() {
  const [selected, setSelected] = useState(organizations[0]);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm hover:bg-slate-50"
      >
        <Building2 className="text-blue-600" size={20} />

        <div className="text-left">
          <p className="text-sm font-semibold">{selected.name}</p>

          <p className="text-xs text-slate-500">{selected.plan} Plan</p>
        </div>

        <ChevronDown size={18} />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-72 rounded-2xl border bg-white p-2 shadow-xl z-50">
          {organizations.map((org) => (
            <button
              key={org.id}
              onClick={() => {
                setSelected(org);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 hover:bg-slate-100"
            >
              <div className="text-left">
                <p className="font-medium">{org.name}</p>

                <p className="text-xs text-slate-500">{org.plan} Plan</p>
              </div>

              {selected.id === org.id && (
                <Check
                  className="text-green-600"
                  size={18}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}