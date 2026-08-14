"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ChartContainer from "./ChartContainer";

interface LineChartWidgetProps {
  data?: any[];
  isLoading?: boolean;
  error?: string;
  sql?: string;
}

export default function LineChartWidget({ data = [], isLoading, error, sql }: LineChartWidgetProps) {
  const hasData = data && data.length > 0;
  
  // Extract keys dynamically
  let xKey = "name";
  let yKeys = ["value"];
  
  if (hasData) {
    const first = data[0];
    const keys = Object.keys(first);
    const numericKeys = keys.filter(
      (k) => typeof first[k] === "number" && k !== "id" && k !== "x" && k !== "zScore"
    );
    const stringKey = keys.find(
      (k) => typeof first[k] === "string" && k !== "id" && k !== "name"
    ) || keys.find((k) => k === "name" || k === "month" || k === "date" || k === "label");
    
    if (stringKey) xKey = stringKey;
    if (numericKeys.length > 0) yKeys = numericKeys;
  }

  // Predefined gorgeous colors for lines
  const colors = ["#3b82f6", "#10b981", "#ef4444", "#f59e0b", "#8b5cf6", "#ec4899"];

  return (
    <ChartContainer title="Line Chart" isLoading={isLoading} error={error} isEmpty={!hasData} sql={sql}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
          <XAxis
            dataKey={xKey}
            className="text-[10px] fill-zinc-500 dark:fill-zinc-400 font-sans"
            tickLine={false}
            dy={10}
          />
          <YAxis
            className="text-[10px] fill-zinc-500 dark:fill-zinc-400 font-sans"
            tickLine={false}
            dx={-5}
          />
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
            verticalAlign="top"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: "11px", fontFamily: "sans-serif" }}
          />
          {yKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              activeDot={{ r: 6 }}
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
