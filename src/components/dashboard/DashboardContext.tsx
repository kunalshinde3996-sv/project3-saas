"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Widget, WidgetLayout, DashboardFilters, WidgetType } from "@/types";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface DashboardContextType {
  widgets: Widget[];
  layouts: WidgetLayout[];
  filters: DashboardFilters;
  isLoading: boolean;
  activeFullscreenId: string | null;
  setWidgets: React.Dispatch<React.SetStateAction<Widget[]>>;
  setLayouts: (newLayouts: WidgetLayout[]) => void;
  setFilters: React.Dispatch<React.SetStateAction<DashboardFilters>>;
  setIsLoading: (loading: boolean) => void;
  setActiveFullscreenId: (id: string | null) => void;
  addWidget: (title: string, type: WidgetType, connectorId?: string, queryText?: string) => Promise<void>;
  deleteWidget: (id: string) => void;
  duplicateWidget: (id: string) => void;
  renameWidget: (id: string, newTitle: string) => void;
  refreshWidget: (id: string) => Promise<void>;
  saveLayout: () => void;
  resetToDefault: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Sample Mock Data Generator for Fallbacks
// Sample Mock Data Generator for Fallbacks
export function getMockQueryResponse(question: string): { chart_type: WidgetType; data: any[]; sql: string } {
  const lowercaseQuestion = question.toLowerCase();

  // Define explicit chart type mapping (Highest Priority)
  const explicitKeywords: { type: WidgetType; keywords: string[] }[] = [
    { type: "heatmap", keywords: ["heatmap", "matrix", "density"] },
    { type: "funnel", keywords: ["funnel"] },
    { type: "scatter", keywords: ["scatter", "correlation"] },
    { type: "pie", keywords: ["pie"] },
    { type: "bar", keywords: ["bar"] },
    { type: "line", keywords: ["line"] },
  ];

  // Define generic business mapping (Lower Priority)
  const genericKeywords: { type: WidgetType; keywords: string[] }[] = [
    { type: "line", keywords: ["sale", "revenue", "mrr", "expenses", "expense", "trend"] },
    { type: "bar", keywords: ["user", "signup", "register", "active", "performance"] },
    { type: "funnel", keywords: ["conversion", "stage", "pipeline"] },
    { type: "pie", keywords: ["region", "country", "category", "territory", "breakdown"] },
    { type: "scatter", keywords: ["outlier", "distribution"] },
    { type: "heatmap", keywords: ["hour", "activity"] },
  ];

  let matchedType: WidgetType | null = null;

  // 1. Check explicit chart types first
  for (const group of explicitKeywords) {
    if (group.keywords.some((kw) => lowercaseQuestion.includes(kw))) {
      matchedType = group.type;
      break;
    }
  }

  // 2. Check generic business keywords if no explicit match
  if (!matchedType) {
    for (const group of genericKeywords) {
      if (group.keywords.some((kw) => lowercaseQuestion.includes(kw))) {
        matchedType = group.type;
        break;
      }
    }
  }

  // 3. Default fallback
  const resolvedType = matchedType || "bar";

  // Return the original mock data payloads based on resolvedType
  if (resolvedType === "line") {
    return {
      chart_type: "line",
      sql: "SELECT DATE_TRUNC('month', created_at) AS month, SUM(amount) AS revenue FROM sales GROUP BY 1 ORDER BY 1;",
      data: [
        { month: "Jan", revenue: 42000, expenses: 31000 },
        { month: "Feb", revenue: 48000, expenses: 32000 },
        { month: "Mar", revenue: 51000, expenses: 35000 },
        { month: "Apr", revenue: 55000, expenses: 40000 },
        { month: "May", revenue: 64000, expenses: 41000 },
        { month: "Jun", revenue: 78000, expenses: 45000 },
        { month: "Jul", revenue: 72000, expenses: 46000 },
        { month: "Aug", revenue: 85000, expenses: 49000 },
      ],
    };
  } else if (resolvedType === "bar") {
    const isUserQuery =
      genericKeywords.find((g) => g.type === "bar")?.keywords.some((kw) => lowercaseQuestion.includes(kw)) ||
      explicitKeywords.find((e) => e.type === "bar")?.keywords.some((kw) => lowercaseQuestion.includes(kw));

    if (isUserQuery) {
      return {
        chart_type: "bar",
        sql: "SELECT DATE_TRUNC('day', created_at) AS date, COUNT(*) AS signups FROM users GROUP BY 1 ORDER BY 1;",
        data: [
          { name: "Mon", signups: 140, active: 80 },
          { name: "Tue", signups: 220, active: 110 },
          { name: "Wed", signups: 310, active: 190 },
          { name: "Thu", signups: 280, active: 200 },
          { name: "Fri", signups: 450, active: 310 },
          { name: "Sat", signups: 190, active: 120 },
          { name: "Sun", signups: 150, active: 90 },
        ],
      };
    } else {
      return {
        chart_type: "bar",
        sql: "SELECT item_name, quantity FROM inventory LIMIT 5;",
        data: [
          { name: "Item A", value: 400 },
          { name: "Item B", value: 300 },
          { name: "Item C", value: 200 },
          { name: "Item D", value: 500 },
          { name: "Item E", value: 180 },
        ],
      };
    }
  } else if (resolvedType === "funnel") {
    return {
      chart_type: "funnel",
      sql: "SELECT stage, COUNT(*) AS count FROM user_pipeline GROUP BY stage;",
      data: [
        { name: "Homepage Views", value: 12000, fill: "#8884d8" },
        { name: "Downloads", value: 6500, fill: "#8dd1e1" },
        { name: "Signups", value: 3200, fill: "#82ca9d" },
        { name: "Paid Upgrades", value: 800, fill: "#a4de6c" },
        { name: "Referrals", value: 200, fill: "#d0ed57" },
      ],
    };
  } else if (resolvedType === "pie") {
    return {
      chart_type: "pie",
      sql: "SELECT category, COUNT(*) AS count FROM products GROUP BY category;",
      data: [
        { name: "North America", value: 45 },
        { name: "Europe", value: 30 },
        { name: "Asia-Pacific", value: 15 },
        { name: "Latin America", value: 7 },
        { name: "Africa", value: 3 },
      ],
    };
  } else if (resolvedType === "scatter") {
    return {
      chart_type: "scatter",
      sql: "SELECT ads_spent, sales_generated FROM campaigns;",
      data: [
        { x: 100, y: 200, name: "C1" },
        { x: 120, y: 220, name: "C2" },
        { x: 170, y: 300, name: "C3" },
        { x: 140, y: 240, name: "C4" },
        { x: 250, y: 410, name: "C5" },
        { x: 90,  y: 190, name: "C6" },
        { x: 300, y: 920, name: "Outlier High" },
        { x: 280, y: 460, name: "C7" },
        { x: 150, y: 110, name: "Outlier Low" },
      ],
    };
  } else {
    return {
      chart_type: "heatmap",
      sql: "SELECT day_of_week, hour, activity_score FROM server_logs;",
      data: [
        { x: "Mon", y: "00:00", value: 12 }, { x: "Mon", y: "06:00", value: 24 }, { x: "Mon", y: "12:00", value: 85 }, { x: "Mon", y: "18:00", value: 64 },
        { x: "Tue", y: "00:00", value: 18 }, { x: "Tue", y: "06:00", value: 31 }, { x: "Tue", y: "12:00", value: 92 }, { x: "Tue", y: "18:00", value: 55 },
        { x: "Wed", y: "00:00", value: 15 }, { x: "Wed", y: "06:00", value: 29 }, { x: "Wed", y: "12:00", value: 88 }, { x: "Wed", y: "18:00", value: 70 },
        { x: "Thu", y: "00:00", value: 10 }, { x: "Thu", y: "06:00", value: 22 }, { x: "Thu", y: "12:00", value: 95 }, { x: "Thu", y: "18:00", value: 58 },
        { x: "Fri", y: "00:00", value: 22 }, { x: "Fri", y: "06:00", value: 45 }, { x: "Fri", y: "12:00", value: 150 }, { x: "Fri", y: "18:00", value: 110 },
        { x: "Sat", y: "00:00", value: 45 }, { x: "Sat", y: "06:00", value: 12 }, { x: "Sat", y: "12:00", value: 30 }, { x: "Sat", y: "18:00", value: 25 },
        { x: "Sun", y: "00:00", value: 30 }, { x: "Sun", y: "06:00", value: 8 },  { x: "Sun", y: "12:00", value: 20 }, { x: "Sun", y: "18:00", value: 18 },
      ],
    };
  }
}

