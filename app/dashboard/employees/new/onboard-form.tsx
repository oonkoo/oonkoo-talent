"use client";

import { useState, useTransition } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { createEmployee } from "../actions";
import type { CompanyWithRoles, RoleOption } from "../actions";

const schema = z.object({
  companyId: z.string().min(1, "Company is required"),
  roleId: z.string().min(1, "Role is required"),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
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
  payRateCad: z.coerce
    .number({ error: "Must be a positive number" })
    .positive("Pay rate must be positive"),
  actualSalaryBdt: z.coerce
    .number({ error: "Must be a positive number" })
    .positive("Salary must be positive"),
  startDate: z.string().min(1, "Start date is required"),
});

type FormValues = z.infer<typeof schema>;
type FieldErrors = Record<string, string>;

interface OnboardFormProps {
  companies: CompanyWithRoles[];
  allRoles: RoleOption[];
}

export function OnboardForm({ companies, allRoles }: OnboardFormProps) {
  const [isPending, startTransition] = useTransition();
  const [bankOpen, setBankOpen] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [payRateError, setPayRateError] = useState<string | null>(null);

  const [form, setForm] = useState<FormValues>({
    companyId: "",
    roleId: "",
    fullName: "",
    email: "",
    phone: "",
    nidNumber: "",
    passportNumber: "",
    address: "",
    bankAccountNumber: "",
    bankName: "",
    bankAccountHolder: "",
    bankBranchName: "",
    emergencyName: "",
    emergencyRelation: "",
    emergencyPhone: "",
    payRateCad: 0,
    actualSalaryBdt: 0,
    startDate: "",
  });

  const selectedCompany = companies.find((c) => c.id === form.companyId);
  const companyRateConfigs = selectedCompany?.rateConfigs ?? [];
  const selectedRateConfig = companyRateConfigs.find((rc) => rc.roleId === form.roleId);

  function update(field: keyof FormValues, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });

    if (field === "payRateCad") {
      const num = Number(value);
      if (selectedRateConfig && Number(selectedRateConfig.maxPayRateCad) > 0 && num > Number(selectedRateConfig.maxPayRateCad)) {
        setPayRateError(
          `Exceeds maximum of C$${Number(selectedRateConfig.maxPayRateCad).toFixed(2)}/hr`
        );
      } else {
        setPayRateError(null);
      }
    }
  }

  function handleCompanyChange(companyId: string) {
    const company = companies.find((c) => c.id === companyId);
    const rcs = company?.rateConfigs ?? [];
    const autoRoleId = allRoles.length === 1 ? allRoles[0].id : "";
    const autoRc = rcs.find((rc) => rc.roleId === autoRoleId);
    setForm((prev) => ({
      ...prev,
      companyId,
      roleId: autoRoleId,
      payRateCad: autoRc ? Number(autoRc.defaultPayRateCad) : prev.payRateCad,
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.companyId;
      delete next.roleId;
      return next;
    });
    setPayRateError(null);
  }

  function handleRoleChange(roleId: string) {
    const rc = companyRateConfigs.find((r) => r.roleId === roleId);
    setForm((prev) => ({
      ...prev,
      roleId,
      payRateCad: rc ? Number(rc.defaultPayRateCad) : prev.payRateCad,
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.roleId;
      return next;
    });
    setPayRateError(null);
  }

  function handlePayRateChange(value: string) {
    const num = Number(value);
    setForm((prev) => ({ ...prev, payRateCad: num }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.payRateCad;
      return next;
    });
    if (selectedRateConfig && Number(selectedRateConfig.maxPayRateCad) > 0 && num > Number(selectedRateConfig.maxPayRateCad)) {
      setPayRateError(
        `Exceeds maximum of C$${Number(selectedRateConfig.maxPayRateCad).toFixed(2)}/hr`
      );
    } else {
      setPayRateError(null);
    }
  }

  function handleSubmit() {
    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    if (payRateError) return;

    startTransition(async () => {
      try {
        await createEmployee({
          companyId: result.data.companyId,
          roleId: result.data.roleId,
          fullName: result.data.fullName,
          email: result.data.email,
          phone: result.data.phone || undefined,
          nidNumber: result.data.nidNumber || undefined,
          passportNumber: result.data.passportNumber || undefined,
          address: result.data.address || undefined,
          bankAccountNumber: result.data.bankAccountNumber || undefined,
          bankName: result.data.bankName || undefined,
          bankAccountHolder: result.data.bankAccountHolder || undefined,
          bankBranchName: result.data.bankBranchName || undefined,
          emergencyName: result.data.emergencyName || undefined,
          emergencyRelation: result.data.emergencyRelation || undefined,
          emergencyPhone: result.data.emergencyPhone || undefined,
          payRateCad: result.data.payRateCad,
          actualSalaryBdt: result.data.actualSalaryBdt,
          startDate: result.data.startDate,
        });
        toast.success(`${result.data.fullName} onboarded successfully`);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to onboard employee";
        toast.error(message);
      }
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Employment Section */}
      <Card>
        <CardHeader>
          <CardTitle>Employment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Company" error={errors.companyId}>
            <Select value={form.companyId} onValueChange={handleCompanyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Role" error={errors.roleId}>
            <Select
              value={form.roleId}
              onValueChange={handleRoleChange}
              disabled={!form.companyId}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    form.companyId ? "Select a role" : "Select a company first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {allRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Pay Rate (C$/hr)" error={errors.payRateCad}>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.payRateCad || ""}
                onChange={(e) => handlePayRateChange(e.target.value)}
                className={cn(payRateError && "border-destructive focus-visible:ring-destructive/20")}
              />
              {selectedRateConfig && !payRateError && (
                <p className="text-xs text-muted-foreground mt-1">
                  Default: C${Number(selectedRateConfig.defaultPayRateCad).toFixed(2)} · Max: C${Number(selectedRateConfig.maxPayRateCad).toFixed(2)}
                </p>
              )}
              {payRateError && (
                <p className="text-sm text-destructive mt-1">{payRateError}</p>
              )}
            </Field>

            <Field label="Salary (BDT)" error={errors.actualSalaryBdt}>
              <Input
                type="number"
                step="1"
                min="0"
                value={form.actualSalaryBdt || ""}
                onChange={(e) => update("actualSalaryBdt", e.target.value)}
              />
            </Field>
          </div>

          <Field label="Start Date" error={errors.startDate}>
            <Input
              type="date"
              value={form.startDate}
              onChange={(e) => update("startDate", e.target.value)}
            />
          </Field>
        </CardContent>
      </Card>

      {/* Personal Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Full Name" error={errors.fullName}>
            <Input
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="e.g. Rafiqul Islam"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Email" error={errors.email}>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="e.g. rafiq@example.com"
              />
            </Field>
            <Field label="Phone" error={errors.phone}>
              <Input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="e.g. +880 1700-000000"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="NID Number" error={errors.nidNumber}>
              <Input
                value={form.nidNumber}
                onChange={(e) => update("nidNumber", e.target.value)}
                placeholder="National ID number"
              />
            </Field>
            <Field label="Passport Number" error={errors.passportNumber}>
              <Input
                value={form.passportNumber}
                onChange={(e) => update("passportNumber", e.target.value)}
                placeholder="Passport number"
              />
            </Field>
          </div>
          <Field label="Address" error={errors.address}>
            <Input
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="Full address"
            />
          </Field>
        </CardContent>
      </Card>

      {/* Bank Details — collapsible */}
      <Card>
        <button
          type="button"
          onClick={() => setBankOpen((o) => !o)}
          className="flex w-full items-center justify-between px-6 py-4 text-left"
        >
          <span className="text-base font-semibold">Bank Details</span>
          {bankOpen ? (
            <ChevronDown className="size-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 text-muted-foreground" />
          )}
        </button>

        <div
          className="grid transition-[grid-template-rows] duration-150 ease-out"
          style={{ gridTemplateRows: bankOpen ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <CardContent className="space-y-4 pt-0">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Bank Account Number" error={errors.bankAccountNumber}>
                  <Input
                    value={form.bankAccountNumber}
                    onChange={(e) => update("bankAccountNumber", e.target.value)}
                    placeholder="e.g. 1234567890"
                  />
                </Field>
                <Field label="Bank Name" error={errors.bankName}>
                  <Input
                    value={form.bankName}
                    onChange={(e) => update("bankName", e.target.value)}
                    placeholder="e.g. Dutch-Bangla Bank"
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Account Holder's Name" error={errors.bankAccountHolder}>
                  <Input
                    value={form.bankAccountHolder}
                    onChange={(e) => update("bankAccountHolder", e.target.value)}
                    placeholder="Name on the account"
                  />
                </Field>
                <Field label="Branch Name" error={errors.bankBranchName}>
                  <Input
                    value={form.bankBranchName}
                    onChange={(e) => update("bankBranchName", e.target.value)}
                    placeholder="e.g. Gulshan Branch"
                  />
                </Field>
              </div>
            </CardContent>
          </div>
        </div>
      </Card>

      {/* Emergency Contact — optional */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Name" error={errors.emergencyName}>
              <Input
                value={form.emergencyName}
                onChange={(e) => update("emergencyName", e.target.value)}
                placeholder="Contact name"
              />
            </Field>
            <Field label="Relationship" error={errors.emergencyRelation}>
              <Input
                value={form.emergencyRelation}
                onChange={(e) => update("emergencyRelation", e.target.value)}
                placeholder="e.g. Spouse, Parent"
              />
            </Field>
            <Field label="Phone" error={errors.emergencyPhone}>
              <Input
                value={form.emergencyPhone}
                onChange={(e) => update("emergencyPhone", e.target.value)}
                placeholder="+880..."
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Onboarding...
            </>
          ) : (
            "Onboard Employee"
          )}
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
