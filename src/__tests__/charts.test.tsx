import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import LineChartWidget from "../components/charts/LineChartWidget";
import BarChartWidget from "../components/charts/BarChartWidget";
import PieChartWidget from "../components/charts/PieChartWidget";
import ScatterPlotWidget from "../components/charts/ScatterPlotWidget";
import HeatmapWidget from "../components/charts/HeatmapWidget";
import FunnelChartWidget from "../components/charts/FunnelChartWidget";
import AIChartRenderer from "../components/dashboard/AIChartRenderer";

// Mock Recharts ResponsiveContainer to render properly in JSDOM
vi.mock("recharts", async (importOriginal) => {
  const original = await importOriginal<typeof import("recharts")>();
  return {
    ...original,
    ResponsiveContainer: ({ children }: any) => (
      <div style={{ width: 800, height: 600 }}>{children}</div>
    ),
  };
});

const sampleData = [
  { name: "Jan", value: 100 },
  { name: "Feb", value: 200 },
];

describe("Reusable Chart Widgets", () => {
  it("renders Line Chart with data", () => {
    render(<LineChartWidget data={sampleData} sql="SELECT * FROM test" />);
    expect(screen.getByText("Show SQL")).toBeInTheDocument();
  });

  it("handles Line Chart empty data gracefully", () => {
    render(<LineChartWidget data={[]} />);
    expect(screen.getByText("No data found")).toBeInTheDocument();
  });

  it("renders Bar Chart with data", () => {
    render(<BarChartWidget data={sampleData} />);
    expect(screen.queryByText("No data found")).not.toBeInTheDocument();
  });

  it("handles Bar Chart empty data gracefully", () => {
    render(<BarChartWidget data={[]} />);
    expect(screen.getByText("No data found")).toBeInTheDocument();
  });

  it("renders Pie Chart with data", () => {
    render(<PieChartWidget data={sampleData} />);
    expect(screen.queryByText("No data found")).not.toBeInTheDocument();
  });

  it("renders Scatter Plot with data", () => {
    const scatterData = [{ x: 10, y: 20 }, { x: 30, y: 40 }];
    render(<ScatterPlotWidget data={scatterData} />);
    expect(screen.queryByText("No data found")).not.toBeInTheDocument();
  });

  it("renders Heatmap with data", () => {
    const heatmapData = [{ x: "A", y: "B", value: 10 }];
    render(<HeatmapWidget data={heatmapData} />);
    expect(screen.queryByText("No data found")).not.toBeInTheDocument();
  });

  it("renders Funnel Chart with data", () => {
    render(<FunnelChartWidget data={sampleData} />);
    expect(screen.queryByText("No data found")).not.toBeInTheDocument();
  });
});

describe("AI Chart Renderer", () => {
  it("routes to the correct chart dynamically", () => {
    render(<AIChartRenderer type="line" data={sampleData} />);
    expect(screen.queryByText("No data found")).not.toBeInTheDocument();
  });

  it("renders general fallback table when table type specified", () => {
    render(<AIChartRenderer type="table" data={sampleData} />);
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Jan")).toBeInTheDocument();
  });
});
