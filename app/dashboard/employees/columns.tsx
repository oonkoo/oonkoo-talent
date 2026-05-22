"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EmployeeWithDetails } from "./actions";

function formatTenure(startISO: string): string {
  const start = new Date(startISO);
  const now = new Date();

  let years = now.getUTCFullYear() - start.getUTCFullYear();
  let months = now.getUTCMonth() - start.getUTCMonth();
  let days = now.getUTCDate() - start.getUTCDate();

  if (days < 0) {
    months -= 1;
    const prevMonthLastDay = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0),
    ).getUTCDate();
    days += prevMonthLastDay;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) return "—";

  const parts: string[] = [];
  if (years > 0) parts.push(`${years}y`);
  if (months > 0) parts.push(`${months}m`);
  if (years === 0) parts.push(`${days}d`);
  return parts.join(" ");
}

export const columns: ColumnDef<EmployeeWithDetails>[] = [
  {
    accessorKey: "fullName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4"
      >
        Name
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.original.fullName}</span>
    ),
  },
  {
    id: "company",
    header: "Company",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.original.company.name}</Badge>
    ),
  },
  {
    id: "role",
    header: "Role",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.role.title}</span>
    ),
  },
  {
    id: "payRateCad",
    header: () => <div className="text-right">Pay Rate</div>,
    accessorFn: (row) => Number(row.payRateCad),
    cell: ({ row }) => (
      <div className="text-right tabular-nums text-sm">
        C${Number(row.original.payRateCad).toFixed(2)}/hr
      </div>
    ),
  },
  {
    id: "actualSalaryBdt",
    header: () => <div className="text-right">Salary BDT</div>,
    accessorFn: (row) => Number(row.actualSalaryBdt),
    cell: ({ row }) => (
      <div className="text-right tabular-nums text-sm">
        ৳{Number(row.original.actualSalaryBdt).toLocaleString("en-BD")}
      </div>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      if (status === "active") {
        return (
          <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/10">
            Active
          </Badge>
        );
      }
      if (status === "on_leave") {
        return (
          <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/10">
            On Leave
          </Badge>
        );
      }
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Inactive
        </Badge>
      );
    },
  },
  {
    id: "startDate",
    header: "Start Date",
    accessorFn: (row) => row.startDate,
    cell: ({ row }) => (
      <span className="tabular-nums text-sm">
        {new Date(row.original.startDate as unknown as string).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "UTC",
        })}
      </span>
    ),
  },
  {
    id: "tenure",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4"
      >
        Tenure
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    accessorFn: (row) => new Date(row.startDate as unknown as string).getTime(),
    sortingFn: (a, b, columnId) => {
      // Earlier start date = longer tenure. Sort ascending shows shortest tenure first.
      return (b.getValue(columnId) as number) - (a.getValue(columnId) as number);
    },
    cell: ({ row }) => (
      <span className="tabular-nums text-sm text-muted-foreground">
        {formatTenure(row.original.startDate as unknown as string)}
      </span>
    ),
  },
];
