import { getEmployee } from "../../actions";
import { DocumentManager } from "./document-manager";
import { BreadcrumbLabel } from "@/components/breadcrumb-context";

export default async function EmployeeDocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const employee = await getEmployee(id);

  return (
    <div className="space-y-6">
      <BreadcrumbLabel uuid={employee.id} label={employee.fullName} />
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Documents — {employee.fullName}
        </h2>
        <p className="text-sm text-muted-foreground">
          Upload and manage employee documents.
        </p>
      </div>
      <DocumentManager
        employeeId={employee.id}
        documents={employee.documents as unknown as Parameters<typeof DocumentManager>[0]["documents"]}
      />
    </div>
  );
}
