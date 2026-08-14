"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Database, UploadCloud } from "lucide-react";

import { api } from "@/lib/api";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Connectors</h1>
        <p className="mt-2 text-lg text-slate-500">
          Data sources feeding your organization&apos;s analytics.
        </p>
      </div>

      {/* Upload */}
      <Card>
        <h2 className="text-lg font-bold text-slate-900">Upload CSV</h2>
        <p className="mt-1 text-sm text-slate-500">
          Create a new connector from a CSV file.
        </p>

        <form
          onSubmit={handleUpload}
          className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end"
        >
          <div className="flex flex-1 flex-col gap-2">
            <label
              htmlFor="connectorName"
              className="text-sm font-medium text-slate-700"
            >
              Connector name
            </label>
            <Input
              id="connectorName"
              type="text"
              placeholder="e.g. Q1 Sales Export"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <label
              htmlFor="csvFile"
              className="text-sm font-medium text-slate-700"
            >
              CSV file
            </label>
            <input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-600"
            />
          </div>

          <Button type="submit" disabled={isUploading}>
            <UploadCloud size={18} />
            {isUploading ? "Uploading..." : "Upload CSV"}
          </Button>
        </form>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </Card>

      {/* Connector List */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-900">
            Connected Sources
          </h2>
          <p className="text-sm text-slate-500">
            All connectors registered for your organization
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-5 text-left text-sm font-semibold text-slate-600">
                  Name
                </th>
                <th className="p-5 text-left text-sm font-semibold text-slate-600">
                  Type
                </th>
                <th className="p-5 text-left text-sm font-semibold text-slate-600">
                  Created
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="p-5 text-sm text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : connectors.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <EmptyState title="No connectors yet" />
                  </td>
                </tr>
              ) : (
                connectors.map((connector) => (
                  <tr
                    key={connector.id}
                    className="border-t transition hover:bg-slate-50"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
                          <Database size={16} className="text-blue-600" />
                        </div>
                        <p className="font-semibold text-slate-900">
                          {connector.name}
                        </p>
                      </div>
                    </td>
                    <td className="p-5 text-sm text-slate-600">
                      {connector.connector_type}
                    </td>
                    <td className="p-5 text-sm text-slate-600">
                      {new Date(connector.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
