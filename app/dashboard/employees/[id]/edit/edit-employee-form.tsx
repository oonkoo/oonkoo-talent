"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Info } from "lucide-react";
import { z } from "zod";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateEmployee, type EmployeeFull } from "../../actions";

function cad(n: number) { return `C$${n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function bdt(n: number) { return `৳${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`; }

function buildSchema(maxPayRateCad: number | null) {
  return z.object({
    fullName: z.string().min(1, "Required"),
    email: z.string().email("Invalid email"),
    phone: z.string().optional(),
    nidNumber: z.string().optional(),
    passportNumber: z.string().optional(),
    address: z.string().optional(),
    bankAccountNumber: z.string().optional(),
    bankName: z.string().optional(),
    bankAccountHolder: z.string().optional(),
    bankBranchName: z.string().optional(),
    emergencyName: z.string().optional(),
    emergencyRelation: z.string().optional(),
    emergencyPhone: z.string().optional(),
    payRateCad: z.coerce.number({ error: "Must be a number" }).positive("Must be positive")
      .refine((v) => maxPayRateCad === null || v <= maxPayRateCad,
        `Exceeds maximum ${cad(maxPayRateCad ?? 0)}/hr`),
    actualSalaryBdt: z.coerce.number({ error: "Must be a number" }).positive("Must be positive"),
    startDate: z.string().min(1, "Start date is required"),
    status: z.enum(["active", "inactive", "on_leave"]),
  });
}

type FormValues = {
  fullName: string; email: string; phone: string; nidNumber: string;
  passportNumber: string; address: string;
  bankAccountNumber: string; bankName: string;
  bankAccountHolder: string; bankBranchName: string;
  emergencyName: string; emergencyRelation: string; emergencyPhone: string;
  payRateCad: string; actualSalaryBdt: string; startDate: string;
  status: "active" | "inactive" | "on_leave";
};
type FieldErrors = Partial<Record<keyof FormValues, string>>;

export function EditEmployeeForm({
  employee,
  billRateCad,
  defaultPayRateCad,
  maxPayRateCad,
  hoursPerMonth,
  agreedRateBdt,
  currency,
}: {
  employee: EmployeeFull;
  billRateCad: number | null;
  defaultPayRateCad: number | null;
  maxPayRateCad: number | null;
  hoursPerMonth: number;
  agreedRateBdt: number;
  currency: string;
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const hrs = hoursPerMonth;
  const rate = agreedRateBdt;

  const [form, setForm] = useState<FormValues>({
    fullName: employee.fullName,
    email: employee.email,
    phone: employee.phone ?? "",
    nidNumber: employee.nidNumber ?? "",
    passportNumber: employee.passportNumber ?? "",
    address: employee.address ?? "",
    bankAccountNumber: employee.bankAccountNumber ?? "",
    bankName: employee.bankName ?? "",
    bankAccountHolder: employee.bankAccountHolder ?? "",
    bankBranchName: employee.bankBranchName ?? "",
    emergencyName: employee.emergencyName ?? "",
    emergencyRelation: employee.emergencyRelation ?? "",
    emergencyPhone: employee.emergencyPhone ?? "",
    payRateCad: String(Number(employee.payRateCad)),
    actualSalaryBdt: String(Number(employee.actualSalaryBdt)),
    startDate: String(employee.startDate).slice(0, 10),
    status: employee.status as FormValues["status"],
  });

  function update<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  }

  // Live calculations
  const payRate = parseFloat(form.payRateCad) || 0;
  const actualBdt = parseFloat(form.actualSalaryBdt) || 0;
  const bill = billRateCad ?? 0;

  const monthlyRevenueCad = bill * hrs;
  const monthlyRevenueBdt = monthlyRevenueCad * rate;
  const monthlyCostCad = payRate * hrs;
  const monthlyCostBdt = monthlyCostCad * rate;
  const grossProfitCad = monthlyRevenueCad - monthlyCostCad;
  const grossProfitBdt = grossProfitCad * rate;
  const actualSalaryCad = actualBdt / rate;
  const roleRevisedBdt = monthlyCostBdt - actualBdt;
  const roleRevisedCad = roleRevisedBdt / rate;

  function validate(): boolean {
    const result = buildSchema(maxPayRateCad).safeParse(form);
    if (result.success) { setErrors({}); return true; }
    const fe: FieldErrors = {};
    for (const issue of result.error.issues) {
      const k = issue.path[0] as keyof FormValues;
      if (!fe[k]) fe[k] = issue.message;
    }
    setErrors(fe);
    return false;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setIsSaving(true);
    try {
      await updateEmployee(employee.id, {
        fullName: form.fullName, email: form.email,
        phone: form.phone || undefined, nidNumber: form.nidNumber || undefined,
        passportNumber: form.passportNumber || undefined, address: form.address || undefined,
        bankAccountNumber: form.bankAccountNumber || undefined, bankName: form.bankName || undefined,
        bankAccountHolder: form.bankAccountHolder || undefined, bankBranchName: form.bankBranchName || undefined,
        emergencyName: form.emergencyName || undefined, emergencyRelation: form.emergencyRelation || undefined, emergencyPhone: form.emergencyPhone || undefined,
        payRateCad: payRate, actualSalaryBdt: actualBdt, startDate: form.startDate, status: form.status,
      });
      toast.success(`${form.fullName} updated`);
      router.push(`/dashboard/employees/${employee.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Personal Details */}
      <Card>
        <CardHeader><CardTitle>Personal Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Full Name" error={errors.fullName}>
            <Input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email" error={errors.email}>
              <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </Field>
            <Field label="Phone" error={errors.phone}>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+880..." />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="NID Number" error={errors.nidNumber}>
              <Input value={form.nidNumber} onChange={(e) => update("nidNumber", e.target.value)} />
            </Field>
            <Field label="Passport Number" error={errors.passportNumber}>
              <Input value={form.passportNumber} onChange={(e) => update("passportNumber", e.target.value)} />
            </Field>
          </div>
          <Field label="Address" error={errors.address}>
            <Input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Full address" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date" error={errors.startDate}>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => update("startDate", e.target.value)}
              />
            </Field>
            <Field label="Status" error={errors.status}>
              <Select value={form.status} onValueChange={(v) => update("status", v as FormValues["status"])}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Banking Details */}
      <Card>
        <CardHeader><CardTitle>Banking Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Bank Account Number" error={errors.bankAccountNumber}>
              <Input value={form.bankAccountNumber} onChange={(e) => update("bankAccountNumber", e.target.value)} />
            </Field>
            <Field label="Bank Name" error={errors.bankName}>
              <Input value={form.bankName} onChange={(e) => update("bankName", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Account Holder's Name" error={errors.bankAccountHolder}>
              <Input value={form.bankAccountHolder} onChange={(e) => update("bankAccountHolder", e.target.value)} />
            </Field>
            <Field label="Branch Name" error={errors.bankBranchName}>
              <Input value={form.bankBranchName} onChange={(e) => update("bankBranchName", e.target.value)} />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader><CardTitle>Emergency Contact</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Name" error={errors.emergencyName}>
              <Input value={form.emergencyName} onChange={(e) => update("emergencyName", e.target.value)} placeholder="Contact name" />
            </Field>
            <Field label="Relationship" error={errors.emergencyRelation}>
              <Input value={form.emergencyRelation} onChange={(e) => update("emergencyRelation", e.target.value)} placeholder="e.g. Spouse, Parent" />
            </Field>
            <Field label="Phone" error={errors.emergencyPhone}>
              <Input value={form.emergencyPhone} onChange={(e) => update("emergencyPhone", e.target.value)} placeholder="+880..." />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Rates & Compensation */}
      <Card>
        <CardHeader>
          <CardTitle>Rates & Compensation</CardTitle>
          <CardDescription>
            Exchange rate: 1 {currency} = {rate} BDT · {hrs} hrs/month
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bill Rate — read only, from rate config */}
          {billRateCad !== null && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Client Bill Rate</p>
                  <p className="text-sm text-muted-foreground mt-0.5">What the client pays OonkoO per hour</p>
                </div>
                <div className="text-right tabular-nums">
                  <p className="text-lg font-semibold">{cad(bill)}/hr</p>
                  <p className="text-sm text-muted-foreground">{bdt(bill * rate)}/hr</p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between border-t pt-2 text-sm">
                <span className="text-muted-foreground">Monthly revenue</span>
                <span className="tabular-nums font-medium">{cad(monthlyRevenueCad)} · {bdt(monthlyRevenueBdt)}</span>
              </div>
            </div>
          )}

          {/* Pay Rate — editable */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Cost Basis Rate (Pay Rate)</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                The &quot;on-paper&quot; CAD rate used to calculate gross profit and agent split. <strong>Not</strong> what the employee receives.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 items-start">
              <Field label="" error={errors.payRateCad}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">C$</span>
                  <Input
                    type="number" step="0.01" min="0"
                    value={form.payRateCad}
                    onChange={(e) => update("payRateCad", e.target.value)}
                    className="pl-9 tabular-nums"
                    placeholder="2.00"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  per hour{defaultPayRateCad !== null && maxPayRateCad !== null &&
                    ` · Default: ${cad(defaultPayRateCad)} · Max: ${cad(maxPayRateCad)}`}
                </p>
              </Field>
              <div className="rounded-md border bg-muted/20 p-3 tabular-nums text-sm">
                <p><span className="text-muted-foreground">Monthly:</span> <span className="font-medium">{cad(monthlyCostCad)}</span></p>
                <p><span className="text-muted-foreground">In BDT:</span> <span className="font-medium">{bdt(monthlyCostBdt)}</span></p>
              </div>
            </div>
          </div>

          {/* Actual Salary BDT — editable */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Actual Employee Salary</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                The real amount paid to the employee in Bangladesh each month. The gap between this and the cost basis is your <strong>Role Revised Saving</strong>.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 items-start">
              <Field label="" error={errors.actualSalaryBdt}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">৳</span>
                  <Input
                    type="number" step="1" min="0"
                    value={form.actualSalaryBdt}
                    onChange={(e) => update("actualSalaryBdt", e.target.value)}
                    className="pl-8 tabular-nums"
                    placeholder="20000"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">BDT per month</p>
              </Field>
              <div className="rounded-md border bg-muted/20 p-3 tabular-nums text-sm">
                <p><span className="text-muted-foreground">In CAD:</span> <span className="font-medium">{cad(actualSalaryCad)}/mo</span></p>
                <p><span className="text-muted-foreground">In CAD/hr:</span> <span className="font-medium">{cad(actualSalaryCad / hrs)}/hr</span></p>
              </div>
            </div>
          </div>

          {/* Full Breakdown */}
          {payRate > 0 && actualBdt > 0 && bill > 0 && (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Info className="size-4 text-muted-foreground" />
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Monthly Profit Breakdown (per employee)</p>
              </div>
              <div className="space-y-1 text-sm tabular-nums">
                <Row label="Revenue (client pays)" cadVal={monthlyRevenueCad} bdtVal={monthlyRevenueBdt} rate={rate} />
                <Row label="Cost basis (pay rate)" cadVal={-monthlyCostCad} bdtVal={-monthlyCostBdt} rate={rate} negative />
                <div className="border-t my-2" />
                <Row label="Gross Profit" cadVal={grossProfitCad} bdtVal={grossProfitBdt} rate={rate} bold />
                <div className="border-t my-2" />
                <Row label="Cost basis in BDT" cadVal={monthlyCostCad} bdtVal={monthlyCostBdt} rate={rate} muted />
                <Row label="Actual salary" cadVal={-actualSalaryCad} bdtVal={-actualBdt} rate={rate} negative />
                <div className="border-t my-2" />
                <Row
                  label="Role Revised Saving (owner only)"
                  cadVal={roleRevisedCad}
                  bdtVal={roleRevisedBdt}
                  rate={rate}
                  bold
                  highlight={roleRevisedBdt >= 0 ? "green" : "red"}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</> : "Save Changes"}
        </Button>
        <Button variant="outline" onClick={() => router.push(`/dashboard/employees/${employee.id}`)} disabled={isSaving}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function Row({ label, cadVal, bdtVal, bold, negative, muted, highlight }: {
  label: string; cadVal: number; bdtVal: number; rate: number;
  bold?: boolean; negative?: boolean; muted?: boolean;
  highlight?: "green" | "red";
}) {
  const colorCls = highlight === "green" ? "text-emerald-600" : highlight === "red" ? "text-destructive" : negative ? "text-muted-foreground" : "";
  const weightCls = bold ? "font-semibold" : muted ? "text-muted-foreground" : "";
  return (
    <div className={`flex items-center justify-between ${weightCls}`}>
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <div className={`flex gap-6 ${colorCls}`}>
        <span className="w-28 text-right">{negative ? "−" : ""}{cad(Math.abs(cadVal))}</span>
        <span className="w-28 text-right">{negative ? "−" : ""}{bdt(Math.abs(bdtVal))}</span>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
