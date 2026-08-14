"use client";

import React from "react";
import { WidgetType } from "@/types";
import LineChartWidget from "../charts/LineChartWidget";
import BarChartWidget from "../charts/BarChartWidget";
import PieChartWidget from "../charts/PieChartWidget";
import ScatterPlotWidget from "../charts/ScatterPlotWidget";
import HeatmapWidget from "../charts/HeatmapWidget";
import FunnelChartWidget from "../charts/FunnelChartWidget";

interface AIChartRendererProps {
  type: WidgetType;
  data?: any[];
  isLoading?: boolean;
  error?: string;
  sql?: string;
}

export default function AIChartRenderer({
  type,
  data = [],
  isLoading,
  error,
  sql,
}: AIChartRendererProps) {
  // If loading or error, let the child chart container handle it,
  // we default to LineChartWidget or similar to render the container wrapper.
  if (isLoading || error || !data || data.length === 0) {
    return <LineChartWidget data={data} isLoading={isLoading} error={error} sql={sql} />;
  }

  const normalizedType = type.toLowerCase() as WidgetType;

  switch (normalizedType) {
    case "line":
      return <LineChartWidget data={data} sql={sql} />;
    case "bar":
      return <BarChartWidget data={data} sql={sql} />;
    case "pie":
      return <PieChartWidget data={data} sql={sql} />;
    case "scatter":
      return <ScatterPlotWidget data={data} sql={sql} />;
    case "heatmap":
      return <HeatmapWidget data={data} sql={sql} />;
    case "funnel":
      return <FunnelChartWidget data={data} sql={sql} />;
    case "table":
    default:
      return <TableRenderer data={data} sql={sql} />;
  }
}

// Fallback Premium Table Renderer
function TableRenderer({ data = [], sql }: { data: any[]; sql?: string }) {
  const columns = Object.keys(data[0] || {}).filter((k) => k !== "id" && k !== "zScore" && k !== "isOutlier");
  
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white dark:bg-zinc-950 font-sans">
      <div className="flex-1 overflow-auto border border-zinc-200 dark:border-zinc-800 rounded-lg">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-3 py-2 uppercase tracking-wider">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {data.map((row, index) => {
              const isAnomaly = row.isOutlier === true;
              return (
                <tr
                  key={index}
                  className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors ${
                    isAnomaly ? "bg-orange-50/50 dark:bg-orange-950/20" : ""
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col}
                      className={`px-3 py-2 font-medium ${
                        isAnomaly && col === "value"
                          ? "text-orange-600 dark:text-orange-400 font-bold"
                          : "text-zinc-800 dark:text-zinc-200"
                      }`}
                    >
                      {typeof row[col] === "object" ? JSON.stringify(row[col]) : String(row[col])}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {sql && (
        <details className="mt-2 border border-zinc-200 bg-zinc-50 px-2 py-1 text-[10px] rounded dark:border-zinc-800 dark:bg-zinc-900">
          <summary className="cursor-pointer font-mono font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200">
            Show SQL
          </summary>
          <pre className="mt-1 max-h-20 overflow-auto whitespace-pre-wrap font-mono text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-950 p-1.5 rounded border border-zinc-200 dark:border-zinc-800">
            {sql}
          </pre>
        </details>
      )}
    </div>
  );
}