// Outlier Highlighter Utility using Z-score
export function calculateZScoresAndTagOutliers(data: any[], valueKey: string = "value"): any[] {
  if (!data || data.length < 3) return data;
  const values = data.map(item => item[valueKey]).filter(val => typeof val === "number") as number[];
  if (values.length === 0) return data;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  if (stdDev === 0) return data;
  
  return data.map(item => {
    const val = item[valueKey];
    if (typeof val === "number") {
      const zScore = (val - mean) / stdDev;
      // standard z-score threshold is usually 2 or 3, let's use 1.5 to capture interesting highlights easily in small datasets
      if (Math.abs(zScore) >= 1.5) {
        return { ...item, isOutlier: true, zScore };
      }
    }
    return item;
  });
}

const DEFAULT_WIDGETS: Widget[] = [
  {
    id: "w1",
    title: "Monthly Active Users & Expenses (Mock)",
    type: "line",
    query: "monthly active users and corporate expenses trend",
    data: getMockQueryResponse("monthly active users trend").data,
    sql: getMockQueryResponse("monthly active users trend").sql,
  },
  {
    id: "w2",
    title: "Weekly Registrations & Performance (Mock)",
    type: "bar",
    query: "weekly signups metrics showing potential outliers",
    data: getMockQueryResponse("weekly signups metrics").data,
    sql: getMockQueryResponse("weekly signups metrics").sql,
  },
  {
    id: "w3",
    title: "Global Distribution of Clients (Mock)",
    type: "pie",
    query: "breakdown of clients by regional territory",
    data: getMockQueryResponse("regional breakdown").data,
    sql: getMockQueryResponse("regional breakdown").sql,
  },
];

