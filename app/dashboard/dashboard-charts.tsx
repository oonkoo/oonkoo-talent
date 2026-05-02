"use client";

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type CompanyBreakdown = {
  name: string;
  ownerEarnings: number;
  agentShare: number;
  employeeCount: number;
};

type ProfitSlice = {
  name: string;
  value: number;
};

const BRAND_BLACK = "hsl(0 0% 9%)";
const BRAND_LIME = "hsl(85 100% 72%)";
const BRAND_LIME_MUTED = "hsl(85 40% 85%)";

export function DashboardCharts({
  companyData,
  profitSplit,
}: {
  companyData: CompanyBreakdown[];
  profitSplit: ProfitSlice[];
}) {
  const barConfig = {
    ownerEarnings: { label: "Your Earnings", color: BRAND_LIME },
    agentShare: { label: "Agent Cost", color: BRAND_BLACK },
  };

  const PIE_COLORS = [BRAND_LIME, BRAND_BLACK, BRAND_LIME_MUTED];
  const pieConfig = profitSplit.reduce((acc, item, i) => {
    acc[item.name] = { label: item.name, color: PIE_COLORS[i % PIE_COLORS.length] };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Your Earnings vs Agent Cost — per company */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Your Earnings vs Agent Cost</CardTitle>
          <CardDescription>Monthly per company — what you keep vs what the agent gets</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barConfig} className="h-[260px] w-full">
            <BarChart data={companyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(0 0% 90%)" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 13, fill: "hsl(0 0% 40%)" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "hsl(0 0% 55%)" }}
                tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v}`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => `${label}`}
                    formatter={(value, name) => {
                      const label = name === "ownerEarnings" ? "Your Earnings" : "Agent Cost";
                      return [`C$${Number(value).toLocaleString("en-CA", { minimumFractionDigits: 2 })}`, label];
                    }}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="ownerEarnings" fill="var(--color-ownerEarnings)" radius={[6, 6, 0, 0]} maxBarSize={48} />
              <Bar dataKey="agentShare" fill="var(--color-agentShare)" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Where Your Profit Goes — donut */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Profit Breakdown</CardTitle>
          <CardDescription>How gross profit is distributed monthly</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={pieConfig} className="h-[260px] w-full">
            <PieChart>
              <Pie
                data={profitSplit}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={4}
                strokeWidth={2}
                stroke="hsl(0 0% 100%)"
              >
                {profitSplit.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => [
                      `C$${Number(value).toLocaleString("en-CA", { minimumFractionDigits: 2 })}`,
                      String(name),
                    ]}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
