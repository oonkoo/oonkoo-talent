"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Loader2, Lock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateRevenue, type EmployeeInput, type RevenueConfig } from "@/lib/revenue-calculator";
import { saveOwnerReportPreferences, type InvoiceFull } from "../../actions";

function cad(n: number) {
  return `C$${n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function bdt(n: number) {
  return `৳${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function OwnerReport({ invoice }: { invoice: InvoiceFull }) {
  const [roleRevisedEnabled, setRoleRevisedEnabled] = useState(invoice.roleRevisedEnabled);
  const [fxAdvantageEnabled, setFxAdvantageEnabled] = useState(invoice.fxAdvantageEnabled);
  const [sendingRate, setSendingRate] = useState(String(Number(invoice.sendingRateBdt)));
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  const agreedRate = Number(invoice.agreedRateBdt);
  const sr = parseFloat(sendingRate) || agreedRate;

  // Build inputs from line items and recalculate client-side
  const employees: EmployeeInput[] = useMemo(() =>
    invoice.lineItems.map((li) => ({
      id: li.employeeId,
      billRateCad: Number(li.billRateCad),
      payRateCad: Number(li.payRateCad),
      hoursPerMonth: Number(li.hours),
      actualSalaryBdt: Number(li.actualSalaryBdt),
    })), [invoice.lineItems]);

  const config: RevenueConfig = useMemo(() => ({
    agreedRateBdt: agreedRate,
    sendingRateBdt: sr,
    agentSplitPct: Number(invoice.agentSharePct ?? 0) / 100,
    roleRevisedEnabled,
    fxAdvantageEnabled,
  }), [agreedRate, sr, invoice.agentSharePct, roleRevisedEnabled, fxAdvantageEnabled]);

  const result = useMemo(() => calculateRevenue(employees, config), [employees, config]);

  // Calculate deltas for toggle annotations
  const baseResult = useMemo(() => calculateRevenue(employees, {
    ...config, roleRevisedEnabled: false, fxAdvantageEnabled: false,
  }), [employees, config]);

  const roleRevisedDelta = result.roleRevisedSavingCad;
  const fxDelta = result.fxAdvantageCad;

  const isDirty =
    roleRevisedEnabled !== invoice.roleRevisedEnabled ||
    fxAdvantageEnabled !== invoice.fxAdvantageEnabled ||
    sr !== Number(invoice.sendingRateBdt);

  async function handleSave() {
    setSaveState("saving");
    try {
      await saveOwnerReportPreferences(invoice.id, {
        roleRevisedEnabled,
        fxAdvantageEnabled,
        sendingRateBdt: sr,
      });
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      toast.error("Failed to save preferences");
      setSaveState("idle");
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Badge variant="outline" className="text-muted-foreground">
        <Lock className="mr-1.5 size-3" />
        This report is private and never shared
      </Badge>

      {/* Earnings Waterfall */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Breakdown</CardTitle>
          <CardDescription>
            {invoice.company.name} · {invoice.periodLabel} · 1 {invoice.company.currency} = {agreedRate} BDT
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="space-y-1 text-sm" aria-label="Owner earnings breakdown">
            <WaterfallRow label="Gross Profit" cad={result.grossProfitCad} rate={agreedRate} bold />

            {Number(invoice.agentSharePct) > 0 && (
              <WaterfallRow
                label={`Agent Share — ${invoice.agent?.name ?? "Agent"} (${Number(invoice.agentSharePct)}%)`}
                cad={-result.agentShareCad}
                rate={agreedRate}
                negative
              />
            )}

            <div className="border-t my-3" />
            <WaterfallRow label="Owner Base Share" cad={result.ownerBaseShareCad} rate={agreedRate} bold />

            <div className="border-t my-3" />

            {/* Role Revised Toggle */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Switch
                  checked={roleRevisedEnabled}
                  onCheckedChange={setRoleRevisedEnabled}
                  id="role-revised"
                />
                <Label htmlFor="role-revised" className="cursor-pointer">
                  Role Revised Saving
                </Label>
                {roleRevisedEnabled && roleRevisedDelta !== 0 && (
                  <span className={`text-xs font-medium tabular-nums ${roleRevisedDelta >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                    {roleRevisedDelta >= 0 ? "+" : ""}{cad(roleRevisedDelta)}
                  </span>
                )}
              </div>
              <span className={`tabular-nums font-medium ${!roleRevisedEnabled ? "text-muted-foreground line-through opacity-40" : ""}`}>
                {cad(result.roleRevisedSavingCad)} · {bdt(result.roleRevisedSavingCad * agreedRate)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground ml-12 -mt-1 mb-2">
              Gap between pay-rate equivalent BDT and actual salary paid
            </p>

            {/* FX Advantage Toggle */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Switch
                  checked={fxAdvantageEnabled}
                  onCheckedChange={setFxAdvantageEnabled}
                  id="fx-advantage"
                />
                <Label htmlFor="fx-advantage" className="cursor-pointer">
                  FX Advantage
                </Label>
                {fxAdvantageEnabled && fxDelta !== 0 && (
                  <span className={`text-xs font-medium tabular-nums ${fxDelta >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                    {fxDelta >= 0 ? "+" : ""}{cad(fxDelta)}
                  </span>
                )}
              </div>
              <span className={`tabular-nums font-medium ${!fxAdvantageEnabled ? "text-muted-foreground line-through opacity-40" : ""}`}>
                {cad(result.fxAdvantageCad)} · {bdt(result.fxAdvantageCad * agreedRate)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground ml-12 -mt-1 mb-2">
              Agreed {agreedRate}, sending {sr} — {sr > agreedRate ? "favorable" : sr < agreedRate ? "unfavorable" : "no difference"}
            </p>

            <div className="border-t-2 border-foreground my-3" />

            {/* Owner Total */}
            <div className="flex items-center justify-between py-2" aria-live="polite" aria-atomic="true">
              <span className="text-base font-bold">Owner Total</span>
              <div className="text-right">
                <p className="text-xl font-bold tabular-nums text-emerald-600">{cad(result.ownerTotalCad)}</p>
                <p className="text-sm tabular-nums text-muted-foreground">{bdt(result.ownerTotalBdt)}</p>
              </div>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Sending Rate Input */}
      <Card>
        <CardHeader>
          <CardTitle>Sending Rate</CardTitle>
          <CardDescription>The actual market rate when transferring salaries</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="space-y-2 flex-1 max-w-xs">
              <Label>Sending Rate (BDT per 1 {invoice.company.currency})</Label>
              <Input
                type="number"
                step="0.01"
                value={sendingRate}
                onChange={(e) => setSendingRate(e.target.value)}
                className="tabular-nums"
              />
            </div>
            <div className="rounded-md border bg-muted/30 p-3 text-sm tabular-nums">
              <p><span className="text-muted-foreground">Agreed rate:</span> {agreedRate}</p>
              <p><span className="text-muted-foreground">Difference:</span>{" "}
                <span className={sr > agreedRate ? "text-emerald-600" : sr < agreedRate ? "text-destructive" : ""}>
                  {sr > agreedRate ? "+" : ""}{(sr - agreedRate).toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={!isDirty || saveState === "saving"}>
          {saveState === "saving" ? (
            <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</>
          ) : saveState === "saved" ? (
            <><Check className="mr-2 size-4" />Saved</>
          ) : (
            "Save Preferences"
          )}
        </Button>
        {isDirty && saveState === "idle" && (
          <span className="text-xs text-muted-foreground">Unsaved changes</span>
        )}
      </div>
    </div>
  );
}

function WaterfallRow({ label, cad: cadVal, rate, bold, negative }: {
  label: string; cad: number; rate: number;
  bold?: boolean; negative?: boolean;
}) {
  const colorCls = negative ? "text-muted-foreground" : "";
  const weightCls = bold ? "font-semibold" : "";
  const sign = negative ? "−" : "";
  const abs = Math.abs(cadVal);
  return (
    <div className={`flex items-center justify-between py-1 ${weightCls}`}>
      <span className={negative ? "text-muted-foreground" : ""}>{label}</span>
      <div className={`flex gap-6 tabular-nums ${colorCls}`}>
        <span className="w-28 text-right">{sign}{cad(abs)}</span>
        <span className="w-28 text-right text-muted-foreground">{sign}{bdt(Math.abs(cadVal * rate))}</span>
      </div>
    </div>
  );
}
