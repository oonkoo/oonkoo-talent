"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import type { CompanyWithDetails } from "./actions";

export function CompanyTable({ data }: { data: CompanyWithDetails[] }) {
  const router = useRouter();

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="Search companies..."
      onRowClick={(company) => router.push(`/dashboard/companies/${company.slug}`)}
    />
  );
}
