"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

import { api } from "@/lib/api";
import type { Connector } from "@/types";

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadConnectors() {
    setIsLoading(true);
    try {
      const response = await api.get<Connector[]>("/api/connectors");
      setConnectors(response.data);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadConnectors();
  }, []);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Choose a CSV file to upload.");
      return;
    }

    setError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("name", name || file.name);
    formData.append("file", file);

    try {
      await api.post("/api/connectors/csv-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setName("");
      setFile(null);
      await loadConnectors();
    } catch {
      setError("Failed to upload CSV file.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Connectors</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Data sources feeding your organization&apos;s analytics.
      </p>

      <form
        onSubmit={handleUpload}
        className="mt-6 flex flex-col gap-3 rounded-lg border border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-zinc-950 sm:flex-row sm:items-end"
      >
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="connectorName" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Connector name
          </label>
          <input
            id="connectorName"
            type="text"
            placeholder="e.g. Q1 Sales Export"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-md border border-black/[.08] bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-950 dark:border-white/[.145] dark:bg-black dark:text-zinc-50 dark:focus:border-zinc-50"
          />
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="csvFile" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            CSV file
          </label>
          <input
            id="csvFile"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="text-sm text-zinc-700 file:mr-3 file:rounded-full file:border-0 file:bg-black/[.06] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-black dark:text-zinc-300 dark:file:bg-white/[.08] dark:file:text-zinc-50"
          />
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="flex h-10 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
        >
          {isUploading ? "Uploading..." : "Upload CSV"}
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="mt-6 overflow-hidden rounded-lg border border-black/[.08] dark:border-white/[.145]">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/[.03] text-zinc-600 dark:bg-white/[.04] dark:text-zinc-400">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Type</th>
              <th className="px-4 py-2 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-4 py-4 text-zinc-600 dark:text-zinc-400">
                  Loading...
                </td>
              </tr>
            ) : connectors.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-4 text-zinc-600 dark:text-zinc-400">
                  No connectors yet.
                </td>
              </tr>
            ) : (
              connectors.map((connector) => (
                <tr key={connector.id} className="border-t border-black/[.08] dark:border-white/[.145]">
                  <td className="px-4 py-2 text-black dark:text-zinc-50">{connector.name}</td>
                  <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">{connector.connector_type}</td>
                  <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                    {new Date(connector.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
