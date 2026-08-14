"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

export interface Organization {
  id: number;
  name: string;
  plan: "Free" | "Pro" | "Enterprise";
}

const organizations: Organization[] = [
  {
    id: 1,
    name: "Acme Corporation",
    plan: "Pro",
  },
  {
    id: 2,
    name: "Nova Analytics",
    plan: "Free",
  },
];

interface OrganizationContextType {
  organization: Organization;
  setOrganization: (org: Organization) => void;
  organizations: Organization[];
}

const OrganizationContext =
  createContext<OrganizationContextType | null>(null);

export function OrganizationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [organization, setOrganization] =
    useState(organizations[0]);

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        setOrganization,
        organizations,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);

  if (!context) {
    throw new Error(
      "useOrganization must be used inside OrganizationProvider"
    );
  }

  return context;
}