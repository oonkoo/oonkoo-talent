"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { upsertAgent } from "@/app/dashboard/companies/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Agent = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  revenueSharePct: number | { toNumber(): number };
  notes: string | null;
};

type Props = {
  companyId: string;
  agent?: Agent;
};

export function AgentForm({ companyId, agent }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const pct = Number(fd.get("revenueSharePct"));
    if (isNaN(pct) || pct < 0 || pct > 100) {
      toast.error("Revenue share must be between 0 and 100.");
      return;
    }

    setPending(true);
    try {
      await upsertAgent(companyId, {
        id: agent?.id,
        name: fd.get("name") as string,
        email: (fd.get("email") as string) || undefined,
        phone: (fd.get("phone") as string) || undefined,
        revenueSharePct: pct,
        notes: (fd.get("notes") as string) || undefined,
      });
      toast.success(agent ? "Agent updated." : "Agent created.");
      router.push(`/dashboard/companies/${companyId}/agents`);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={agent?.name ?? ""}
          placeholder="Ahmed Al-Rashid"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={agent?.email ?? ""}
          placeholder="agent@example.com"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={agent?.phone ?? ""}
          placeholder="+1 555 000 0000"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="revenueSharePct">Revenue Share (%)</Label>
        <Input
          id="revenueSharePct"
          name="revenueSharePct"
          type="number"
          min={0}
          max={100}
          step={0.01}
          required
          defaultValue={agent ? Number(agent.revenueSharePct) : 0}
          className="tabular-nums"
        />
        <p className="text-xs text-muted-foreground">Percentage of gross profit paid to the agent (0–100).</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={agent?.notes ?? ""}
          placeholder="Any additional details…"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : agent ? "Save Changes" : "Create Agent"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/dashboard/companies/${companyId}/agents`)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
