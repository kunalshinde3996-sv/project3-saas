"use client";

import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import ChartContainer from "./ChartContainer";

interface HeatmapWidgetProps {
  data?: any[];
  isLoading?: boolean;
  error?: string;
  sql?: string;
}

export default function HeatmapWidget({ data = [], isLoading, error, sql }: HeatmapWidgetProps) {
  const hasData = data && data.length > 0;
  
  // Extract coordinate keys dynamically
  let xKey = "x";
  let yKey = "y";
  let valueKey = "value";

  if (hasData) {
    const first = data[0];
    const keys = Object.keys(first);
    
    // Find keys mapping to categories vs numbers
    const numKeys = keys.filter((k) => typeof first[k] === "number" && k !== "id" && k !== "zScore");
    const strKeys = keys.filter((k) => typeof first[k] === "string" && k !== "id");
    
    if (strKeys.length >= 2) {
      xKey = strKeys[0];
      yKey = strKeys[1];
    } else if (strKeys.length === 1 && numKeys.length >= 1) {
      xKey = strKeys[0];
      yKey = numKeys.length > 1 ? String(numKeys[0]) : "y";
    }
    
    if (numKeys.length > 0) {
      valueKey = numKeys[numKeys.length - 1];
    }
  }

  // Get max value for opacity calculations
  const maxVal = hasData ? Math.max(...data.map((d) => d[valueKey] || 1)) : 1;

  // Custom tooltips
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-zinc-950 text-white p-2 text-xs border border-zinc-800 rounded shadow-md">
          <p className="font-semibold">{`${xKey}: ${item[xKey]}`}</p>
          <p>{`${yKey}: ${item[yKey]}`}</p>
          <p className="text-blue-400 font-bold">{`${valueKey}: ${item[valueKey]}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer title="Heatmap" isLoading={isLoading} error={error} isEmpty={!hasData} sql={sql}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
          <XAxis
            type="category"
            dataKey={xKey}
            name={xKey}
            className="text-[10px] fill-zinc-500 dark:fill-zinc-400 font-sans"
            tickLine={false}
            allowDuplicatedCategory={false}
          />
          <YAxis
            type="category"
            dataKey={yKey}
            name={yKey}
            className="text-[10px] fill-zinc-500 dark:fill-zinc-400 font-sans"
            tickLine={false}
            allowDuplicatedCategory={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter data={data} shape="square">
            {data.map((entry, index) => {
              const val = entry[valueKey] || 0;
              const ratio = maxVal > 0 ? val / maxVal : 0;
              
              // Calculate responsive opacity and color
              const isAnomaly = entry.isOutlier === true;
              const color = isAnomaly ? "#f97316" : "#3b82f6";
              const opacity = Math.max(0.15, ratio);

              return (
                <Cell
                  key={`cell-${index}`}
                  fill={color}
                  fillOpacity={opacity}
                  stroke={color}
                  strokeWidth={0.5}
                />
              );
            })}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
