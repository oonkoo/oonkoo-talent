"use server";

import { db } from "@/lib/db";
import { serialize } from "@/lib/serialize";

export async function getRolesWithCounts() {
  const roles = await db.employeeRole.findMany({
    include: {
      _count: { select: { employees: true, rateConfigs: true } },
    },
    orderBy: { title: "asc" },
  });
  return serialize(roles);
}

export type RoleWithCounts = Awaited<ReturnType<typeof getRolesWithCounts>>[number];

export async function createRole(data: { title: string; description?: string }) {
  await db.employeeRole.create({
    data: { title: data.title, description: data.description || null },
  });
}

export async function updateRole(id: string, data: { title: string; description?: string }) {
  await db.employeeRole.update({
    where: { id },
    data: { title: data.title, description: data.description || null },
  });
}

export async function deleteRole(id: string) {
  const role = await db.employeeRole.findUnique({
    where: { id },
    include: { _count: { select: { employees: true } } },
  });
  if (!role) throw new Error("Role not found");
  if (role._count.employees > 0) {
    throw new Error(`Cannot delete: ${role._count.employees} employees are assigned to this role.`);
  }
  await db.employeeRole.delete({ where: { id } });
}
