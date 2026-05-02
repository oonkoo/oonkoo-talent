"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MailPlus, UserPlus, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { LeadListItem } from "./actions";

const STATUS_VARIANT: Record<
  LeadListItem["status"],
  { label: string; className: string }
> = {
  NEW: {
    label: "New",
    className: "bg-blue-500/10 text-blue-700 border-blue-500/20 hover:bg-blue-500/10",
  },
  CONTACTED: {
    label: "Contacted",
    className: "bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/10",
  },
  QUALIFIED: {
    label: "Qualified",
    className: "bg-violet-500/10 text-violet-700 border-violet-500/20 hover:bg-violet-500/10",
  },
  CONVERTED: {
    label: "Converted",
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/10",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20 hover:bg-zinc-500/10",
  },
};

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const min = 60_000,
    hour = 60 * min,
    day = 24 * hour;
  if (diff < min) return "just now";
  if (diff < hour) return `${Math.floor(diff / min)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return new Date(iso).toLocaleDateString();
}

export const columns: ColumnDef<LeadListItem>[] = [
  {
    id: "source",
    header: "Source",
    cell: ({ row }) => {
      const isSignup = row.original.source === "SIGNUP";
      return (
        <Badge variant="outline" className="font-normal">
          {isSignup ? (
            <UserPlus className="mr-1 size-3" />
          ) : (
            <MailPlus className="mr-1 size-3" />
          )}
          {isSignup ? "Signup" : "Contact"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "contactName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4"
      >
        Contact
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div>
        <span className="font-medium">{row.original.contactName}</span>
        <p className="text-xs text-muted-foreground">
          {row.original.companyName ?? "—"}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "contactEmail",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.contactEmail}</span>
    ),
  },
  {
    id: "teamSize",
    header: "Team",
    cell: ({ row }) => {
      const size = row.original.teamSize;
      if (!size) return <span className="text-muted-foreground text-sm">—</span>;
      return <span className="tabular-nums text-sm">{size}</span>;
    },
  },
  {
    id: "notes",
    header: "Notes",
    cell: ({ row }) => {
      const count = row.original._count.notes;
      if (count === 0) return <span className="text-muted-foreground text-sm">—</span>;
      return (
        <div className="flex items-center gap-1 text-sm tabular-nums">
          <MessageSquare className="size-3 text-muted-foreground" />
          {count}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const variant = STATUS_VARIANT[row.original.status];
      return <Badge className={variant.className}>{variant.label}</Badge>;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4"
      >
        Received
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground tabular-nums">
        {formatRelative(row.original.createdAt as unknown as string)}
      </span>
    ),
  },
];
