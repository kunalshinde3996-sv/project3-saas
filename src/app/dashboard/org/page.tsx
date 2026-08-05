"use client";

import { useEffect, useState, type FormEvent } from "react";

import { api } from "@/lib/api";
import type { Organization, User, UserRole } from "@/types";

interface Member {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

const ROLE_OPTIONS: UserRole[] = ["owner", "admin", "viewer"];

export default function OrgPage() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("viewer");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  async function loadMembers() {
    try {
      const membersResponse = await api.get<Member[]>("/api/org/members");
      setMembers(membersResponse.data);
      setMembersError(null);
    } catch {
      setMembers([]);
      setMembersError("You don't have permission to view members.");
    }
  }

  async function loadData() {
    setIsLoading(true);
    try {
      const [orgResponse, userResponse] = await Promise.all([
        api.get<Organization>("/api/org/me"),
        api.get<User>("/api/auth/me"),
      ]);
      setOrganization(orgResponse.data);
      setCurrentUser(userResponse.data);
      await loadMembers();
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInviteError(null);
    setInviteSuccess(null);
    setIsInviting(true);

    try {
      await api.post("/api/org/invite", { email: inviteEmail, role: inviteRole });
      setInviteSuccess(`Invited ${inviteEmail} as ${inviteRole}.`);
      setInviteEmail("");
      setInviteRole("viewer");
      await loadMembers();
    } catch {
      setInviteError("Could not invite member. You may not have permission, or the email is already in use.");
    } finally {
      setIsInviting(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading...</p>;
  }

  const canInvite = currentUser?.role === "owner";

  return (
    <div>
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Organization</h1>

      <div className="mt-4 rounded-lg border border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-zinc-950">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Name</p>
        <p className="text-black dark:text-zinc-50">{organization?.name}</p>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">Schema</p>
        <p className="font-mono text-sm text-black dark:text-zinc-50">{organization?.schema_name}</p>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-black dark:text-zinc-50">Members</h2>
      <div className="mt-3 overflow-hidden rounded-lg border border-black/[.08] dark:border-white/[.145]">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/[.03] text-zinc-600 dark:bg-white/[.04] dark:text-zinc-400">
            <tr>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {membersError ? (
              <tr>
                <td colSpan={2} className="px-4 py-4 text-zinc-600 dark:text-zinc-400">
                  {membersError}
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-4 text-zinc-600 dark:text-zinc-400">
                  No members found.
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} className="border-t border-black/[.08] dark:border-white/[.145]">
                  <td className="px-4 py-2 text-black dark:text-zinc-50">{member.email}</td>
                  <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">{member.role}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {canInvite && (
        <>
          <h2 className="mt-8 text-lg font-semibold text-black dark:text-zinc-50">Invite a member</h2>
          <form
            onSubmit={handleInvite}
            className="mt-3 flex flex-col gap-3 rounded-lg border border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-zinc-950 sm:flex-row sm:items-end"
          >
            <div className="flex flex-1 flex-col gap-1.5">
              <label htmlFor="inviteEmail" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email
              </label>
              <input
                id="inviteEmail"
                type="email"
                required
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                className="rounded-md border border-black/[.08] bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-950 dark:border-white/[.145] dark:bg-black dark:text-zinc-50 dark:focus:border-zinc-50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="inviteRole" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Role
              </label>
              <select
                id="inviteRole"
                value={inviteRole}
                onChange={(event) => setInviteRole(event.target.value as UserRole)}
                className="rounded-md border border-black/[.08] bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-950 dark:border-white/[.145] dark:bg-black dark:text-zinc-50 dark:focus:border-zinc-50"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isInviting}
              className="flex h-10 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
            >
              {isInviting ? "Inviting..." : "Invite"}
            </button>
          </form>

          {inviteError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{inviteError}</p>}
          {inviteSuccess && <p className="mt-2 text-sm text-green-600 dark:text-green-400">{inviteSuccess}</p>}
        </>
      )}
    </div>
  );
}
