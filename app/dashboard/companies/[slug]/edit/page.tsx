import { getCompany } from "../../actions";
import { EditCompanyForm } from "./edit-company-form";

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await getCompany(slug);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Edit {company.name}</h2>
        <p className="text-sm text-muted-foreground">Update company details and settings.</p>
      </div>
      <EditCompanyForm company={company} />
    </div>
  );
}
