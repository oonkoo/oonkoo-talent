"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateAgentInvoice, type InvoiceCompany } from "@/app/dashboard/invoices/actions";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatCAD(value: number) {
  return `C$${value.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface Props {
  companies: InvoiceCompany[];
}

export function AgentInvoiceWizard({ companies }: Props) {
  const [companyId, setCompanyId] = useState("");
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(2026);
  const [isSaving, setIsSaving] = useState(false);

  const selectedCompany = companies.find((c) => c.id === companyId) ?? null;
  const agent = selectedCompany?.agents?.[0] ?? null;

  const agreedRateBdt = Number(selectedCompany?.agreedRateBdt ?? 0);
  const agentSharePct = Number(agent?.revenueSharePct ?? 0);

  // Build summary from company data
  const employees = selectedCompany?.employees ?? [];
  const lineItems = employees.map((emp) => {
    const rc = selectedCompany?.rateConfigs.find((r) => r.roleId === emp.roleId);
    const billRate = Number(rc?.billRateCad ?? 0);
    const payRate = Number(emp.payRateCad ?? 0);
    return {
      employeeId: emp.id,
      roleId: emp.roleId ?? "",
      billRateCad: billRate,
      payRateCad: payRate,
      hours: Number(rc?.hoursPerMonth ?? 162.5),
      actualSalaryBdt: Number(emp.actualSalaryBdt ?? 0),
    };
  });

  const totalBilled = lineItems.reduce((s, li) => s + li.billRateCad * li.hours, 0);
  const totalCostBasis = lineItems.reduce((s, li) => s + li.payRateCad * li.hours, 0);
  const grossProfit = totalBilled - totalCostBasis;
  const agentAmount = grossProfit * (agentSharePct / 100);

  const periodLabel = `${MONTHS[month - 1]} ${year}`;

  async function handleGenerate() {
    if (!selectedCompany || !agent) {
      toast.error("Please select a company with an agent");
      return;
    }
    if (lineItems.length === 0) {
      toast.error("No employees found for this company");
      return;
    }

    setIsSaving(true);
    try {
      await generateAgentInvoice({
        companyId,
        agentId: agent.id,
        periodYear: year,
        periodMonth: month,
        periodLabel,
        agreedRateBdt,
        agentSharePct,
        lineItems,
      });
    } catch (err) {
      if (typeof err === "object" && err !== null && "digest" in err) throw err;
      toast.error("Failed to generate agent invoice");
      setIsSaving(false);
    }
    // redirect happens in server action
  }

  return (
    <div className="max-w-xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Company &amp; Period</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Company</Label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a company..." />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Month</Label>
              <Select
                value={String(month)}
                onValueChange={(v) => setMonth(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={m} value={String(i + 1)}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={2020}
                max={2099}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedCompany && (
        <Card>
          <CardHeader>
            <CardTitle>Invoice Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total Billed</dt>
                <dd className="tabular-nums font-medium">{formatCAD(totalBilled)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total Cost Basis</dt>
                <dd className="tabular-nums">{formatCAD(totalCostBasis)}</dd>
              </div>
              <div className="flex justify-between border-t pt-2">
                <dt className="text-muted-foreground">Gross Profit</dt>
                <dd className="tabular-nums">{formatCAD(grossProfit)}</dd>
              </div>
              {agent ? (
                <>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Agent</dt>
                    <dd className="font-medium">
                      {agent.name}{" "}
                      <span className="text-muted-foreground">({agentSharePct}%)</span>
                    </dd>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <dt>Amount Payable to Agent</dt>
                    <dd className="tabular-nums">{formatCAD(agentAmount)}</dd>
                  </div>
                </>
              ) : (
                <div className="text-sm text-destructive pt-1">
                  No active agent found for this company.
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleGenerate}
        disabled={isSaving || !selectedCompany || !agent}
        className="w-full"
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Generating...
          </>
        ) : (
          "Generate Agent Invoice"
        )}
      </Button>
    </div>
  );
}
