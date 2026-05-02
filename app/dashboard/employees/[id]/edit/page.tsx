import { getEmployee, getCompaniesWithRoles } from "../../actions";
import { EditEmployeeForm } from "./edit-employee-form";
import { BreadcrumbLabel } from "@/components/breadcrumb-context";

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [employee, companies] = await Promise.all([
    getEmployee(id),
    getCompaniesWithRoles(),
  ]);

  const company = companies.find((c) => c.id === employee.companyId);
  const rateConfig = company?.rateConfigs.find(
    (r) => r.roleId === employee.role?.id
  );

  return (
    <div className="space-y-6">
      <BreadcrumbLabel uuid={employee.id} label={employee.fullName} />
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Edit Employee</h2>
        <p className="text-sm text-muted-foreground">
          Update details for {employee.fullName}.
        </p>
      </div>
      <EditEmployeeForm
        employee={employee}
        billRateCad={rateConfig ? Number(rateConfig.billRateCad) : null}
        defaultPayRateCad={rateConfig ? Number(rateConfig.defaultPayRateCad) : null}
        maxPayRateCad={rateConfig ? Number(rateConfig.maxPayRateCad) : null}
        hoursPerMonth={rateConfig ? Number(rateConfig.hoursPerMonth) : 162.5}
        agreedRateBdt={Number(employee.company?.agreedRateBdt) || 88}
        currency={employee.company?.currency ?? "CAD"}
      />
    </div>
  );
}
