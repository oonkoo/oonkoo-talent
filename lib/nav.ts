import {
  LayoutDashboard,
  Inbox,
  Building2,
  Users,
  FileText,
  TrendingUp,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Leads", href: "/dashboard/leads", icon: Inbox },
  { label: "Companies", href: "/dashboard/companies", icon: Building2 },
  { label: "Employees", href: "/dashboard/employees", icon: Users },
  { label: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { label: "Revenue", href: "/dashboard/revenue", icon: TrendingUp },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function isNavActive(href: string, pathname: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}
