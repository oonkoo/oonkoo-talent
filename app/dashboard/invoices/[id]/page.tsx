import { Fragment } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BreadcrumbLabel } from "@/components/breadcrumb-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getInvoice, type InvoiceFull } from "../actions";
import { InvoiceActions } from "./invoice-actions";

function deriveInvoiceNumber(invoice: InvoiceFull): string {
  const companyCode = invoice.company.slug.toUpperCase().slice(0, 6);
  const year = invoice.periodYear.toString();
  const month = invoice.periodMonth.toString().padStart(2, "0");
  return `OT-${companyCode}-${year}-${month}`;
}

function formatCad(value: number): string {
  return `C$${value.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "draft") {
    return (
      <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/10">
        Draft
      </Badge>
    );
  }
  if (status === "finalized") {
    return (
      <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20 hover:bg-blue-500/10">
        Finalized
      </Badge>
    );
  }
  return (
    <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/10">
      Downloaded
    </Badge>
  );
}

function TypeBadge({ type }: { type: string }) {
  const isAgent = type === "agent";
  return (
    <Badge
      className={
        isAgent
          ? "bg-violet-500/10 text-violet-700 border-violet-500/20 hover:bg-violet-500/10"
          : "bg-sky-500/10 text-sky-700 border-sky-500/20 hover:bg-sky-500/10"
      }
    >
      {isAgent ? "Agent" : "Company"}
    </Badge>
  );
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoice(id);

  const invoiceNumber = deriveInvoiceNumber(invoice);
  const totalRevenue = Number(invoice.totalRevenueCad);
  const totalCost = Number(invoice.totalSalaryCostCad);
  const grossProfit = Number(invoice.grossProfitCad);
  const agentShare = invoice.agentShareCad ? Number(invoice.agentShareCad) : null;
  const ownerTotal = Number(invoice.ownerTotalCad);

  // Group line items by role title
  const grouped = invoice.lineItems.reduce<
    Record<string, typeof invoice.lineItems>
  >((acc, item) => {
    const roleTitle = item.role.title;
    if (!acc[roleTitle]) acc[roleTitle] = [];
    acc[roleTitle].push(item);
    return acc;
  }, {});

  const totals = invoice.lineItems.reduce(
    (acc, item) => ({
      revenue: acc.revenue + Number(item.revenueCad),
      cost: acc.cost + Number(item.costCad),
      profit: acc.profit + Number(item.profitCad),
      hours: acc.hours + Number(item.hours),
    }),
    { revenue: 0, cost: 0, profit: 0, hours: 0 }
  );

  return (
    <div className="space-y-6">
      <BreadcrumbLabel uuid={id} label={invoiceNumber} />
      {/* Back link */}
      <Button variant="ghost" className="-ml-2" asChild>
        <Link href="/dashboard/invoices">
          <ArrowLeft className="mr-2 size-4" />
          All Invoices
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-semibold tracking-tight font-mono">
              {invoiceNumber}
            </h2>
            <TypeBadge type={invoice.invoiceType} />
            <StatusBadge status={invoice.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {invoice.company.name} · {invoice.periodLabel}
            {invoice.agent && ` · Agent: ${invoice.agent.name}`}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold tabular-nums">{formatCad(totalRevenue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold tabular-nums">{formatCad(totalCost)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Gross Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold tabular-nums">{formatCad(grossProfit)}</p>
          </CardContent>
        </Card>

        {agentShare !== null && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Agent Share
                {invoice.agentSharePct && (
                  <span className="ml-1 normal-case">
                    ({Number(invoice.agentSharePct)}%)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold tabular-nums">{formatCad(agentShare)}</p>
            </CardContent>
          </Card>
        )}

        <Card className="border-foreground/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Owner Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold tabular-nums" style={{ color: "#c1ff72" }}>
              {formatCad(ownerTotal)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Line Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Bill Rate</TableHead>
                <TableHead className="text-right">Pay Rate</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(grouped).map(([roleTitle, items]) => (
                <Fragment key={roleTitle}>
                  {/* Role section header */}
                  <TableRow key={`role-${roleTitle}`} className="bg-muted/40 hover:bg-muted/40">
                    <TableCell
                      colSpan={8}
                      className="py-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      {roleTitle}
                    </TableCell>
                  </TableRow>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.employee.fullName}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.role.title}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        C${Number(item.billRateCad).toFixed(2)}/hr
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        C${Number(item.payRateCad).toFixed(2)}/hr
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        {Number(item.hours).toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        {formatCad(Number(item.revenueCad))}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        {formatCad(Number(item.costCad))}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        {formatCad(Number(item.profitCad))}
                      </TableCell>
                    </TableRow>
                  ))}
                </Fragment>
              ))}

              {/* Totals row */}
              <TableRow className="border-t-2 font-bold bg-muted/20 hover:bg-muted/20">
                <TableCell colSpan={4} className="font-bold">
                  Total
                </TableCell>
                <TableCell className="text-right tabular-nums font-bold">
                  {totals.hours.toFixed(1)}
                </TableCell>
                <TableCell className="text-right tabular-nums font-bold">
                  {formatCad(totals.revenue)}
                </TableCell>
                <TableCell className="text-right tabular-nums font-bold">
                  {formatCad(totals.cost)}
                </TableCell>
                <TableCell className="text-right tabular-nums font-bold">
                  {formatCad(totals.profit)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceActions id={id} status={invoice.status} />
        </CardContent>
      </Card>
    </div>
  );
}
