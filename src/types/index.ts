export type UserRole = "owner" | "admin" | "viewer";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  org_id: string;
}

export interface Organization {
  id: string;
  name: string;
  schema_name: string;
}

export type ConnectorType = "csv" | "api_poll" | "webhook";

export interface Connector {
  id: string;
  name: string;
  connector_type: ConnectorType;
  created_at: string;
}

export interface DataRecord {
  id: string;
  connector_id: string;
  data: Record<string, unknown>;
  created_at: string;
}

export type PlanTier = "free" | "pro" | "enterprise";

export interface Subscription {
  plan: PlanTier;
  status?: string;
}

export const PLAN_ORDER: PlanTier[] = [
  "free",
  "pro",
  "enterprise",
];

export type WidgetType =
  | "bar"
  | "line"
  | "pie"
  | "scatter"
  | "heatmap"
  | "funnel"
  | "table";

export interface Widget {
  id: string;
  title: string;
  type: WidgetType;
  connector_id?: string;
  query?: string;
  data?: any[];
  sql?: string;
  isLoading?: boolean;
  error?: string;
}

export interface WidgetLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export interface DashboardFilters {
  search: string;
}