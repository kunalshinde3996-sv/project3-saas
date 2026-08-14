"use client";

import React from "react";
import {
  FunnelChart,
  Funnel,
  LabelList,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ChartContainer from "./ChartContainer";

interface FunnelChartWidgetProps {
  data?: any[];
  isLoading?: boolean;
  error?: string;
  sql?: string;
}

export default function FunnelChartWidget({ data = [], isLoading, error, sql }: FunnelChartWidgetProps) {
  const hasData = data && data.length > 0;
  
  // Extract keys dynamically
  let nameKey = "name";
  let valueKey = "value";

  if (hasData) {
    const first = data[0];
    const keys = Object.keys(first);
    const numKey = keys.find((k) => typeof first[k] === "number" && k !== "id" && k !== "zScore");
    const strKey = keys.find((k) => typeof first[k] === "string" && k !== "id") || keys.find((k) => k === "name" || k === "month" || k === "date" || k === "label");
    
    if (strKey) nameKey = strKey;
    if (numKey) valueKey = numKey;
  }

  // Sort data descending by value for true funnel shapes
  const sortedData = [...data].sort((a, b) => (b[valueKey] || 0) - (a[valueKey] || 0));

  return (
    <ChartContainer title="Funnel Chart" isLoading={isLoading} error={error} isEmpty={!hasData} sql={sql}>
      <ResponsiveContainer width="100%" height="100%">
        <FunnelChart margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(9, 9, 11, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "12px",
            }}
          />
          <Funnel
            data={sortedData}
            dataKey={valueKey}
            nameKey={nameKey}
            isAnimationActive
          >
            <LabelList
              position="right"
              fill="#71717a"
              stroke="none"
              dataKey={nameKey}
              style={{ fontSize: "11px", fontFamily: "sans-serif" }}
            />
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
