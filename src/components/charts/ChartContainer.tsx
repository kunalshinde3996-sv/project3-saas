"use client";

import React, { ReactNode } from "react";
import { AlertCircle, Loader2, Inbox } from "lucide-react";

interface ChartContainerProps {
  title?: string;
  isLoading?: boolean;
  error?: string;
  isEmpty?: boolean;
  sql?: string;
  children: ReactNode;
}

export default function ChartContainer({
  title,
  isLoading,
  error,
  isEmpty,
  sql,
  children,
}: ChartContainerProps) {
  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-white p-6 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500 dark:text-zinc-400" />
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-white p-6 dark:bg-zinc-950">
        <AlertCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
        <p className="mt-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">Failed to render chart</p>
        <p className="mt-1 text-center text-xs text-red-600 dark:text-red-400 max-w-xs line-clamp-3">
          {error}
        </p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-white p-6 dark:bg-zinc-950">
        <Inbox className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
        <p className="mt-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">No data found</p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 text-center max-w-xs">
          This query returned zero records. Upload a CSV file or modify your SQL query.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col bg-white dark:bg-zinc-950">
      <div className="flex-1 w-full h-full min-h-0 min-w-0">
        {children}
      </div>
      
      {sql && (
        <details className="absolute bottom-2 left-2 z-10 max-w-[90%] border border-zinc-200 bg-zinc-50 px-2 py-1 text-[10px] rounded dark:border-zinc-800 dark:bg-zinc-900">
          <summary className="cursor-pointer font-mono font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200">
            Show SQL
          </summary>
          <pre className="mt-1 max-h-24 overflow-auto whitespace-pre-wrap font-mono text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-950 p-1.5 rounded border border-zinc-200 dark:border-zinc-800">
            {sql}
          </pre>
        </details>
      )}
    </div>
  );
}
