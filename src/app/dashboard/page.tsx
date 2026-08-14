"use client";

import { useEffect, useState } from "react";
import { Activity, Database, Layers, Users } from "lucide-react";

import { api } from "@/lib/api";
import Card from "@/components/ui/Card";
import type { Connector, Organization, User } from "@/types";

interface Member {
  id: string;
}

interface ConnectorSummary {
  row_count: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [connectorCount, setConnectorCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [recordCount, setRecordCount] = useState(0);
  const [isDegraded, setIsDegraded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [userResponse, orgResponse] = await Promise.all([
          api.get<User>("/api/auth/me"),
          api.get<Organization>("/api/org/me"),
        ]);
        if (!isMounted) return;
        setUser(userResponse.data);
        setOrganization(orgResponse.data);
      } catch {
        if (isMounted) setIsDegraded(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }

      const [membersResult, connectorsResult] = await Promise.allSettled([
        api.get<Member[]>("/api/org/members"),
        api.get<Connector[]>("/api/connectors"),
      ]);

      if (!isMounted) return;

      let degraded = false;

      if (membersResult.status === "fulfilled") {
        setMemberCount(membersResult.value.data.length);
      } else {
        degraded = true;
      }

      if (connectorsResult.status === "fulfilled") {
        const connectors = connectorsResult.value.data;
        setConnectorCount(connectors.length);

        const summaries = await Promise.allSettled(
          connectors.map((connector) =>
            api.get<ConnectorSummary>(`/api/data/${connector.id}/summary`)
          )
        );

        if (!isMounted) return;

        let total = 0;
        for (const summary of summaries) {
          if (summary.status === "fulfilled") {
            total += summary.value.data.row_count;
          } else {
            degraded = true;
          }
        }
        setRecordCount(total);
      } else {
        degraded = true;
      }

      if (isMounted && degraded) setIsDegraded(true);
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading...</p>;
  }

  const stats = [
    {
      label: "Total Connectors",
      value: connectorCount,
      icon: Database,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      accent: "text-blue-600",
      hint: "Data sources connected",
    },
    {
      label: "Active Users",
      value: memberCount,
      icon: Users,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      accent: "text-indigo-600",
      hint: "Members in your org",
    },
    {
      label: "Data Records",
      value: recordCount.toLocaleString(),
      icon: Layers,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      accent: "text-green-600",
      hint: "Rows ingested across connectors",
    },
    {
      label: "System Status",
      value: isDegraded ? "Degraded" : "Operational",
      icon: Activity,
      iconBg: isDegraded ? "bg-yellow-100" : "bg-green-100",
      iconColor: isDegraded ? "text-yellow-600" : "text-green-600",
      accent: isDegraded ? "text-yellow-600" : "text-green-600",
      hint: isDegraded ? "Some data failed to load" : "All systems normal",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          Welcome{user ? `, ${user.email}` : ""}
        </h1>
        <p className="mt-2 text-lg text-slate-500">
          {organization ? `Organization: ${organization.name}` : "No organization found."}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.iconBg}`}
              >
                <Icon className={stat.iconColor} size={28} />
              </div>

              <p className="mt-6 text-sm text-slate-500">{stat.label}</p>

              <h2 className="mt-2 text-4xl font-bold text-slate-900">
                {stat.value}
              </h2>

              <p className={`mt-3 text-sm ${stat.accent}`}>{stat.hint}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