const DEFAULT_LAYOUTS: WidgetLayout[] = [
  { i: "w1", x: 0, y: 0, w: 6, h: 4, minW: 3, minH: 3 },
  { i: "w2", x: 6, y: 0, w: 6, h: 4, minW: 3, minH: 3 },
  { i: "w3", x: 0, y: 4, w: 6, h: 4, minW: 3, minH: 3 },
];

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [layouts, setLayoutsState] = useState<WidgetLayout[]>([]);
  const [filters, setFilters] = useState<DashboardFilters>({ search: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [activeFullscreenId, setActiveFullscreenId] = useState<string | null>(null);
  
  const [userMetadata, setUserMetadata] = useState<{ userId: string; orgId: string } | null>(null);

  // Load layout from localStorage scoped by User ID and Organization ID
  useEffect(() => {
    let isMounted = true;
    async function initUserAndLoad() {
      try {
        const [meRes, orgRes] = await Promise.all([
          api.get("/api/auth/me"),
          api.get("/api/org/me"),
        ]);
        
        const userId = meRes.data?.id;
        const orgId = orgRes.data?.id;
        
        if (userId && orgId) {
          if (isMounted) {
            setUserMetadata({ userId, orgId });
            
            const storageKey = `dashboard_layout_${orgId}_${userId}`;
            const storedString = localStorage.getItem(storageKey);
            if (storedString) {
              const { widgets: storedWidgets, layouts: storedLayouts } = JSON.parse(storedString);
              setWidgets(storedWidgets);
              setLayoutsState(storedLayouts);
            } else {
              setWidgets(DEFAULT_WIDGETS);
              setLayoutsState(DEFAULT_LAYOUTS);
            }
          }
        }
      } catch {
        // Fallback to default mock setup if token missing or backend not authenticated
        if (isMounted) {
          setWidgets(DEFAULT_WIDGETS);
          setLayoutsState(DEFAULT_LAYOUTS);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    
    initUserAndLoad();
    
    return () => {
      isMounted = false;
    };
  }, []);

  function saveLayout() {
    if (!userMetadata) return;
    const { userId, orgId } = userMetadata;
    const storageKey = `dashboard_layout_${orgId}_${userId}`;
    localStorage.setItem(storageKey, JSON.stringify({ widgets, layouts }));
  }

  function setLayouts(newLayouts: WidgetLayout[]) {
    setLayoutsState(newLayouts);
  }

  // Trigger autosave when widgets list or layout coords change
  useEffect(() => {
    if (userMetadata && widgets.length > 0) {
      const { userId, orgId } = userMetadata;
      const storageKey = `dashboard_layout_${orgId}_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify({ widgets, layouts }));
    }
  }, [widgets, layouts, userMetadata]);

  function resetToDefault() {
    setWidgets(DEFAULT_WIDGETS);
    setLayoutsState(DEFAULT_LAYOUTS);
  }

  async function addWidget(title: string, type: WidgetType, connectorId?: string, queryText?: string) {
    const id = `w_${Date.now()}`;
    const newWidget: Widget = {
      id,
      title,
      type,
      connector_id: connectorId,
      query: queryText,
      isLoading: true,
    };

    // Calculate layout coordinates for new widget
    const nextY = layouts.length > 0 ? Math.max(...layouts.map(l => l.y + l.h)) : 0;
    const newLayoutItem: WidgetLayout = {
      i: id,
      x: 0,
      y: nextY,
      w: 6,
      h: 4,
      minW: 3,
      minH: 3,
    };

    setWidgets(prev => [...prev, newWidget]);
    setLayoutsState(prev => [...prev, newLayoutItem]);

    // Perform query fetch or load connector data
    try {
      if (queryText) {
        // AI Query route
        try {
          const response = await api.post("/api/query", {
            question: queryText,
            org_id: userMetadata?.orgId || "",
          });
          const { chart_type, data, sql } = response.data;
          
          let parsedData = data;
          if (chart_type === "scatter") {
            parsedData = calculateZScoresAndTagOutliers(data, "y");
          } else if (chart_type === "line" || chart_type === "bar") {
            parsedData = calculateZScoresAndTagOutliers(data, "value");
          }

          setWidgets(prev => prev.map(w => w.id === id ? {
            ...w,
            type: chart_type || type,
            data: parsedData,
            sql,
            isLoading: false,
          } : w));
        } catch {
          // Graceful fallback to mock query data
          const response = getMockQueryResponse(queryText);
          let parsedData = response.data;
          if (response.chart_type === "scatter") {
            parsedData = calculateZScoresAndTagOutliers(response.data, "y");
          } else if (response.chart_type === "line" || response.chart_type === "bar") {
            parsedData = calculateZScoresAndTagOutliers(response.data, "value");
          }

          setWidgets(prev => prev.map(w => w.id === id ? {
            ...w,
            type: response.chart_type || type,
            data: parsedData,
            sql: response.sql,
            isLoading: false,
          } : w));
        }
      } else if (connectorId) {
        // Load data records from standard connector
        const response = await api.get(`/api/data/${connectorId}/records?limit=100`);
        const records = response.data || [];
        
        // Parse database rows to format readable by Recharts
        const chartData = records.map((record: any) => record.data);

        setWidgets(prev => prev.map(w => w.id === id ? {
          ...w,
          data: chartData,
          isLoading: false,
        } : w));
      } else {
        // General fallback template empty values
        setWidgets(prev => prev.map(w => w.id === id ? {
          ...w,
          data: [],
          isLoading: false,
        } : w));
      }
    } catch (err: any) {
      setWidgets(prev => prev.map(w => w.id === id ? {
        ...w,
        error: err.message || "Failed to load widget data",
        isLoading: false,
      } : w));
    }
  }

  function deleteWidget(id: string) {
    setWidgets(prev => prev.filter(w => w.id !== id));
    setLayoutsState(prev => prev.filter(l => l.i !== id));
  }

  function duplicateWidget(id: string) {
    const target = widgets.find(w => w.id === id);
    if (!target) return;
    
    const newId = `w_${Date.now()}`;
    const duplicate: Widget = {
      ...target,
      id: newId,
      title: `${target.title} (Copy)`,
    };

    const targetLayout = layouts.find(l => l.i === id);
    const nextY = layouts.length > 0 ? Math.max(...layouts.map(l => l.y + l.h)) : 0;
    
    const duplicateLayout: WidgetLayout = targetLayout ? {
      ...targetLayout,
      i: newId,
      x: (targetLayout.x + 2) % 12,
      y: targetLayout.y + targetLayout.h <= nextY ? targetLayout.y : nextY,
    } : {
      i: newId,
      x: 0,
      y: nextY,
      w: 6,
      h: 4,
      minW: 3,
      minH: 3,
    };

    setWidgets(prev => [...prev, duplicate]);
    setLayoutsState(prev => [...prev, duplicateLayout]);
  }

  function renameWidget(id: string, newTitle: string) {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, title: newTitle } : w));
  }

  async function refreshWidget(id: string) {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, isLoading: true, error: undefined } : w));
    const target = widgets.find(w => w.id === id);
    if (!target) return;

    try {
      if (target.query) {
        try {
          const response = await api.post("/api/query", {
            question: target.query,
            org_id: userMetadata?.orgId || "",
          });
          const { data } = response.data;
          setWidgets(prev => prev.map(w => w.id === id ? { ...w, data, isLoading: false } : w));
        } catch {
          const response = getMockQueryResponse(target.query);
          setWidgets(prev => prev.map(w => w.id === id ? { ...w, data: response.data, isLoading: false } : w));
        }
      } else if (target.connector_id) {
        const response = await api.get(`/api/data/${target.connector_id}/records?limit=100`);
        const records = response.data || [];
        const chartData = records.map((record: any) => record.data);
        setWidgets(prev => prev.map(w => w.id === id ? { ...w, data: chartData, isLoading: false } : w));
      } else {
        setWidgets(prev => prev.map(w => w.id === id ? { ...w, isLoading: false } : w));
      }
    } catch (err: any) {
      setWidgets(prev => prev.map(w => w.id === id ? { ...w, error: err.message || "Refresh failed", isLoading: false } : w));
    }
  }

  return (
    <DashboardContext.Provider
      value={{
        widgets,
        layouts,
        filters,
        isLoading,
        activeFullscreenId,
        setWidgets,
        setLayouts,
        setFilters,
        setIsLoading,
        setActiveFullscreenId,
        addWidget,
        deleteWidget,
        duplicateWidget,
        renameWidget,
        refreshWidget,
        saveLayout,
        resetToDefault,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
