"use client";

import {
  Bar, BarChart, Line, LineChart,
  XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const BRAND_LIME = "hsl(85 100% 72%)";
const BRAND_BLACK = "hsl(0 0% 9%)";

type MonthlyData = {
  period: string;
  label: string;
  revenue: number;
  profit: number;
  ownerTotal: number;
  agentShare: number;
};

type CompanyData = {
  name: string;
  revenue: number;
  ownerTotal: number;
  agentShare: number;
  count: number;
};

export function RevenueCharts({
  monthlyData,
  companyBreakdown,
}: {
  monthlyData: MonthlyData[];
  companyBreakdown: CompanyData[];
}) {
  const lineConfig = {
    revenue: { label: "Revenue", color: "hsl(0 0% 70%)" },
    ownerTotal: { label: "Your Earnings", color: BRAND_LIME },
  };

  const barConfig = {
    ownerTotal: { label: "Your Earnings", color: BRAND_LIME },
    agentShare: { label: "Agent Cost", color: BRAND_BLACK },
  };

  const fmt = (v: number) => `C$${v.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Monthly Trend */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Monthly Trend</CardTitle>
          <CardDescription>Revenue vs your earnings over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={lineConfig} className="h-[280px] w-full">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(0 0% 90%)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }}
                tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v}`} />
              <ChartTooltip content={<ChartTooltipContent formatter={(value) => fmt(Number(value))} />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ownerTotal" stroke="var(--color-ownerTotal)" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Per-Company Breakdown */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Earnings by Company</CardTitle>
          <CardDescription>Your earnings vs agent cost per company (all time)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barConfig} className="h-[260px] w-full">
            <BarChart data={companyBreakdown} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(0 0% 90%)" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 13 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }}
                tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v}`} />
              <ChartTooltip content={<ChartTooltipContent formatter={(value) => fmt(Number(value))} />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="ownerTotal" fill="var(--color-ownerTotal)" radius={[6, 6, 0, 0]} maxBarSize={48} />
              <Bar dataKey="agentShare" fill="var(--color-agentShare)" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
