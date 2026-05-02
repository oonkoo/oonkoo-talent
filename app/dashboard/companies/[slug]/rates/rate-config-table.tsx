"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { upsertRateConfig, deleteRateConfig } from "@/app/dashboard/companies/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Role = {
  id: string;
  title: string;
};

type DecimalLike = number | { toNumber(): number };

type RateConfig = {
  id: string;
  roleId: string;
  billRateCad: DecimalLike;
  defaultPayRateCad: DecimalLike;
  maxPayRateCad: DecimalLike;
  hoursPerMonth: DecimalLike;
  role: Role;
};

type RowState = {
  billRateCad: string;
  defaultPayRateCad: string;
  maxPayRateCad: string;
  hoursPerMonth: string;
};

type Props = {
  companyId: string;
  rateConfigs: RateConfig[];
  roles: Role[];
};

function toDecimal(v: DecimalLike): number {
  return typeof v === "number" ? v : Number(v);
}

function toRowState(rc: RateConfig): RowState {
  return {
    billRateCad: String(toDecimal(rc.billRateCad)),
    defaultPayRateCad: String(toDecimal(rc.defaultPayRateCad)),
    maxPayRateCad: String(toDecimal(rc.maxPayRateCad)),
    hoursPerMonth: String(toDecimal(rc.hoursPerMonth)),
  };
}

