"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, AlertTriangle, Trash2 } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { updateCompany, deleteCompany, type CompanyFull } from "../../actions";

const currencies = ["CAD", "USD", "GBP", "EUR", "BDT"];

export function EditCompanyForm({ company }: { company: CompanyFull }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const originalRate = Number(company.agreedRateBdt);

  const initial = useMemo(
    () => ({
      name: company.name,
      country: company.country,
      currency: company.currency,
      contactName: company.contactName,
      contactEmail: company.contactEmail,
      billingAddress: company.billingAddress ?? "",
      agreedRateBdt: originalRate,
      agentEnabled: company.agentEnabled,
    }),
    [company, originalRate],
  );

  const [form, setForm] = useState(initial);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const rateChanged = form.agreedRateBdt !== originalRate;
  const isDirty =
    form.name !== initial.name ||
    form.country !== initial.country ||
    form.currency !== initial.currency ||
    form.contactName !== initial.contactName ||
    form.contactEmail !== initial.contactEmail ||
    form.billingAddress !== initial.billingAddress ||
    form.agreedRateBdt !== initial.agreedRateBdt ||
    form.agentEnabled !== initial.agentEnabled;

  const activeEmployeeCount = company._count.employees;
  const activeAgentCount = company.agents.length;
  const canConfirmDelete = deleteConfirm.trim() === company.name;

  function update(field: string, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit() {
    if (!isDirty) return;
    startTransition(async () => {
      try {
        const { slug } = await updateCompany(company.slug, {
          ...form,
          billingAddress: form.billingAddress || undefined,
        });
        toast.success(`${form.name} updated`);
        router.push(`/dashboard/companies/${slug}`);
        router.refresh();
      } catch {
        toast.error("Failed to update company");
      }
    });
  }

  function handleDelete() {
    if (!canConfirmDelete) return;
    startDeleteTransition(async () => {
      try {
        await deleteCompany(company.slug);
        toast.success(`${company.name} deleted`);
        router.push("/dashboard/companies");
        router.refresh();
      } catch {
        toast.error("Failed to delete company");
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

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Delete this company</p>
            <p className="text-xs text-muted-foreground">
              Permanently removes the company and cascades to its agents, rate configs, employees, and invoice batches. This cannot be undone.
            </p>
          </div>
          <AlertDialog
            onOpenChange={(open) => {
              if (!open) setDeleteConfirm("");
            }}
          >
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                <Trash2 className="mr-2 size-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {company.name}?</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-3">
                    <p>
                      This will permanently remove the company and everything attached to it. Cascade includes:
                    </p>
                    <ul className="list-disc pl-5 text-sm">
                      <li>
                        <span className="tabular-nums font-medium">{activeAgentCount}</span> active agent{activeAgentCount === 1 ? "" : "s"}
                      </li>
                      <li>
                        <span className="tabular-nums font-medium">{activeEmployeeCount}</span> active employee{activeEmployeeCount === 1 ? "" : "s"} (with their documents)
                      </li>
                      <li>All rate configs and invoice batches for this company</li>
                    </ul>
                    <p>
                      Type <span className="font-mono font-medium">{company.name}</span> to confirm.
                    </p>
                    <Input
                      autoFocus
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder={company.name}
                    />
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete();
                  }}
                  disabled={!canConfirmDelete || isDeleting}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <><Loader2 className="mr-2 size-4 animate-spin" />Deleting...</>
                  ) : (
                    "Delete company"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/companies/${company.slug}`)}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isPending || !isDirty}>
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
