"use client";

import { createContext, useContext, useState } from "react";
import { demoOrganizations } from "./demo-organizations";

type OrgKey = keyof typeof demoOrganizations;

type OrgContextType = {
  currentOrg: OrgKey;
  setCurrentOrg: (org: OrgKey) => void;
  org: (typeof demoOrganizations)[OrgKey];
};

const OrgContext = createContext<OrgContextType | null>(null);

export function OrgProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentOrg, setCurrentOrg] =
    useState<OrgKey>("acme");

  return (
    <OrgContext.Provider
      value={{
        currentOrg,
        setCurrentOrg,
        org: demoOrganizations[currentOrg],
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const context = useContext(OrgContext);

  if (!context) {
    throw new Error("useOrg must be used inside OrgProvider");
  }

  return context;
}