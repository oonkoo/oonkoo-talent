"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CompanyWithDetails } from "./actions";

export const columns: ColumnDef<CompanyWithDetails>[] = [
  {
    accessorKey: "name",
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
    cell: ({ row }) => (
      <div>
        <span className="font-medium">{row.original.name}</span>
        <p className="text-xs text-muted-foreground">
          {row.original.country} · {row.original.currency}
        </p>
      </div>
    ),
  },
  {
    id: "contact",
    header: "Contact",
    cell: ({ row }) => (
      <div className="text-sm">
        <span>{row.original.contactName}</span>
        <p className="text-xs text-muted-foreground">{row.original.contactEmail}</p>
      </div>
    ),
  },
  {
    id: "agreedRate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4"
      >
        Agreed Rate
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    accessorFn: (row) => Number(row.agreedRateBdt),
    cell: ({ row }) => (
      <span className="tabular-nums text-sm">
        1 {row.original.currency} = {Number(row.original.agreedRateBdt).toFixed(2)} BDT
      </span>
    ),
  },
  {
    id: "headcount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4"
      >
        Employees
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    accessorFn: (row) => row._count.employees,
    cell: ({ row }) => (
      <span className="tabular-nums font-medium">{row.original._count.employees}</span>
    ),
  },
  {
    id: "agent",
    header: "Agent",
    cell: ({ row }) => {
      const company = row.original;
      if (!company.agentEnabled || company.agents.length === 0) {
        return (
          <Badge variant="outline" className="text-muted-foreground font-normal">
            No Agent
          </Badge>
        );
      }
      const agent = company.agents[0];
      return (
        <div>
          <Badge className="bg-accent text-accent-foreground">
            {agent.name}
          </Badge>
          <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">
            {Number(agent.revenueSharePct)}% share
          </span>
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) =>
      row.original.isActive ? (
        <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/10">
          Active
        </Badge>
      ) : (
        <Badge variant="outline" className="text-muted-foreground">
          Inactive
        </Badge>
      ),
  },
];
