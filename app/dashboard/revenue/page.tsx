import { DollarSign, TrendingUp, Users, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { serialize } from "@/lib/serialize";
import { RevenueCharts } from "./revenue-charts";

function cad(n: number) {
  return `C$${n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function RevenuePage() {
  const invoices = await db.invoiceBatch.findMany({
    where: { status: { in: ["finalized", "downloaded"] } },
    include: {
      company: { select: { name: true } },
    },
    orderBy: [{ periodYear: "asc" }, { periodMonth: "asc" }],
  });

  const serialized = serialize(invoices);

  // Compute YTD metrics
  const currentYear = new Date().getFullYear();
  const ytdInvoices = serialized.filter((inv: typeof serialized[number]) => inv.periodYear === currentYear && inv.invoiceType === "company");

  const ytdRevenue = ytdInvoices.reduce((s: number, inv: typeof serialized[number]) => s + Number(inv.totalRevenueCad), 0);
  const ytdProfit = ytdInvoices.reduce((s: number, inv: typeof serialized[number]) => s + Number(inv.grossProfitCad), 0);
  const ytdOwnerTotal = ytdInvoices.reduce((s: number, inv: typeof serialized[number]) => s + Number(inv.ownerTotalCad), 0);
  const avgMonthlyRevenue = ytdInvoices.length > 0 ? ytdRevenue / ytdInvoices.length : 0;

  // Monthly trend data (company invoices only to avoid double counting)
  const companyInvoices = serialized.filter((inv: typeof serialized[number]) => inv.invoiceType === "company");
  const monthlyData = companyInvoices.map((inv: typeof serialized[number]) => ({
    period: `${String(inv.periodMonth).padStart(2, "0")}/${inv.periodYear}`,
    label: inv.periodLabel,
    revenue: Number(inv.totalRevenueCad),
    profit: Number(inv.grossProfitCad),
    ownerTotal: Number(inv.ownerTotalCad),
    agentShare: Number(inv.agentShareCad ?? 0),
  }));

  // Per-company breakdown
  const companyMap: Record<string, { name: string; revenue: number; ownerTotal: number; agentShare: number; count: number }> = {};
  for (const inv of companyInvoices) {
    const name = inv.company.name;
    if (!companyMap[name]) companyMap[name] = { name, revenue: 0, ownerTotal: 0, agentShare: 0, count: 0 };
    companyMap[name].revenue += Number(inv.totalRevenueCad);
    companyMap[name].ownerTotal += Number(inv.ownerTotalCad);
    companyMap[name].agentShare += Number(inv.agentShareCad ?? 0);
    companyMap[name].count++;
  }
  const companyBreakdown = Object.values(companyMap);

  const hasData = serialized.length > 0;

  const metrics = [
    { label: "YTD Revenue", value: hasData ? cad(ytdRevenue) : "—", icon: DollarSign },
    { label: "YTD Owner Total", value: hasData ? cad(ytdOwnerTotal) : "—", icon: TrendingUp, highlight: true },
    { label: "Avg Monthly Revenue", value: hasData ? cad(avgMonthlyRevenue) : "—", icon: BarChart3 },
    { label: "Invoices Generated", value: hasData ? String(serialized.length) : "—", icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Revenue Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Financial insights from finalized invoices
        </p>
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
        <RevenueCharts monthlyData={monthlyData} companyBreakdown={companyBreakdown} />
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="size-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No finalized invoices yet</h3>
            <p className="text-sm text-muted-foreground">
              Revenue analytics will appear once you finalize your first invoice.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
