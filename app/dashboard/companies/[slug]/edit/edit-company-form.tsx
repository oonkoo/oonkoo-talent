"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateCompany, type CompanyFull } from "../../actions";

const currencies = ["CAD", "USD", "GBP", "EUR", "BDT"];

export function EditCompanyForm({ company }: { company: CompanyFull }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const originalRate = Number(company.agreedRateBdt);

  const [form, setForm] = useState({
    name: company.name,
    country: company.country,
    currency: company.currency,
    contactName: company.contactName,
    contactEmail: company.contactEmail,
    billingAddress: company.billingAddress ?? "",
    agreedRateBdt: originalRate,
    agentEnabled: company.agentEnabled,
  });

  const rateChanged = form.agreedRateBdt !== originalRate;

  function update(field: string, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit() {
    startTransition(async () => {
      try {
        await updateCompany(company.slug, {
          ...form,
          billingAddress: form.billingAddress || undefined,
        });
        toast.success(`${form.name} updated`);
        router.push(`/dashboard/companies/${form.name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/-+/g, "-")}`);
        router.refresh();
      } catch {
        toast.error("Failed to update company");
      }
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Country</Label>
              <Input value={form.country} onChange={(e) => update("country", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={form.currency} onValueChange={(v) => update("currency", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Contact Name</Label>
            <Input value={form.contactName} onChange={(e) => update("contactName", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Contact Email</Label>
            <Input type="email" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Billing Address</Label>
            <Textarea value={form.billingAddress} onChange={(e) => update("billingAddress", e.target.value)} rows={2} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contract</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Agreed Exchange Rate (BDT)</Label>
            <Input
              type="number"
              step="0.0001"
              value={form.agreedRateBdt}
              onChange={(e) => update("agreedRateBdt", parseFloat(e.target.value) || 0)}
            />
            {rateChanged && (
              <div className="flex items-center gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                <AlertTriangle className="size-4 shrink-0" />
                This affects all future invoice calculations.
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={form.agentEnabled}
              onCheckedChange={(v) => update("agentEnabled", v)}
              id="agent-toggle"
            />
            <Label htmlFor="agent-toggle">Agent enabled</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/companies/${company.slug}`)}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? (
            <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