export function RateConfigTable({ companyId, rateConfigs, roles }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState<RowState[]>(() => rateConfigs.map(toRowState));
  const [configs, setConfigs] = useState<RateConfig[]>(rateConfigs);

  // Pending save: index of the row waiting for confirmation
  const [pendingSave, setPendingSave] = useState<number | null>(null);
  const [saving, setSaving] = useState<number | null>(null);

  // New row being added
  const [addingRoleId, setAddingRoleId] = useState<string | null>(null);
  const [newRow, setNewRow] = useState<RowState>({
    billRateCad: "",
    defaultPayRateCad: "",
    maxPayRateCad: "",
    hoursPerMonth: "",
  });
  const [pendingNewSave, setPendingNewSave] = useState(false);
  const [savingNew, setSavingNew] = useState(false);

  const configuredRoleIds = new Set(configs.map((c) => c.roleId));
  const availableRoles = roles.filter((r) => !configuredRoleIds.has(r.id));

  function updateRow(index: number, field: keyof RowState, value: string) {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  async function handleConfirmSave(index: number) {
    setSaving(index);
    setPendingSave(null);
    const config = configs[index];
    const row = rows[index];
    try {
      await upsertRateConfig(companyId, {
        id: config.id,
        roleId: config.roleId,
        billRateCad: Number(row.billRateCad),
        defaultPayRateCad: Number(row.defaultPayRateCad),
        maxPayRateCad: Number(row.maxPayRateCad),
        hoursPerMonth: Number(row.hoursPerMonth),
      });
      toast.success(`Rate for ${config.role.title} saved.`);
    } catch {
      toast.error("Failed to save rate config.");
    } finally {
      setSaving(null);
    }
  }

  async function handleConfirmNewSave() {
    if (!addingRoleId) return;
    setSavingNew(true);
    setPendingNewSave(false);
    try {
      await upsertRateConfig(companyId, {
        roleId: addingRoleId,
        billRateCad: Number(newRow.billRateCad),
        defaultPayRateCad: Number(newRow.defaultPayRateCad),
        maxPayRateCad: Number(newRow.maxPayRateCad),
        hoursPerMonth: Number(newRow.hoursPerMonth),
      });
      const role = roles.find((r) => r.id === addingRoleId)!;
      setAddingRoleId(null);
      setNewRow({ billRateCad: "", defaultPayRateCad: "", maxPayRateCad: "", hoursPerMonth: "" });
      toast.success(`Rate for ${role.title} created.`);
      router.refresh();
    } catch {
      toast.error("Failed to create rate config.");
    } finally {
      setSavingNew(false);
    }
  }

  async function handleDelete(index: number) {
    const config = configs[index];
    try {
      await deleteRateConfig(config.id);
      toast.success(`Rate for ${config.role.title} deleted.`);
      router.refresh();
    } catch {
      toast.error("Failed to delete rate config.");
    }
  }

  function monthlyRevenue(row: RowState) {
    const bill = Number(row.billRateCad) || 0;
    const hours = Number(row.hoursPerMonth) || 0;
    return (bill * hours).toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Bill Rate (C$/hr)</TableHead>
            <TableHead className="text-right">Default Pay Rate</TableHead>
            <TableHead className="text-right">Max Pay Rate</TableHead>
            <TableHead className="text-right">Hours/Month</TableHead>
            <TableHead className="text-right">Monthly Revenue</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {configs.map((config, i) => (
            <TableRow key={config.id}>
              <TableCell className="font-medium">{config.role.title}</TableCell>
              <TableCell className="text-right">
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={rows[i]?.billRateCad ?? ""}
                  onChange={(e) => updateRow(i, "billRateCad", e.target.value)}
                  className="w-24 text-right tabular-nums ml-auto"
                />
              </TableCell>
              <TableCell className="text-right">
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={rows[i]?.defaultPayRateCad ?? ""}
                  onChange={(e) => updateRow(i, "defaultPayRateCad", e.target.value)}
                  className="w-24 text-right tabular-nums ml-auto"
                />
              </TableCell>
              <TableCell className="text-right">
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={rows[i]?.maxPayRateCad ?? ""}
                  onChange={(e) => updateRow(i, "maxPayRateCad", e.target.value)}
                  className="w-24 text-right tabular-nums ml-auto"
                />
              </TableCell>
              <TableCell className="text-right">
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={rows[i]?.hoursPerMonth ?? ""}
                  onChange={(e) => updateRow(i, "hoursPerMonth", e.target.value)}
                  className="w-24 text-right tabular-nums ml-auto"
                />
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                C${rows[i] ? monthlyRevenue(rows[i]) : "—"}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={saving === i}
                    onClick={() => setPendingSave(i)}
                  >
                    {saving === i ? "Saving…" : "Save"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(i)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}

          {/* New row being added */}
          {addingRoleId && (
            <TableRow>
              <TableCell className="font-medium text-muted-foreground">
                {roles.find((r) => r.id === addingRoleId)?.title}
              </TableCell>
              <TableCell className="text-right">
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={newRow.billRateCad}
                  onChange={(e) => setNewRow((p) => ({ ...p, billRateCad: e.target.value }))}
                  className="w-24 text-right tabular-nums ml-auto"
                  placeholder="0.00"
                />
              </TableCell>
              <TableCell className="text-right">
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={newRow.defaultPayRateCad}
                  onChange={(e) => setNewRow((p) => ({ ...p, defaultPayRateCad: e.target.value }))}
                  className="w-24 text-right tabular-nums ml-auto"
                  placeholder="0.00"
                />
              </TableCell>
              <TableCell className="text-right">
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={newRow.maxPayRateCad}
                  onChange={(e) => setNewRow((p) => ({ ...p, maxPayRateCad: e.target.value }))}
                  className="w-24 text-right tabular-nums ml-auto"
                  placeholder="0.00"
                />
              </TableCell>
              <TableCell className="text-right">
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={newRow.hoursPerMonth}
                  onChange={(e) => setNewRow((p) => ({ ...p, hoursPerMonth: e.target.value }))}
                  className="w-24 text-right tabular-nums ml-auto"
                  placeholder="160"
                />
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                C${monthlyRevenue(newRow)}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={savingNew}
                    onClick={() => setPendingNewSave(true)}
                  >
                    {savingNew ? "Saving…" : "Save"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setAddingRoleId(null); setNewRow({ billRateCad: "", defaultPayRateCad: "", maxPayRateCad: "", hoursPerMonth: "" }); }}
                  >
                    Cancel
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {!addingRoleId && availableRoles.length > 0 && (
        <div className="flex items-center gap-3">
          <Select onValueChange={(val) => setAddingRoleId(val)}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Add Role Rate…" />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {configs.length === 0 && !addingRoleId && (
        <p className="text-sm text-muted-foreground text-center py-6">
          No rate configs yet. Select a role above to add one.
        </p>
      )}

      {/* Confirm save for existing row */}
      <AlertDialog open={pendingSave !== null} onOpenChange={(open) => { if (!open) setPendingSave(null); }}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Save Rate Config?</AlertDialogTitle>
            <AlertDialogDescription>
              This will affect all new invoices for this role.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => pendingSave !== null && handleConfirmSave(pendingSave)}>
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm save for new row */}
      <AlertDialog open={pendingNewSave} onOpenChange={(open) => { if (!open) setPendingNewSave(false); }}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Save Rate Config?</AlertDialogTitle>
            <AlertDialogDescription>
              This will affect all new invoices for this role.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmNewSave}>Save</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
