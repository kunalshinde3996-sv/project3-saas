"use client";

import React, { useState } from "react";
import { Widget } from "@/types";
import { useDashboard } from "./DashboardContext";
import {
  MoreVertical,
  RefreshCw,
  Maximize2,
  Minimize2,
  Trash2,
  Copy,
  Edit3,
  Check,
  X,
  Sparkles,
} from "lucide-react";

interface WidgetContainerProps {
  widget: Widget;
  children: React.ReactNode;
}

export default function WidgetContainer({ widget, children }: WidgetContainerProps) {
  const {
    deleteWidget,
    duplicateWidget,
    renameWidget,
    refreshWidget,
    activeFullscreenId,
    setActiveFullscreenId,
  } = useDashboard();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(widget.title);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isFullscreen = activeFullscreenId === widget.id;

  function handleSaveTitle() {
    if (editedTitle.trim()) {
      renameWidget(widget.id, editedTitle.trim());
      setIsEditingTitle(false);
    }
  }

  function handleCancelTitle() {
    setEditedTitle(widget.title);
    setIsEditingTitle(false);
  }

  return (
    <div
      className={`flex flex-col rounded-xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950 transition-all ${
        isFullscreen
          ? "fixed inset-4 z-50 m-0 h-[calc(100vh-32px)] w-[calc(100vw-32px)] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md shadow-2xl"
          : "h-full w-full relative"
      }`}
    >
      {/* Widget Header */}
      <div className="flex h-11 items-center justify-between border-b border-zinc-100 px-4 py-2 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-t-xl select-none">
        <div className="flex flex-1 items-center gap-2 min-w-0">
          {widget.query && (
            <span title="AI Generated" className="shrink-0 flex items-center">
              <Sparkles className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
            </span>
          )}
          
          {isEditingTitle ? (
            <div className="flex items-center gap-1 w-full max-w-[80%]">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full rounded border border-zinc-300 bg-white px-2 py-0.5 text-xs text-black outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-black dark:text-zinc-50 dark:focus:border-zinc-50 font-medium"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTitle();
                  if (e.key === "Escape") handleCancelTitle();
                }}
              />
              <button onClick={handleSaveTitle} className="text-green-600 dark:text-green-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 p-0.5 rounded">
                <Check className="h-3 w-3" />
              </button>
              <button onClick={handleCancelTitle} className="text-red-600 dark:text-red-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 p-0.5 rounded">
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col min-w-0">
              <span className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                {widget.title}
              </span>
              {widget.query && (
                <span className="truncate text-[9px] text-zinc-500 dark:text-zinc-400 font-mono italic">
                  &quot;{widget.query}&quot;
                </span>
              )}
            </div>
          )}
        </div>

        {/* Toolbar & Menu Controls */}
        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          <button
            onClick={() => refreshWidget(widget.id)}
            className="rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${widget.isLoading ? "animate-spin" : ""}`} />
          </button>
          
          <button
            onClick={() => setActiveFullscreenId(isFullscreen ? null : widget.id)}
            className="rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>

          {/* Popover Menu Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
            
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-32 origin-top-right rounded-md border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 z-20">
                  <button
                    onClick={() => {
                      setIsEditingTitle(true);
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Edit3 className="h-3 w-3" />
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      duplicateWidget(widget.id);
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Copy className="h-3 w-3" />
                    Duplicate
                  </button>
                  <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                  <button
                    onClick={() => {
                      deleteWidget(widget.id);
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors font-medium"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Widget Content Body */}
      <div className="flex-1 min-h-0 min-w-0 p-4">
        {children}
      </div>
    </div>
  );
}
