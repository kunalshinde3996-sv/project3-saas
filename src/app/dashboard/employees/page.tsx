"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Mail,
  Shield,
  Search,
  Plus,
  MoreHorizontal,
  UserCheck,
  X,
  Loader2,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Avatar from "@/components/ui/Avatar";
import { api } from "@/lib/api";

type MemberRole = "owner" | "admin" | "viewer";

interface Member {
  id: string;
  email: string;
  role: MemberRole;
  created_at: string;
}

export default function EmployeesPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<MemberRole>("viewer");
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMembers() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get<Member[]>("/api/org/members");
      setMembers(response.data);
    } catch {
      setError("Unable to load employees. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
  let cancelled = false;

  async function fetchMembers() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get<Member[]>("/api/org/members");

      if (!cancelled) {
        setMembers(response.data);
      }
    } catch {
      if (!cancelled) {
        setError(
          "Unable to load employees. Please check your connection."
        );
      }
    } finally {
      if (!cancelled) {
        setIsLoading(false);
      }
    }
  }

  fetchMembers();

  return () => {
    cancelled = true;
  };
}, []);

  async function handleInvite() {
    if (!inviteEmail.trim()) return;

    try {
      setIsInviting(true);
      setError(null);

      await api.post("/api/org/invite", {
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      setInviteEmail("");
      setInviteRole("viewer");
      setShowInvite(false);

      await loadMembers();
    } catch {
      setError("Could not add this employee. The email may already be registered.");
    } finally {
      setIsInviting(false);
    }
  }

  const filteredMembers = useMemo(() => {
    const query = search.toLowerCase();

    return members.filter(
      (member) =>
        member.email.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query)
    );
  }, [members, search]);

  const adminCount = members.filter(
    (member) => member.role === "admin"
  ).length;

  const ownerCount = members.filter(
    (member) => member.role === "owner"
  ).length;

  const activeCount = members.length;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            <Users size={16} />
            Workforce Management
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Employees
          </h1>

          <p className="mt-2 text-lg text-slate-500">
            Manage your organization members and workforce access.
          </p>
        </div>

        <Button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 rounded-xl px-5 py-3 shadow-md hover:shadow-lg"
        >
          <Plus size={18} />
          Add Employee
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <span>{error}</span>

          <button
            onClick={() => setError(null)}
            className="rounded-lg p-1 hover:bg-red-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        <Card className="rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
              <Users className="text-blue-600" size={28} />
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              Total
            </span>
          </div>

          <p className="mt-6 text-sm font-medium text-slate-500">
            Total Employees
          </p>

          <h2 className="mt-2 text-4xl font-bold text-slate-900">
            {members.length}
          </h2>

          <p className="mt-3 text-sm text-slate-500">
            Organization members
          </p>
        </Card>

        <Card className="rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">
            <Shield className="text-green-600" size={28} />
          </div>

          <p className="mt-6 text-sm font-medium text-slate-500">
            Administrators
          </p>

          <h2 className="mt-2 text-4xl font-bold text-slate-900">
            {adminCount}
          </h2>

          <p className="mt-3 text-sm text-slate-500">
            Admin access
          </p>
        </Card>

        <Card className="rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100">
            <UserCheck className="text-purple-600" size={28} />
          </div>

          <p className="mt-6 text-sm font-medium text-slate-500">
            Organization Owners
          </p>

          <h2 className="mt-2 text-4xl font-bold text-slate-900">
            {ownerCount}
          </h2>

          <p className="mt-3 text-sm text-slate-500">
            Full organization access
          </p>
        </Card>

        <Card className="rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100">
            <Users className="text-orange-600" size={28} />
          </div>

          <p className="mt-6 text-sm font-medium text-slate-500">
            Active Members
          </p>

          <h2 className="mt-2 text-4xl font-bold text-slate-900">
            {activeCount}
          </h2>

          <p className="mt-3 text-sm font-medium text-green-600">
            ● All accounts active
          </p>
        </Card>

      </div>

      {/* Search */}
      <Card className="rounded-3xl p-5">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-blue-400 focus-within:bg-white">
          <Search size={20} className="text-slate-400" />

          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search employees by email or role..."
            className="border-0 bg-transparent p-0 shadow-none focus:ring-0"
          />
        </div>
      </Card>

      {/* Employee Table */}
      <Card className="overflow-hidden rounded-3xl p-0">

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Organization Members
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage access to your workspace.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
            {filteredMembers.length} members
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-slate-500">
              <Loader2 className="animate-spin" size={20} />
              Loading employees...
            </div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <Users className="text-slate-400" size={28} />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-slate-900">
              No employees found
            </h3>

            <p className="mt-2 max-w-md text-sm text-slate-500">
              {search
                ? "Try changing your search."
                : "Add your first employee to get started."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Employee
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Email
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Role
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Joined
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredMembers.map((member) => {
                  const displayName = member.email
                    .split("@")[0]
                    .replace(/[._-]/g, " ")
                    .replace(/\b\w/g, (letter) => letter.toUpperCase());

                  return (
                    <tr
                      key={member.id}
                      className="border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <Avatar name={displayName} />

                          <div>
                            <p className="font-semibold text-slate-900">
                              {displayName}
                            </p>

                            <p className="text-xs text-slate-500">
                              Member
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail size={16} className="text-slate-400" />
                          {member.email}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                            member.role === "owner"
                              ? "bg-purple-100 text-purple-700"
                              : member.role === "admin"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {member.role.charAt(0).toUpperCase() +
                            member.role.slice(1)}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-500">
                        {new Date(member.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                          <MoreHorizontal size={20} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">

            <div className="flex items-start justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                  <Users className="text-blue-600" size={24} />
                </div>

                <h2 className="mt-5 text-2xl font-bold text-slate-900">
                  Add Employee
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Add a new member to your organization.
                </p>
              </div>

              <button
                onClick={() => setShowInvite(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-7 space-y-5">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Work email
                </label>

                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  placeholder="employee@company.com"
                  className="h-12"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Access level
                </label>

                <select
                  value={inviteRole}
                  onChange={(event) =>
                    setInviteRole(event.target.value as MemberRole)
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500"
                >
                  <option value="viewer">Viewer</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
              </div>

              <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
                The account will be created by the backend and added to your
                organization.
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowInvite(false)}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim() || isInviting}
                  className="flex-1 rounded-xl"
                >
                  {isInviting ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={17} />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2" size={17} />
                      Add Employee
                    </>
                  )}
                </Button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}