"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import type { EmployeeWithDetails } from "./actions";

export function EmployeeTable({ data }: { data: EmployeeWithDetails[] }) {
  const router = useRouter();

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="fullName"
      searchPlaceholder="Search employees..."
      onRowClick={(employee) => router.push(`/dashboard/employees/${employee.id}`)}
    />
  );
}
