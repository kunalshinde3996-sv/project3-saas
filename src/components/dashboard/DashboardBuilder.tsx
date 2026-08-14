"use client";

import React, { useState } from "react";
import GridLayout, { WidthProvider } from "react-grid-layout/legacy";
import { Plus, Save, RotateCcw, Search, LayoutGrid, Info } from "lucide-react";
import { useDashboard } from "./DashboardContext";
import WidgetContainer from "./WidgetContainer";
import AIChartRenderer from "./AIChartRenderer";
import AddWidgetModal from "./AddWidgetModal";

// Import react-grid-layout styles locally inside this module if needed,
// but we will also declare them globally in globals.css for full browser support.
const ResponsiveGridLayout = WidthProvider(GridLayout);

export default function DashboardBuilder() {
  const {
    widgets,
    layouts,
    setLayouts,
    filters,
    setFilters,
    saveLayout,
    resetToDefault,
    isLoading,
  } = useDashboard();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter widgets dynamically
  const filteredWidgets = widgets.filter((w) =>
    w.title.toLowerCase().includes(filters.search.toLowerCase()) ||
    (w.query && w.query.toLowerCase().includes(filters.search.toLowerCase()))
  );

  // Handle grid layout modification changes
  function handleLayoutChange(currentLayout: any[]) {
    // Map layouts back to our widget layouts state
    const mapped = currentLayout.map((l) => ({
      i: String(l.i),
      x: Number(l.x),
      y: Number(l.y),
      w: Number(l.w),
      h: Number(l.h),
      minW: l.minW ? Number(l.minW) : undefined,
      minH: l.minH ? Number(l.minH) : undefined,
    }));
    setLayouts(mapped);
  }

  // Map layouts to grid-layout standard nodes
  const gridLayout = layouts.filter((l) => widgets.some((w) => w.id === l.i));

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-950 dark:border-zinc-800 dark:border-t-zinc-50" />
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">Restoring dashboard workspace...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Top Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-5 dark:border-zinc-900 bg-zinc-50/20 dark:bg-zinc-950/20 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-zinc-900 p-2 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950 shadow-sm">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">SaaS Analytics Workspace</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Drag, resize, customize, and query metrics using the AI Engine.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-950 w-full max-w-[200px] sm:w-[180px] md:w-[220px]">
            <Search className="mr-2 h-3.5 w-3.5 text-zinc-400 shrink-0" />
            <input
              type="text"
              placeholder="Search widgets..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="w-full bg-transparent text-xs text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-xs font-semibold text-background hover:bg-[#383838] transition-colors shadow-sm dark:hover:bg-[#ccc]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Widget
          </button>

          <button
            onClick={saveLayout}
            className="flex h-9 items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
            title="Save Layout State"
          >
            <Save className="h-3.5 w-3.5" />
            Save Layout
          </button>

          <button
            onClick={resetToDefault}
            className="flex h-9 items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
            title="Reset default view"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      {widgets.length === 0 ? (
        <div className="flex h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <Info className="h-10 w-10 text-zinc-400" />
          <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Empty dashboard</h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
            You don&apos;t have any widgets loaded in your analytics workspace. Add widgets manually or trigger an AI Query to generate one.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-xs font-semibold text-background hover:bg-[#383838] transition-colors dark:hover:bg-[#ccc]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add First Widget
          </button>
        </div>
      ) : (
        <div className="relative min-h-[500px]">
          {/* React Grid Layout workspace */}
          <ResponsiveGridLayout
            className="layout"
            layout={gridLayout as any}
            cols={12}
            rowHeight={80}
            onLayoutChange={handleLayoutChange as any}
            draggableHandle=".select-none" // Use widget headers as dragging anchors
            isDraggable
            isResizable
            resizeHandles={["se"]}
            margin={[16, 16]}
          >
            {filteredWidgets.map((widget) => (
              <div key={widget.id} className="relative overflow-visible group">
                <WidgetContainer widget={widget}>
                  <AIChartRenderer
                    type={widget.type}
                    data={widget.data}
                    isLoading={widget.isLoading}
                    error={widget.error}
                    sql={widget.sql}
                  />
                </WidgetContainer>
              </div>
            ))}
          </ResponsiveGridLayout>
        </div>
      )}

      {/* Add Widget Overlay Modal */}
      <AddWidgetModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
