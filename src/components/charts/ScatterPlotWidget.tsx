"use client";

import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Label,
} from "recharts";
import ChartContainer from "./ChartContainer";

interface ScatterPlotWidgetProps {
  data?: any[];
  isLoading?: boolean;
  error?: string;
  sql?: string;
}

export default function ScatterPlotWidget({ data = [], isLoading, error, sql }: ScatterPlotWidgetProps) {
  const hasData = data && data.length > 0;
  
  // Extract coordinate keys dynamically
  let xKey = "x";
  let yKey = "y";
  let nameKey = "name";

  if (hasData) {
    const first = data[0];
    const keys = Object.keys(first);
    
    // Find numeric columns
    const numericKeys = keys.filter((k) => typeof first[k] === "number" && k !== "id" && k !== "zScore");
    if (numericKeys.length >= 2) {
      xKey = numericKeys[0];
      yKey = numericKeys[1];
    } else if (numericKeys.length === 1) {
      yKey = numericKeys[0];
    }
    
    const stringKey = keys.find((k) => typeof first[k] === "string" && k !== "id");
    if (stringKey) nameKey = stringKey;
  }

  const baseColor = "#3b82f6";
  const outlierColor = "#ef4444"; // Red for scatter outliers

  return (
    <ChartContainer title="Scatter Plot" isLoading={isLoading} error={error} isEmpty={!hasData} sql={sql}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
          <XAxis
            type="number"
            dataKey={xKey}
            name={xKey}
            className="text-[10px] fill-zinc-500 dark:fill-zinc-400 font-sans"
            tickLine={false}
          >
            <Label value={xKey} offset={-15} position="insideBottom" className="text-[10px] fill-zinc-500" />
          </XAxis>
          <YAxis
            type="number"
            dataKey={yKey}
            name={yKey}
            className="text-[10px] fill-zinc-500 dark:fill-zinc-400 font-sans"
            tickLine={false}
          >
            <Label value={yKey} angle={-90} offset={10} position="insideLeft" className="text-[10px] fill-zinc-500" />
          </YAxis>
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{
              backgroundColor: "rgba(9, 9, 11, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "12px",
            }}
          />
          <Scatter name="Points" data={data} fill={baseColor}>
            {data.map((entry, index) => {
              const isAnomaly = entry.isOutlier === true;
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={isAnomaly ? outlierColor : baseColor}
                  r={isAnomaly ? 8 : 5}
                />
              );
            })}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
