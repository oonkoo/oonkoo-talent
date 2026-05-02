"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InvoiceWithDetails } from "./actions";

function deriveInvoiceNumber(invoice: InvoiceWithDetails): string {
  const companyCode = invoice.company.slug.toUpperCase().slice(0, 6);
  const year = invoice.periodYear.toString();
  const month = invoice.periodMonth.toString().padStart(2, "0");
  return `OT-${companyCode}-${year}-${month}`;
}

function formatCad(value: number): string {
  return `C$${value.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const columns: ColumnDef<InvoiceWithDetails>[] = [
  {
    id: "invoiceNumber",
    header: "Invoice #",
    accessorFn: (row) => deriveInvoiceNumber(row),
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">
        {deriveInvoiceNumber(row.original)}
      </span>
    ),
  },
  {
    id: "company",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4"
      >
        Company
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    accessorFn: (row) => row.company.name,
    cell: ({ row }) => (
      <span className="font-medium">{row.original.company.name}</span>
    ),
  },
  {
    id: "type",
    header: "Type",
    cell: ({ row }) => {
      const isAgent = row.original.invoiceType === "agent";
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
    },
  },
  {
    id: "period",
    header: "Period",
    accessorFn: (row) => row.periodLabel,
    cell: ({ row }) => (
      <span className="text-sm">{row.original.periodLabel}</span>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
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
    },
  },
  {
    id: "totalRevenueCad",
    header: () => <div className="text-right">Total CAD</div>,
    accessorFn: (row) => Number(row.totalRevenueCad),
    cell: ({ row }) => (
      <div className="text-right tabular-nums text-sm font-medium">
        {formatCad(Number(row.original.totalRevenueCad))}
      </div>
    ),
  },
  {
    id: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4"
      >
        Created
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    accessorFn: (row) => row.createdAt,
    cell: ({ row }) => (
      <span className="tabular-nums text-sm text-muted-foreground">
        {new Date(row.original.createdAt).toLocaleDateString("en-CA")}
      </span>
    ),
  },
];
