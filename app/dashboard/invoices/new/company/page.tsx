import { getCompaniesForInvoice } from "@/app/dashboard/invoices/actions";
import { CompanyInvoiceWizard } from "./company-invoice-wizard";

export default async function NewCompanyInvoicePage() {
  const companies = await getCompaniesForInvoice();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Company Invoice</h2>
        <p className="text-sm text-muted-foreground">Generate a new company invoice.</p>
      </div>
      <CompanyInvoiceWizard companies={companies} />
    </div>
  );
}
