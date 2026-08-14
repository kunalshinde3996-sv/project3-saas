"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Connector, WidgetType } from "@/types";
import { X, Sparkles, Plus, BarChart2 } from "lucide-react";
import { useDashboard } from "./DashboardContext";

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHART_TYPES: { value: WidgetType; label: string }[] = [
  { value: "line", label: "Line Chart" },
  { value: "bar", label: "Bar Chart" },
  { value: "pie", label: "Pie Chart" },
  { value: "scatter", label: "Scatter Plot" },
  { value: "heatmap", label: "Heatmap" },
  { value: "funnel", label: "Funnel Chart" },
];

export default function AddWidgetModal({ isOpen, onClose }: AddWidgetModalProps) {
  const { addWidget } = useDashboard();
  
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [isLoadingConnectors, setIsLoadingConnectors] = useState(false);

  const [mode, setMode] = useState<"ai" | "manual">("ai");
  const [title, setTitle] = useState("");
  const [chartType, setChartType] = useState<WidgetType>("bar");
  const [selectedConnectorId, setSelectedConnectorId] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadConnectors();
    }
  }, [isOpen]);

  async function loadConnectors() {
    setIsLoadingConnectors(true);
    try {
      const response = await api.get<Connector[]>("/api/connectors");
      setConnectors(response.data || []);
      if (response.data && response.data.length > 0) {
        setSelectedConnectorId(response.data[0].id);
      }
    } catch {
      setError("Failed to fetch data connectors.");
    } finally {
      setIsLoadingConnectors(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "ai") {
        if (!aiQuery.trim()) {
          setError("Please enter a question for the AI Query.");
          setIsSubmitting(false);
          return;
        }
        const name = title.trim() || `AI Query: "${aiQuery.slice(0, 20)}..."`;
        await addWidget(name, "bar", undefined, aiQuery.trim());
      } else {
        if (!selectedConnectorId) {
          setError("Please select a data connector.");
          setIsSubmitting(false);
          return;
        }
        const connectorName = connectors.find(c => c.id === selectedConnectorId)?.name || "Connector";
        const name = title.trim() || `${connectorName} ${chartType.toUpperCase()}`;
        await addWidget(name, chartType, selectedConnectorId);
      }
      
      // Reset form
      setTitle("");
      setAiQuery("");
      onClose();
    } catch {
      setError("Failed to create widget. Please check backend connection.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-blue-500" />
            Add Widget
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="mt-4 flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => setMode("ai")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-colors ${
              mode === "ai"
                ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Query Generator
          </button>
          <button
            type="button"
            onClick={() => setMode("manual")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-colors ${
              mode === "manual"
                ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            Manual Connector
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="widgetTitle" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Widget Title (Optional)
            </label>
            <input
              id="widgetTitle"
              type="text"
              placeholder="e.g. Sales Forecast"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-800 dark:bg-black dark:text-zinc-50 dark:focus:border-zinc-50"
            />
          </div>

          {mode === "ai" ? (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="aiPrompt" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Ask a question about your data
              </label>
              <textarea
                id="aiPrompt"
                rows={3}
                placeholder="e.g. show sales trend last month, or compare regional client counts..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-800 dark:bg-black dark:text-zinc-50 dark:focus:border-zinc-50 resize-none"
                required
              />
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal">
                AI will inspect all loaded database tables, generate SQL, execute queries, and pick the best matching chart automatically.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="dataConnector" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Select Data Source
                </label>
                {isLoadingConnectors ? (
                  <p className="text-xs text-zinc-500 animate-pulse">Loading connectors...</p>
                ) : connectors.length === 0 ? (
                  <div className="rounded-md border border-dashed border-zinc-200 p-3 text-center text-xs text-zinc-500 dark:border-zinc-800">
                    No connectors active. Go to the &quot;Connectors&quot; tab to upload a CSV first.
                  </div>
                ) : (
                  <select
                    id="dataConnector"
                    value={selectedConnectorId}
                    onChange={(e) => setSelectedConnectorId(e.target.value)}
                    className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-800 dark:bg-black dark:text-zinc-50 dark:focus:border-zinc-50"
                  >
                    {connectors.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.connector_type})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="chartTypeSelect" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Choose Chart Type
                </label>
                <select
                  id="chartTypeSelect"
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as WidgetType)}
                  className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-800 dark:bg-black dark:text-zinc-50 dark:focus:border-zinc-50"
                >
                  {CHART_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {error && <p className="text-xs text-red-600 dark:text-red-400 font-semibold">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || (mode === "manual" && connectors.length === 0)}
            className="mt-2 flex h-10 w-full items-center justify-center rounded-full bg-foreground px-5 text-xs font-semibold text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
          >
            {isSubmitting ? "Creating Widget..." : "Create Widget"}
          </button>
        </form>
      </div>
    </div>
  );
}
