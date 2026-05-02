import { getInvoice } from "../../actions";
import { OwnerReport } from "./owner-report";
import { BreadcrumbLabel } from "@/components/breadcrumb-context";

export default async function OwnerReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoice(id);

  return (
    <div className="space-y-6">
      <BreadcrumbLabel uuid={id} label={`${invoice.company.name} — ${invoice.periodLabel}`} />
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Internal Owner Report — {invoice.periodLabel}
        </h2>
        <p className="text-sm text-muted-foreground">
          {invoice.company.name} · Private — never shared with clients or agents
        </p>
      </div>
      <OwnerReport invoice={invoice} />
    </div>
  );
}
