import { getCompaniesWithRoles, getAllRoles } from "../actions";
import { OnboardForm } from "./onboard-form";

export default async function NewEmployeePage() {
  const [companies, allRoles] = await Promise.all([
    getCompaniesWithRoles(),
    getAllRoles(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Onboard Employee</h2>
        <p className="text-sm text-muted-foreground">
          Add a new employee to a company.
        </p>
      </div>
      <OnboardForm companies={companies} allRoles={allRoles} />
    </div>
  );
}
