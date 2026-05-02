"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import type { InvoiceWithDetails } from "./actions";

export function InvoiceTable({ data }: { data: InvoiceWithDetails[] }) {
  const router = useRouter();

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="company"
      searchPlaceholder="Search invoices..."
      onRowClick={(invoice) => router.push(`/dashboard/invoices/${invoice.id}`)}
    />
  );
}
