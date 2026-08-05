"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { api } from "@/lib/api";
import { setToken } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await api.post("/api/auth/register", {
        org_name: orgName,
        email,
        password,
      });
      setToken(response.data.access_token);
      router.push("/dashboard");
    } catch {
      setError("Could not create your account. The email may already be registered.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="w-full max-w-sm rounded-lg border border-black/[.08] bg-white p-8 dark:border-white/[.145] dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Create your account</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Set up your organization to get started.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="orgName" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Organization name
            </label>
            <input
              id="orgName"
              type="text"
              required
              value={orgName}
              onChange={(event) => setOrgName(event.target.value)}
              className="rounded-md border border-black/[.08] bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-950 dark:border-white/[.145] dark:bg-black dark:text-zinc-50 dark:focus:border-zinc-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-md border border-black/[.08] bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-950 dark:border-white/[.145] dark:bg-black dark:text-zinc-50 dark:focus:border-zinc-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-md border border-black/[.08] bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-950 dark:border-white/[.145] dark:bg-black dark:text-zinc-50 dark:focus:border-zinc-50"
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 flex h-11 w-full items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-zinc-950 dark:text-zinc-50">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
