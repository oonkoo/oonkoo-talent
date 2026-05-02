import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from "@/lib/db";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { isOwnerEmail } from "@/lib/auth";

function cad(n: number) {
  return `C$${n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Owner-only access
  const { isAuthenticated, getUser } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await getUser();
  if (!isOwnerEmail(user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const invoice = await db.invoiceBatch.findUnique({
    where: { id },
    include: {
      company: { select: { name: true, currency: true } },
      agent: { select: { name: true } },
      lineItems: {
        include: {
          employee: { select: { fullName: true } },
          role: { select: { title: true } },
        },
        orderBy: { role: { title: "asc" } },
      },
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  if (invoice.status === "draft") {
    return NextResponse.json({ error: "Finalize the invoice before downloading." }, { status: 400 });
  }

  const invoiceNumber = `OT-${invoice.company.name.toUpperCase()}-${invoice.periodYear}-${String(invoice.periodMonth).padStart(2, "0")}`;
  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("OonkoO Talent", 14, 20);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`INVOICE ${invoiceNumber}`, 14, 28);

  // Meta
  doc.setFontSize(10);
  doc.setTextColor(100);
  const meta = invoice.invoiceType === "agent" && invoice.agent
    ? `Agent: ${invoice.agent.name}\nCompany: ${invoice.company.name}\nPeriod: ${invoice.periodLabel}`
    : `Billed to: ${invoice.company.name}\nPeriod: ${invoice.periodLabel}\nCurrency: ${invoice.company.currency}`;
  doc.text(meta, 14, 36);
  doc.setTextColor(0);

  if (invoice.invoiceType === "agent" && invoice.agent) {
    // Agent Invoice — summary table
    autoTable(doc, {
      startY: 55,
      head: [["Description", "Amount"]],
      body: [
        [`Total billed to ${invoice.company.name} (${invoice.lineItems.length} staff)`, cad(Number(invoice.totalRevenueCad))],
        ["Total employee cost basis", cad(Number(invoice.totalSalaryCostCad))],
        ["Gross Profit", cad(Number(invoice.grossProfitCad))],
        [`${invoice.agent.name}'s share (${Number(invoice.agentSharePct)}%)`, cad(Number(invoice.agentShareCad))],
      ],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 0, 0] },
      columnStyles: { 1: { halign: "right" } },
    });

    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Amount payable to ${invoice.agent.name}: ${cad(Number(invoice.agentShareCad))}`, 14, finalY);
  } else {
    // Company Invoice — line items
    const scope = invoice.companyInvoiceScope ?? "all";
    let tableData: string[][];
    let headers: string[];

    if (scope === "individual") {
      headers = ["Employee", "Role", "Hours", "Rate", "Total"];
      tableData = invoice.lineItems.map((li) => [
        li.employee.fullName,
        li.role.title,
        String(Number(li.hours)),
        cad(Number(li.billRateCad)),
        cad(Number(li.revenueCad)),
      ]);
    } else {
      // Group by role (works for both "all" and "by_role")
      const groups: Record<string, { count: number; hours: number; rate: number; total: number }> = {};
      for (const li of invoice.lineItems) {
        const role = li.role.title;
        if (!groups[role]) groups[role] = { count: 0, hours: Number(li.hours), rate: Number(li.billRateCad), total: 0 };
        groups[role].count++;
        groups[role].total += Number(li.revenueCad);
      }
      headers = ["Role", "HC", "Hours", "Rate", "Total"];
      tableData = Object.entries(groups).map(([role, g]) => [
        role, String(g.count), String(g.hours), cad(g.rate), cad(g.total),
      ]);
    }

    autoTable(doc, {
      startY: 55,
      head: [headers],
      body: tableData,
      foot: [["", "", "", "TOTAL", cad(Number(invoice.totalRevenueCad))]],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 0, 0] },
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold" },
      columnStyles: {
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
      },
    });
  }

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoiceNumber}.pdf"`,
    },
  });
}
