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
