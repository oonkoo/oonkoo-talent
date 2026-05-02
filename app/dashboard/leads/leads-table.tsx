"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import type { LeadListItem } from "./actions";

export function LeadsTable({ data }: { data: LeadListItem[] }) {
  const router = useRouter();

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="contactName"
      searchPlaceholder="Search by contact name..."
      onRowClick={(lead) => router.push(`/dashboard/leads/${lead.id}`)}
    />
  );
}
