"use client";

import { useState, Fragment } from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, Check, RotateCcw } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { generateCompanyInvoice, type InvoiceCompany } from "@/app/dashboard/invoices/actions";

const STEPS = ["Company & Period", "Line Items", "Scope & Generate"];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatCAD(value: number) {
  return `C$${value.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

type Scope = "all" | "by_role" | "individual";

interface LineItem {
  employeeId: string;
  employeeName: string;
  roleId: string;
  roleTitle: string;
  billRateCad: number;
  defaultBillRateCad: number;
  payRateCad: number;
  hours: number;
  actualSalaryBdt: number;
}

interface Props {
  companies: InvoiceCompany[];
}

export function CompanyInvoiceWizard({ companies }: Props) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [isSaving, setIsSaving] = useState(false);

  // Step 1
  const [companyId, setCompanyId] = useState("");
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(2026);

  // Step 2
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  // Step 3
  const [scope, setScope] = useState<Scope>("all");
  const [sendingRateBdt, setSendingRateBdt] = useState<number>(0);

  const selectedCompany = companies.find((c) => c.id === companyId) ?? null;

  function buildLineItems(company: InvoiceCompany): LineItem[] {
    return company.employees.map((emp) => {
      const rc = company.rateConfigs.find((r) => r.roleId === emp.roleId);
      const billRate = Number(rc?.billRateCad ?? 0);
      const payRate = Number(emp.payRateCad ?? 0);
      const role = rc?.role ?? company.rateConfigs[0]?.role;
      return {
        employeeId: emp.id,
        employeeName: emp.fullName,
        roleId: emp.roleId ?? "",
        roleTitle: role?.title ?? "Unknown",
        billRateCad: billRate,
        defaultBillRateCad: billRate,
        payRateCad: payRate,
        hours: Number(rc?.hoursPerMonth ?? 162.5),
        actualSalaryBdt: Number(emp.actualSalaryBdt ?? 0),
      };
    });
  }

  function handleCompanySelect(id: string) {
    setCompanyId(id);
    const company = companies.find((c) => c.id === id);
    if (company) {
      const items = buildLineItems(company);
      setLineItems(items);
      setSendingRateBdt(Number(company.agreedRateBdt ?? 0));
    }
  }

  function updateLineItem(
    index: number,
    field: "billRateCad" | "hours",
    value: number
  ) {
    setLineItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function resetLineItems() {
    if (!selectedCompany) return;
    setLineItems(buildLineItems(selectedCompany));
  }

  function goNext() {
    if (step === 0 && !companyId) {
      toast.error("Please select a company");
      return;
    }
    setDirection("forward");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setDirection("back");
    setStep((s) => Math.max(s - 1, 0));
  }

  const agreedRateBdt = Number(selectedCompany?.agreedRateBdt ?? 0);

  const totalRevenue = lineItems.reduce(
    (s, li) => s + li.billRateCad * li.hours,
    0
  );
  const totalCost = lineItems.reduce(
    (s, li) => s + li.payRateCad * li.hours,
    0
  );
  const grossProfit = totalRevenue - totalCost;

  const periodLabel = `${MONTHS[month - 1]} ${year}`;

  async function handleGenerate() {
    if (!selectedCompany) return;
    const agentId = selectedCompany.agents?.[0]?.id;
    const agentSharePct = selectedCompany.agents?.[0]?.revenueSharePct != null ? Number(selectedCompany.agents[0].revenueSharePct) : undefined;

    setIsSaving(true);
    try {
      await generateCompanyInvoice({
        companyId,
        periodYear: year,
        periodMonth: month,
        periodLabel,
        scope,
        lineItems: lineItems.map((li) => ({
          employeeId: li.employeeId,
          roleId: li.roleId,
          billRateCad: li.billRateCad,
          payRateCad: li.payRateCad,
          hours: li.hours,
          actualSalaryBdt: li.actualSalaryBdt,
        })),
        agreedRateBdt,
        sendingRateBdt: sendingRateBdt || agreedRateBdt,
        agentId,
        agentSharePct,
      });
    } catch (err) {
      if (typeof err === "object" && err !== null && "digest" in err) throw err; // re-throw Next.js redirect
      toast.error("Failed to generate invoice");
      setIsSaving(false);
    }
    // redirect happens in server action — no setIsSaving(false) on success
  }

  // Group line items by role for table rendering
  const roleGroups = lineItems.reduce<Record<string, LineItem[]>>((acc, li) => {
    if (!acc[li.roleTitle]) acc[li.roleTitle] = [];
    acc[li.roleTitle].push(li);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl space-y-8">
      {/* Stepper */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            {i > 0 && <div className="h-px w-8 bg-border" />}
            <button
              onClick={() => {
                if (i < step) {
                  setDirection("back");
                  setStep(i);
                }
              }}
              disabled={i > step}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                i === step && "bg-primary text-primary-foreground",
                i < step && "bg-accent text-accent-foreground cursor-pointer",
                i > step && "text-muted-foreground"
              )}
            >
              {i < step ? (
                <Check className="size-4" />
              ) : (
                <span className="flex size-5 items-center justify-center rounded-full border text-xs">
                  {i + 1}
                </span>
              )}
              {label}
            </button>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div
        key={step}
        className={cn(
          "animate-in duration-150 ease-out",
          direction === "forward"
            ? "slide-in-from-right-2 fade-in"
            : "slide-in-from-left-2 fade-in"
        )}
      >
        {/* Step 1: Company & Period */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Select Company &amp; Period</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Company</Label>
                <Select value={companyId} onValueChange={handleCompanySelect}>
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

              {selectedCompany && (
                <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Employees: </span>
                    <Badge variant="secondary">{selectedCompany.employees.length}</Badge>
                  </div>
                  <div className="ml-auto">
                    <span className="text-muted-foreground">Agreed Rate: </span>
                    <span className="font-medium tabular-nums">
                      {agreedRateBdt > 0 ? `BDT ${agreedRateBdt.toFixed(2)}` : "—"}
                    </span>
                  </div>
                </div>
              )}

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
        )}

        {/* Step 2: Line Items */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Review Line Items</CardTitle>
                <Button variant="ghost" size="sm" onClick={resetLineItems}>
                  <RotateCcw className="mr-2 size-3.5" />
                  Reset to defaults
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead className="text-right tabular-nums">Bill Rate</TableHead>
                      <TableHead className="text-right tabular-nums">Hours</TableHead>
                      <TableHead className="text-right tabular-nums">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(roleGroups).map(([role, items]) => (
                      <Fragment key={role}>
                        <TableRow key={`role-${role}`} className="bg-muted/40">
                          <TableCell colSpan={4} className="py-2 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                            {role}
                          </TableCell>
                        </TableRow>
                        {items.map((li) => {
                          const globalIdx = lineItems.findIndex(
                            (x) => x.employeeId === li.employeeId
                          );
                          const subtotal = li.billRateCad * li.hours;
                          return (
                            <TableRow key={li.employeeId}>
                              <TableCell className="font-medium">
                                {li.employeeName}
                              </TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  step="0.01"
                                  min={0}
                                  value={li.billRateCad}
                                  onChange={(e) =>
                                    updateLineItem(
                                      globalIdx,
                                      "billRateCad",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="h-8 w-24 text-right tabular-nums ml-auto"
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  step="1"
                                  min={0}
                                  value={li.hours}
                                  onChange={(e) =>
                                    updateLineItem(
                                      globalIdx,
                                      "hours",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="h-8 w-20 text-right tabular-nums ml-auto"
                                />
                              </TableCell>
                              <TableCell className="text-right tabular-nums">
                                {formatCAD(subtotal)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Sticky total */}
              <div className="sticky bottom-0 border-t bg-background px-6 py-3 flex items-center justify-between">
                <span className="text-sm font-semibold">Total</span>
                <span className="tabular-nums font-semibold text-sm">
                  {formatCAD(totalRevenue)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Scope & Generate */}
        {step === 2 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Scope</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(
                  [
                    {
                      value: "all" as Scope,
                      label: "All Employees",
                      description: "One invoice covering every active employee",
                    },
                    {
                      value: "by_role" as Scope,
                      label: "By Role",
                      description: "Separate section per role on the same invoice",
                    },
                    {
                      value: "individual" as Scope,
                      label: "Individual",
                      description: "One line item per employee, itemised",
                    },
                  ] satisfies { value: Scope; label: string; description: string }[]
                ).map((opt) => (
                  <label
                    key={opt.value}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
                      scope === opt.value
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/40"
                    )}
                  >
                    <input
                      type="radio"
                      name="scope"
                      value={opt.value}
                      checked={scope === opt.value}
                      onChange={() => setScope(opt.value)}
                      className="mt-0.5 accent-primary"
                    />
                    <div>
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.description}</p>
                    </div>
                  </label>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>FX Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label>Sending Rate BDT</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={sendingRateBdt || ""}
                  onChange={(e) => setSendingRateBdt(Number(e.target.value))}
                  placeholder={`Default: ${agreedRateBdt}`}
                />
                <p className="text-xs text-muted-foreground">
                  Leave as agreed rate if no FX advantage. A higher sending rate generates an FX advantage.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Period</dt>
                    <dd className="font-medium">{periodLabel}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Company</dt>
                    <dd className="font-medium">{selectedCompany?.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Employees</dt>
                    <dd className="tabular-nums">{lineItems.length}</dd>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <dt className="text-muted-foreground">Total Revenue</dt>
                    <dd className="tabular-nums font-medium">{formatCAD(totalRevenue)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Total Cost</dt>
                    <dd className="tabular-nums">{formatCAD(totalCost)}</dd>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <dt>Gross Profit</dt>
                    <dd className="tabular-nums">{formatCAD(grossProfit)}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {step > 0 ? (
          <Button variant="outline" onClick={goBack} disabled={isSaving}>
            <ArrowLeft className="mr-2 size-4" /> Back
          </Button>
        ) : (
          <div />
        )}
        {step < STEPS.length - 1 ? (
          <Button onClick={goNext}>
            Next <ArrowRight className="ml-2 size-4" />
          </Button>
        ) : (
          <Button onClick={handleGenerate} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Invoice"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
