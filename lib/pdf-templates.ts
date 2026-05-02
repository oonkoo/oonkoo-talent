import type { Spec } from "@json-render/core";

function cad(n: number) {
  return `C$${n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

type LineItem = {
  employee: { fullName: string };
  role: { title: string };
  billRateCad: number;
  payRateCad: number;
  hours: number;
  revenueCad: number;
  costCad: number;
  profitCad: number;
};

type InvoiceData = {
  companyName: string;
  periodLabel: string;
  invoiceNumber: string;
  currency: string;
  totalRevenueCad: number;
  totalSalaryCostCad: number;
  grossProfitCad: number;
  lineItems: LineItem[];
  scope: string;
};

type AgentInvoiceData = {
  companyName: string;
  agentName: string;
  periodLabel: string;
  invoiceNumber: string;
  totalRevenueCad: number;
  totalSalaryCostCad: number;
  grossProfitCad: number;
  agentSharePct: number;
  agentShareCad: number;
  employeeCount: number;
  hours: number;
};

export function buildCompanyInvoiceSpec(data: InvoiceData): Spec {
  // Group by role
  const roleGroups: Record<string, { items: LineItem[]; subtotal: number }> = {};
  for (const li of data.lineItems) {
    const role = li.role.title;
    if (!roleGroups[role]) roleGroups[role] = { items: [], subtotal: 0 };
    roleGroups[role].items.push(li);
    roleGroups[role].subtotal += li.revenueCad;
  }

  const rows: string[][] = [];
  if (data.scope === "by_role") {
    for (const [role, group] of Object.entries(roleGroups)) {
      rows.push([role, String(group.items.length), String(Number(group.items[0].hours)), cad(Number(group.items[0].billRateCad)), cad(group.subtotal)]);
    }
  } else if (data.scope === "individual") {
    for (const li of data.lineItems) {
      rows.push([li.employee.fullName, li.role.title, String(Number(li.hours)), cad(Number(li.billRateCad)), cad(Number(li.revenueCad))]);
    }
  } else {
    for (const [role, group] of Object.entries(roleGroups)) {
      rows.push([role, String(group.items.length), String(Number(group.items[0].hours)), cad(Number(group.items[0].billRateCad)), cad(group.subtotal)]);
    }
  }

  const colHeaders = data.scope === "individual"
    ? ["Employee", "Role", "Hours", "Rate", "Total"]
    : ["Role", "HC", "Hours", "Rate", "Total"];

  const colWidths = data.scope === "individual"
    ? ["30%", "20%", "15%", "15%", "20%"]
    : ["30%", "10%", "20%", "20%", "20%"];

  return {
    root: "doc",
    elements: {
      doc: { type: "Document", props: { title: `Invoice ${data.invoiceNumber}` }, children: ["page"] },
      page: {
        type: "Page",
        props: { size: "A4", style: { padding: 40, fontFamily: "Helvetica", fontSize: 10 } },
        children: ["header", "spacer1", "meta", "spacer2", "table", "spacer3", "total"],
      },
      header: {
        type: "Heading",
        props: { text: `INVOICE ${data.invoiceNumber}`, level: "h1", style: { fontSize: 18, marginBottom: 4 } },
        children: [],
      },
      spacer1: { type: "Text", props: { text: " ", style: { marginBottom: 8 } }, children: [] },
      meta: {
        type: "Text",
        props: {
          text: `OonkoO Talent\nBilled to: ${data.companyName}\nPeriod: ${data.periodLabel}\nCurrency: ${data.currency}`,
          style: { fontSize: 10, lineHeight: 1.6, color: "#555" },
        },
        children: [],
      },
      spacer2: { type: "Text", props: { text: " ", style: { marginBottom: 16 } }, children: [] },
      table: {
        type: "Table",
        props: {
          columns: colHeaders.map((header, i) => ({
            header,
            width: colWidths[i],
            align: i >= 2 ? "right" as const : "left" as const,
          })),
          rows,
        },
        children: [],
      },
      spacer3: { type: "Text", props: { text: " ", style: { marginBottom: 8 } }, children: [] },
      total: {
        type: "Text",
        props: {
          text: `TOTAL: ${cad(data.totalRevenueCad)}`,
          style: { fontSize: 14, fontFamily: "Helvetica-Bold", textAlign: "right" as const, borderTopWidth: 2, borderTopColor: "#000", paddingTop: 8 },
        },
        children: [],
      },
    },
  };
}

export function buildAgentInvoiceSpec(data: AgentInvoiceData): Spec {
  return {
    root: "doc",
    elements: {
      doc: { type: "Document", props: { title: `Agent Invoice ${data.invoiceNumber}` }, children: ["page"] },
      page: {
        type: "Page",
        props: { size: "A4", style: { padding: 40, fontFamily: "Helvetica", fontSize: 10 } },
        children: ["header", "spacer1", "meta", "spacer2", "breakdown", "spacer3", "payable"],
      },
      header: {
        type: "Heading",
        props: { text: `AGENCY SERVICES INVOICE ${data.invoiceNumber}`, level: "h1", style: { fontSize: 16, marginBottom: 4 } },
        children: [],
      },
      spacer1: { type: "Text", props: { text: " ", style: { marginBottom: 8 } }, children: [] },
      meta: {
        type: "Text",
        props: {
          text: `OonkoO Talent\nAgent: ${data.agentName}\nCompany: ${data.companyName}\nPeriod: ${data.periodLabel}`,
          style: { fontSize: 10, lineHeight: 1.6, color: "#555" },
        },
        children: [],
      },
      spacer2: { type: "Text", props: { text: " ", style: { marginBottom: 16 } }, children: [] },
      breakdown: {
        type: "Table",
        props: {
          columns: [
            { header: "Description", width: "60%", align: "left" as const },
            { header: "Amount", width: "40%", align: "right" as const },
          ],
          rows: [
            [`Total billed to ${data.companyName} (${data.employeeCount} staff × ${data.hours} hrs)`, cad(data.totalRevenueCad)],
            [`Total employee cost basis`, cad(data.totalSalaryCostCad)],
            [`Gross Profit`, cad(data.grossProfitCad)],
            [`Your share (${data.agentSharePct}%)`, cad(data.agentShareCad)],
          ],
        },
        children: [],
      },
      spacer3: { type: "Text", props: { text: " ", style: { marginBottom: 8 } }, children: [] },
      payable: {
        type: "Text",
        props: {
          text: `Amount payable to ${data.agentName}: ${cad(data.agentShareCad)}`,
          style: { fontSize: 14, fontFamily: "Helvetica-Bold", textAlign: "right" as const, borderTopWidth: 2, borderTopColor: "#000", paddingTop: 8 },
        },
        children: [],
      },
    },
  };
}
