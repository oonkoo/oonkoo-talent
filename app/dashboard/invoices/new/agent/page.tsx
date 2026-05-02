import { getCompaniesForInvoice } from "@/app/dashboard/invoices/actions";
import { AgentInvoiceWizard } from "./agent-invoice-wizard";

export default async function NewAgentInvoicePage() {
  const companies = await getCompaniesForInvoice(true);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Agent Invoice</h2>
        <p className="text-sm text-muted-foreground">Generate a new agent invoice.</p>
      </div>
      <AgentInvoiceWizard companies={companies} />
    </div>
  );
}
