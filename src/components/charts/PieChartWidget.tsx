"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ChartContainer from "./ChartContainer";

interface PieChartWidgetProps {
  data?: any[];
  isLoading?: boolean;
  error?: string;
  sql?: string;
}

export default function PieChartWidget({ data = [], isLoading, error, sql }: PieChartWidgetProps) {
  const hasData = data && data.length > 0;
  
  // Extract keys dynamically
  let nameKey = "name";
  let valueKey = "value";

  if (hasData) {
    const first = data[0];
    const keys = Object.keys(first);
    
    const numericKey = keys.find((k) => typeof first[k] === "number" && k !== "id" && k !== "zScore");
    const stringKey = keys.find((k) => typeof first[k] === "string" && k !== "id") || keys.find((k) => k === "name" || k === "month" || k === "date" || k === "label");
    
    if (stringKey) nameKey = stringKey;
    if (numericKey) valueKey = numericKey;
  }

  // A vibrant, premium categorical palette
  const colors = ["#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4"];

  return (
    <ChartContainer title="Pie Chart" isLoading={isLoading} error={error} isEmpty={!hasData} sql={sql}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(9, 9, 11, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "12px",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: "11px", fontFamily: "sans-serif" }}
          />
          <Pie
            data={data}
            nameKey={nameKey}
            dataKey={valueKey}
            cx="50%"
            cy="45%"
            innerRadius="55%"
            outerRadius="75%"
            paddingAngle={3}
            label={({ name, percent = 0 }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
