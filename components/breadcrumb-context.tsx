"use client";

import { createContext, useContext, useState, useCallback } from "react";

type BreadcrumbOverrides = Record<string, string>;

const BreadcrumbContext = createContext<{
  overrides: BreadcrumbOverrides;
  setOverride: (uuid: string, label: string) => void;
}>({ overrides: {}, setOverride: () => {} });

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverrides] = useState<BreadcrumbOverrides>({});

  const setOverride = useCallback((uuid: string, label: string) => {
    setOverrides((prev) => {
      if (prev[uuid] === label) return prev;
      return { ...prev, [uuid]: label };
    });
  }, []);

  return (
    <BreadcrumbContext value={{ overrides, setOverride }}>
      {children}
    </BreadcrumbContext>
  );
}

export function useBreadcrumbOverrides() {
  return useContext(BreadcrumbContext);
}

/**
 * Drop this in any page to register a UUID→name mapping for the breadcrumb.
 * Zero DB calls — the page already has the data.
 *
 * Usage: <BreadcrumbLabel uuid={employee.id} label={employee.fullName} />
 */
export function BreadcrumbLabel({ uuid, label }: { uuid: string; label: string }) {
  const { setOverride } = useBreadcrumbOverrides();
  // Use a ref-style approach to avoid infinite renders
  if (typeof window !== "undefined") {
    setOverride(uuid, label);
  }
  return null;
}
