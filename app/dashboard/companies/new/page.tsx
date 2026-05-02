import { CompanyWizard } from "./company-wizard";

export default function NewCompanyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Add Company</h2>
        <p className="text-sm text-muted-foreground">
          Create a new client company in 3 steps.
        </p>
      </div>
      <CompanyWizard />
    </div>
  );
}
