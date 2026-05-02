"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LeadStatus } from "@/lib/generated/prisma/enums";
import {
  addLeadNote,
  convertLeadToCompany,
  updateLeadStatus,
} from "../actions";

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "CONVERTED", label: "Converted" },
  { value: "REJECTED", label: "Rejected" },
];

export function LeadStatusSelect({
  leadId,
  current,
  disabled,
}: {
  leadId: string;
  current: LeadStatus;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState<LeadStatus>(current);

  return (
    <Select
      value={value}
      disabled={disabled || pending}
      onValueChange={(next) => {
        const status = next as LeadStatus;
        setValue(status);
        startTransition(async () => {
          await updateLeadStatus(leadId, status);
        });
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            disabled={opt.value === "CONVERTED" && current !== "CONVERTED"}
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function AddNoteForm({ leadId }: { leadId: string }) {
  const [pending, startTransition] = useTransition();
  const [body, setBody] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!body.trim()) return;
        startTransition(async () => {
          await addLeadNote(leadId, body);
          setBody("");
        });
      }}
      className="space-y-2"
    >
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a note for yourself…"
        rows={3}
        disabled={pending}
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={pending || !body.trim()}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : "Add note"}
        </Button>
      </div>
    </form>
  );
}

export function LeadConvertDialog({
  leadId,
  companyName,
}: {
  leadId: string;
  companyName: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [country, setCountry] = useState("");
  const [agreedRate, setAgreedRate] = useState("");
  const [billingAddress, setBillingAddress] = useState("");

  function reset() {
    setCountry("");
    setAgreedRate("");
    setBillingAddress("");
    setError(null);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>Convert to company</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convert {companyName} to a Company</DialogTitle>
          <DialogDescription>
            This creates a new Company record and links it back to this lead.
            Country and agreed BDT rate are required to complete the company setup.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const rate = Number(agreedRate);
            if (!country.trim()) {
              setError("Country is required.");
              return;
            }
            if (!Number.isFinite(rate) || rate <= 0) {
              setError("Agreed rate must be a positive number.");
              return;
            }
            setError(null);
            startTransition(async () => {
              try {
                await convertLeadToCompany(leadId, {
                  country: country.trim(),
                  agreedRateBdt: rate,
                  billingAddress: billingAddress.trim() || undefined,
                });
                // Server action redirects on success — code below won't run.
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : "Conversion failed.",
                );
              }
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="United States"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agreedRate">Agreed BDT rate (1 CAD = ? BDT)</Label>
            <Input
              id="agreedRate"
              type="number"
              step="0.01"
              value={agreedRate}
              onChange={(e) => setAgreedRate(e.target.value)}
              placeholder="88.00"
            />
            <p className="text-xs text-muted-foreground">
              The exchange rate quoted to this client; used everywhere downstream.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingAddress">Billing address (optional)</Label>
            <Textarea
              id="billingAddress"
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              rows={3}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Converting…
                </>
              ) : (
                "Create company"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
