"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createCompany } from "./actions";
import { step1Schema, step2Schema, step3Schema, type CompanyFormValues } from "./schema";

const steps = ["Basic Info", "Contract", "Agent"];
const currencies = ["CAD", "USD", "GBP", "EUR", "BDT"];

type FieldErrors = Record<string, string>;

export function CompanyWizard() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<CompanyFormValues>({
    name: "",
    country: "",
    currency: "CAD",
    contactName: "",
    contactEmail: "",
    billingAddress: "",
    agreedRateBdt: 0,
    agentEnabled: false,
    agentName: "",
    agentEmail: "",
    agentPhone: "",
    agentRevenueSharePct: 50,
    agentNotes: "",
  });

  function update(field: keyof CompanyFormValues, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validateStep(): boolean {
    const schemas = [step1Schema, step2Schema, step3Schema];
    const result = schemas[step].safeParse(form);
    if (result.success) {
      setErrors({});
      return true;
    }
    const fieldErrors: FieldErrors = {};
    for (const issue of result.error.issues) {
      fieldErrors[issue.path[0] as string] = issue.message;
    }
    setErrors(fieldErrors);
    return false;
  }

  function goNext() {
    if (!validateStep()) return;
    setDirection("forward");
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function goBack() {
    setDirection("back");
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }

  function handleSubmit() {
    if (!validateStep()) return;
    startTransition(async () => {
      try {
        await createCompany(form);
        toast.success(`${form.name} created successfully`);
      } catch (err) {
        if (typeof err === "object" && err !== null && "digest" in err) throw err;
        toast.error("Failed to create company");
      }
    });
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Stepper */}
      <div className="flex items-center gap-2">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            {i > 0 && <div className="h-px w-8 bg-border" />}
            <button
              onClick={() => {
                if (i < step) {
                  setDirection("back");
                  setErrors({});
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
          direction === "forward" ? "slide-in-from-right-2 fade-in" : "slide-in-from-left-2 fade-in"
        )}
      >
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Company Name" error={errors.name}>
                <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Flow Technologies" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Country" error={errors.country}>
                  <Input value={form.country} onChange={(e) => update("country", e.target.value)} placeholder="e.g. Canada" />
                </Field>
                <Field label="Currency" error={errors.currency}>
                  <Select value={form.currency} onValueChange={(v) => update("currency", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {currencies.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Contact Name" error={errors.contactName}>
                <Input value={form.contactName} onChange={(e) => update("contactName", e.target.value)} />
              </Field>
              <Field label="Contact Email" error={errors.contactEmail}>
                <Input type="email" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} />
              </Field>
              <Field label="Billing Address" error={errors.billingAddress}>
                <Textarea value={form.billingAddress} onChange={(e) => update("billingAddress", e.target.value)} rows={2} />
              </Field>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Contract Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Agreed Exchange Rate (BDT per 1 unit of currency)" error={errors.agreedRateBdt}>
                <Input
                  type="number"
                  step="0.0001"
                  value={form.agreedRateBdt || ""}
                  onChange={(e) => update("agreedRateBdt", e.target.value)}
                  placeholder="e.g. 88.0000"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This rate is used on all company and agent invoice documents.
                </p>
              </Field>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Agent Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.agentEnabled}
                  onCheckedChange={(v) => {
                    update("agentEnabled", v);
                    if (!v) {
                      setForm((prev) => ({
                        ...prev,
                        agentName: "",
                        agentEmail: "",
                        agentPhone: "",
                        agentRevenueSharePct: 50,
                        agentNotes: "",
                      }));
                    }
                  }}
                  id="agent-toggle"
                />
                <Label htmlFor="agent-toggle">This company has an agent</Label>
              </div>

              <div
                className="grid transition-[grid-template-rows] duration-150 ease-out"
                style={{ gridTemplateRows: form.agentEnabled ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <div className="space-y-4 pt-2">
                    <Field label="Agent Name" error={errors.agentName}>
                      <Input value={form.agentName} onChange={(e) => update("agentName", e.target.value)} />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Email" error={errors.agentEmail}>
                        <Input type="email" value={form.agentEmail} onChange={(e) => update("agentEmail", e.target.value)} />
                      </Field>
                      <Field label="Phone" error={errors.agentPhone}>
                        <Input value={form.agentPhone} onChange={(e) => update("agentPhone", e.target.value)} />
                      </Field>
                    </div>
                    <Field label="Revenue Share (%)" error={errors.agentRevenueSharePct}>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={form.agentRevenueSharePct ?? ""}
                        onChange={(e) => update("agentRevenueSharePct", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Percentage of gross profit shared with the agent.
                      </p>
                    </Field>
                    <Field label="Notes" error={errors.agentNotes}>
                      <Textarea value={form.agentNotes} onChange={(e) => update("agentNotes", e.target.value)} rows={2} />
                    </Field>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {step > 0 ? (
          <Button variant="outline" onClick={goBack}>
            <ArrowLeft className="mr-2 size-4" /> Back
          </Button>
        ) : (
          <div />
        )}
        {step < steps.length - 1 ? (
          <Button onClick={goNext}>
            Next <ArrowRight className="ml-2 size-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <><Loader2 className="mr-2 size-4 animate-spin" />Creating...</>
            ) : (
              "Create Company"
            )}
          </Button>
        )}
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
