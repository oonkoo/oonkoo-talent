import { getCompany, getRoles } from "@/app/dashboard/companies/actions";
import { RateConfigTable } from "./rate-config-table";

export default async function RateConfigPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [company, roles] = await Promise.all([getCompany(slug), getRoles()]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Rate Config</h2>
        <p className="text-sm text-muted-foreground">
          Configure billing and pay rates per role for {company.name}.
        </p>
      </div>
      <RateConfigTable
        companyId={company.id}
        rateConfigs={company.rateConfigs}
        roles={roles}
      />
    </div>
  );
}
