"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createRole, updateRole, deleteRole, type RoleWithCounts } from "./actions";

export function RoleList({ initialRoles }: { initialRoles: RoleWithCounts[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  async function handleAdd() {
    if (!newTitle.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      await createRole({ title: newTitle.trim(), description: newDesc.trim() || undefined });
      toast.success(`${newTitle} created`);
      setAdding(false);
      setNewTitle("");
      setNewDesc("");
      router.refresh();
    } catch {
      toast.error("Failed to create role");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: string) {
    if (!editTitle.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      await updateRole(id, { title: editTitle.trim(), description: editDesc.trim() || undefined });
      toast.success("Role updated");
      setEditingId(null);
      router.refresh();
    } catch {
      toast.error("Failed to update role");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteRole(id);
      toast.success("Role deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete role");
    }
  }

  function startEdit(role: RoleWithCounts) {
    setEditingId(role.id);
    setEditTitle(role.title);
    setEditDesc(role.description ?? "");
  }

  return (
    <div className="max-w-2xl space-y-3">
      {initialRoles.map((role) => (
        <Card key={role.id}>
          <CardContent className="flex items-center gap-4 py-4">
            {editingId === role.id ? (
              <div className="flex-1 space-y-2">
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Role title" />
                <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Description (optional)" />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleUpdate(role.id)} disabled={saving}>
                    {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4 mr-1" />}
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                    <X className="size-4 mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <p className="font-medium">{role.title}</p>
                  {role.description && (
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  )}
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {role._count.employees} employees
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {role._count.rateConfigs} rate configs
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(role)}>
                    <Pencil className="size-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" disabled={role._count.employees > 0}>
                        <Trash2 className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {role.title}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. The role will be permanently removed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(role.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}

      {adding ? (
        <Card className="border-dashed">
          <CardContent className="py-4 space-y-2">
            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Role title (e.g. DevOps Engineer)" autoFocus />
            <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)" />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin mr-1" /> : <Plus className="size-4 mr-1" />}
                Add Role
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setAdding(false); setNewTitle(""); setNewDesc(""); }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" onClick={() => setAdding(true)} className="w-full border-dashed">
          <Plus className="size-4 mr-2" /> Add Role
        </Button>
      )}
    </div>
  );
}
