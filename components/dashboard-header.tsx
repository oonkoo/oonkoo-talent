"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";
import { useBreadcrumbOverrides } from "@/components/breadcrumb-context";

const segmentLabels: Record<string, string> = {
  dashboard: "Dashboard",
  companies: "Companies",
  employees: "Employees",
  invoices: "Invoices",
  revenue: "Revenue",
  settings: "Settings",
  new: "New",
  edit: "Edit",
  agents: "Agents",
  rates: "Rates",
  documents: "Documents",
  report: "Report",
  roles: "Roles",
  company: "Company Invoice",
  agent: "Agent Invoice",
};

function isUuid(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

function formatSegment(seg: string): string {
  if (segmentLabels[seg]) return segmentLabels[seg];
  // Capitalize slug segments: "flow" → "Flow", "my-company" → "My Company"
  return seg
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function DashboardHeader() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const { overrides } = useBreadcrumbOverrides();

  // Build crumbs: show UUID segments with their override name, or skip if no override
  const crumbs: { label: string; href: string; isLast: boolean }[] = [];
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const href = "/" + segments.slice(0, i + 1).join("/");
    if (isUuid(seg)) {
      const name = overrides[seg];
      if (name) crumbs.push({ label: name, href, isLast: false });
      continue;
    }
    crumbs.push({ label: formatSegment(seg), href, isLast: false });
  }
  if (crumbs.length > 0) crumbs[crumbs.length - 1].isLast = true;

  const pageTitle = crumbs.length > 0 ? crumbs[crumbs.length - 1].label : "Dashboard";

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      <SidebarTrigger className="size-9 rounded-md border border-border hover:bg-accent transition-colors" />
      <Separator orientation="vertical" className="mx-1 h-full" />

      {crumbs.length > 1 ? (
        <Breadcrumb>
          <BreadcrumbList className="text-sm">
            {crumbs.map((crumb, i) => (
              <Fragment key={crumb.href}>
                {i > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {crumb.isLast ? (
                    <BreadcrumbPage className="font-medium">{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors">
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      ) : (
        <h1 className="text-base font-semibold tracking-tight">{pageTitle}</h1>
      )}
    </header>
  );
}
