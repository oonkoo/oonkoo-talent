import Link from "next/link";
import { Building2, Users, DollarSign, TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { DashboardCharts } from "./dashboard-charts";

function cad(n: number) {
  return `C$${n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function round2(n: number) { return Math.round(n * 100) / 100; }

export default async function DashboardPage() {
  const [companyCount, employeeCount, companies] = await Promise.all([
    db.company.count({ where: { isActive: true } }),
    db.employee.count({ where: { status: "active" } }),
    db.company.findMany({
      where: { isActive: true },
      include: {
        agents: { where: { isActive: true }, take: 1 },
        rateConfigs: { where: { effectiveTo: null } },
        employees: { where: { status: "active" } },
      },
    }),
  ]);

  let totalRevenue = 0;
  let totalAgentShare = 0;
  let totalOwnerShare = 0;
  let totalRoleRevised = 0;

  const companyData = companies.map((company) => {
    const agreedRate = Number(company.agreedRateBdt);
    const agentPct = company.agents[0] ? Number(company.agents[0].revenueSharePct) / 100 : 0;

    let rev = 0, cost = 0, roleRev = 0;
    for (const emp of company.employees) {
      const rc = company.rateConfigs.find((r) => r.roleId === emp.roleId);
      if (!rc) continue;
      const r = Number(rc.billRateCad) * Number(rc.hoursPerMonth);
      const c = Number(emp.payRateCad) * Number(rc.hoursPerMonth);
      const rr = (c * agreedRate - Number(emp.actualSalaryBdt)) / agreedRate;
      rev += r; cost += c; roleRev += rr;
    }

    const gross = rev - cost;
    const agent = gross * agentPct;
    const owner = gross - agent + roleRev;

    totalRevenue += rev;
    totalAgentShare += agent;
    totalOwnerShare += gross - agent;
    totalRoleRevised += roleRev;

    return {
      name: company.name,
      slug: company.slug,
      ownerEarnings: round2(owner),
      agentShare: round2(agent),
      employeeCount: company.employees.length,
      revenue: round2(rev),
    };
  });

  const ownerTotal = totalOwnerShare + totalRoleRevised;
  const hasData = companyCount > 0;

  const profitSplit = [
    { name: "Owner Base", value: round2(totalOwnerShare) },
    { name: "Agent Share", value: round2(totalAgentShare) },
    { name: "Role Revised", value: round2(totalRoleRevised) },
  ].filter((d) => d.value > 0);

  const metrics = [
    { label: "Active Companies", value: hasData ? String(companyCount) : "—", icon: Building2 },
    { label: "Total Employees", value: hasData ? String(employeeCount) : "—", icon: Users },
    { label: "Monthly Revenue", value: hasData ? cad(totalRevenue) : "—", icon: DollarSign },
    { label: "Owner Total", value: hasData ? cad(ownerTotal) : "—", icon: TrendingUp, highlight: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Overview of your staffing operations</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className={metric.highlight ? "border-accent" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
              <metric.icon className={`size-4 ${metric.highlight ? "text-accent" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold tabular-nums ${metric.highlight ? "text-emerald-600" : ""}`}>
                {metric.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasData ? (
        <>
          <DashboardCharts companyData={companyData} profitSplit={profitSplit} />

          <Card>
            <CardHeader><CardTitle>Companies</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {companyData.map((c) => (
                <Link
                  key={c.slug}
                  href={`/dashboard/companies/${c.slug}`}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-sm text-muted-foreground">{c.employeeCount} employees · Revenue {cad(c.revenue)}/mo</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium tabular-nums text-emerald-600">{cad(c.ownerEarnings)}</p>
                    <p className="text-xs text-muted-foreground">your earnings/mo</p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="size-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No companies yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Add your first company to get started with invoicing.</p>
            <Button asChild>
              <Link href="/dashboard/companies/new">Add Company <ArrowRight className="ml-2 size-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
