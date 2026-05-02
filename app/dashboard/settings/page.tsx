import Link from "next/link";
import { Tags, Building2, Users, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const settingsLinks = [
  {
    href: "/dashboard/settings/roles",
    icon: Tags,
    title: "Role Catalogue",
    description: "Manage employee roles (Backend Developer, QA Engineer, etc.)",
  },
  {
    href: "/dashboard/companies",
    icon: Building2,
    title: "Companies",
    description: "Manage client companies, agents, and rate configs",
  },
  {
    href: "/dashboard/employees",
    icon: Users,
    title: "Employees",
    description: "Manage employee records, pay rates, and documents",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your application configuration</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {settingsLinks.map((item) => (
          <Link key={item.href} href={item.href} className="block">
            <Card className="hover:bg-muted/30 transition-colors cursor-pointer h-full">
              <CardContent className="flex items-start gap-4 py-5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <item.icon className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="flex items-center gap-3 py-5">
          <Shield className="size-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Authentication</p>
            <p className="text-xs text-muted-foreground">
              Managed by Kinde — owner-only access
              {process.env.OWNER_EMAIL ? ` via ${process.env.OWNER_EMAIL}` : ""}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
