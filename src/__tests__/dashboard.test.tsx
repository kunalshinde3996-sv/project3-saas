import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { DashboardProvider, useDashboard, getMockQueryResponse } from "../components/dashboard/DashboardContext";

// Mock the API client
vi.mock("@/lib/api", () => {
  return {
    api: {
      get: vi.fn().mockImplementation((url: string) => {
        if (url === "/api/auth/me") {
          return Promise.resolve({ data: { id: "user_123", email: "test@example.com" } });
        }
        if (url === "/api/org/me") {
          return Promise.resolve({ data: { id: "org_123", name: "Test Org" } });
        }
        if (url === "/api/connectors") {
          return Promise.resolve({ data: [] });
        }
        return Promise.resolve({ data: {} });
      }),
      post: vi.fn().mockImplementation(() => Promise.resolve({ data: {} })),
    },
  };
});

// Helper component to access state
function TestComponent() {
  const {
    widgets,
    addWidget,
    deleteWidget,
    duplicateWidget,
    renameWidget,
  } = useDashboard();

  return (
    <div>
      <div data-testid="widgets-count">{widgets.length}</div>
      <div data-testid="widgets-list">
        {widgets.map(w => (
          <div key={w.id} data-testid={`widget-${w.id}`}>
            <span data-testid={`widget-title-${w.id}`}>{w.title}</span>
            <button
              data-testid={`delete-${w.id}`}
              onClick={() => deleteWidget(w.id)}
            >
              Delete
            </button>
            <button
              data-testid={`duplicate-${w.id}`}
              onClick={() => duplicateWidget(w.id)}
            >
              Duplicate
            </button>
            <button
              data-testid={`rename-${w.id}`}
              onClick={() => renameWidget(w.id, "New Named Widget")}
            >
              Rename
            </button>
          </div>
        ))}
      </div>
      <button
        data-testid="add-btn"
        onClick={() => addWidget("Test Line Widget", "line", undefined, "weekly user metrics")}
      >
        Add Widget
      </button>
    </div>
  );
}

describe("Dashboard State & Context Actions", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loads default widgets and adds new widgets", async () => {
    render(
      <DashboardProvider>
        <TestComponent />
      </DashboardProvider>
    );

    // Initial state is empty loading, but useEffect loads DEFAULT_WIDGETS (count = 3)
    // Wait for the async useEffect loading to complete
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    const countEl = screen.getByTestId("widgets-count");
    expect(countEl.textContent).toBe("3");

    // Add widget
    const addBtn = screen.getByTestId("add-btn");
    await act(async () => {
      fireEvent.click(addBtn);
    });

    expect(screen.getByTestId("widgets-count").textContent).toBe("4");
    expect(screen.getByText("Test Line Widget")).toBeInTheDocument();
  });

  it("handles delete, duplicate, and rename actions", async () => {
    render(
      <DashboardProvider>
        <TestComponent />
      </DashboardProvider>
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    // Rename w1
    const renameBtn = screen.getByTestId("rename-w1");
    await act(async () => {
      fireEvent.click(renameBtn);
    });
    expect(screen.getByTestId("widget-title-w1").textContent).toBe("New Named Widget");

    // Duplicate w1
    const duplicateBtn = screen.getByTestId("duplicate-w1");
    await act(async () => {
      fireEvent.click(duplicateBtn);
    });
    // Count should increase to 4
    expect(screen.getByTestId("widgets-count").textContent).toBe("4");

    // Delete w1
    const deleteBtn = screen.getByTestId("delete-w1");
    await act(async () => {
      fireEvent.click(deleteBtn);
    });
    // Count should go back to 3
    expect(screen.getByTestId("widgets-count").textContent).toBe("3");
  });
});

describe("AI Query Priority Classification", () => {
  it("resolves explicit chart types before generic keywords", () => {
    // Both contain 'sales' (generic line keyword) but also explicit chart keywords
    expect(getMockQueryResponse("sales heatmap").chart_type).toBe("heatmap");
    expect(getMockQueryResponse("sales funnel").chart_type).toBe("funnel");
    
    // Contains 'users' (generic bar keyword) but also explicit scatter keyword
    expect(getMockQueryResponse("user scatter").chart_type).toBe("scatter");

    // Generic keywords only
    expect(getMockQueryResponse("monthly active users").chart_type).toBe("bar");
    expect(getMockQueryResponse("monthly sales").chart_type).toBe("line");
  });
});
