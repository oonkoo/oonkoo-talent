"use server";

import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { serialize } from "@/lib/serialize";

export async function getEmployees() {
  const employees = await db.employee.findMany({
    include: {
      company: { select: { name: true, slug: true } },
      role: { select: { title: true } },
    },
    orderBy: { fullName: "asc" },
  });
  return serialize(employees);
}

export type EmployeeWithDetails = Awaited<ReturnType<typeof getEmployees>>[number];

export async function getEmployee(id: string) {
  const employee = await db.employee.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          name: true, slug: true, currency: true, agreedRateBdt: true,
          rateConfigs: { where: { effectiveTo: null }, include: { role: true } },
        },
      },
      role: { select: { title: true, id: true } },
      documents: { orderBy: { uploadedAt: "desc" } },
    },
  });
  if (!employee) notFound();
  return serialize(employee);
}

export type EmployeeFull = Awaited<ReturnType<typeof getEmployee>>;

export async function getCompaniesWithRoles() {
  const companies = await db.company.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      rateConfigs: {
        where: { effectiveTo: null },
        include: { role: true },
      },
    },
    orderBy: { name: "asc" },
  });
  return serialize(companies);
}

export type CompanyWithRoles = Awaited<ReturnType<typeof getCompaniesWithRoles>>[number];

export async function getAllRoles() {
  const roles = await db.employeeRole.findMany({ orderBy: { title: "asc" } });
  return serialize(roles);
}

export type RoleOption = Awaited<ReturnType<typeof getAllRoles>>[number];

export async function createEmployee(data: {
  companyId: string;
  roleId: string;
  fullName: string;
  email: string;
  phone?: string;
  nidNumber?: string;
  passportNumber?: string;
  address?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankAccountHolder?: string;
  bankBranchName?: string;
  emergencyName?: string;
  emergencyRelation?: string;
  emergencyPhone?: string;
  payRateCad: number;
  actualSalaryBdt: number;
  startDate: string;
}) {
  // Validate pay rate against max
  const rateConfig = await db.rateConfig.findFirst({
    where: { companyId: data.companyId, roleId: data.roleId, effectiveTo: null },
  });
  if (rateConfig && data.payRateCad > Number(rateConfig.maxPayRateCad)) {
    throw new Error(
      `Pay rate C$${data.payRateCad}/hr exceeds the agreed maximum of C$${Number(rateConfig.maxPayRateCad)}/hr.`
    );
  }

  const employee = await db.employee.create({
    data: {
      companyId: data.companyId,
      roleId: data.roleId,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || null,
      nidNumber: data.nidNumber || null,
      passportNumber: data.passportNumber || null,
      address: data.address || null,
      bankAccountNumber: data.bankAccountNumber || null,
      bankName: data.bankName || null,
      bankAccountHolder: data.bankAccountHolder || null,
      bankBranchName: data.bankBranchName || null,
      emergencyName: data.emergencyName || null,
      emergencyRelation: data.emergencyRelation || null,
      emergencyPhone: data.emergencyPhone || null,
      payRateCad: data.payRateCad,
      actualSalaryBdt: data.actualSalaryBdt,
      startDate: new Date(data.startDate),
      status: "active",
    },
  });

  redirect(`/dashboard/employees/${employee.id}`);
}

export async function saveEmployeeDocument(data: {
  employeeId: string;
  documentType: "offer_letter" | "terms_conditions" | "bank_info" | "other";
  fileName: string;
  fileUrl: string;
  fileSizeBytes?: number;
  notes?: string;
}) {
  await db.employeeDocument.create({
    data: {
      employeeId: data.employeeId,
      documentType: data.documentType,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileSizeBytes: data.fileSizeBytes ?? null,
      notes: data.notes || null,
    },
  });
}

export async function deleteEmployeeDocument(id: string) {
  await db.employeeDocument.delete({ where: { id } });
}

export async function updateEmployee(id: string, data: {
  fullName: string;
  email: string;
  phone?: string;
  nidNumber?: string;
  passportNumber?: string;
  address?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankAccountHolder?: string;
  bankBranchName?: string;
  emergencyName?: string;
  emergencyRelation?: string;
  emergencyPhone?: string;
  payRateCad: number;
  actualSalaryBdt: number;
  startDate: string;
  status: "active" | "inactive" | "on_leave";
}) {
  const employee = await db.employee.findUnique({ where: { id } });
  if (!employee) notFound();

  // Validate pay rate against max
  const rateConfig = await db.rateConfig.findFirst({
    where: { companyId: employee.companyId, roleId: employee.roleId, effectiveTo: null },
  });
  if (rateConfig && data.payRateCad > Number(rateConfig.maxPayRateCad)) {
    throw new Error(
      `Pay rate C$${data.payRateCad}/hr exceeds the agreed maximum of C$${Number(rateConfig.maxPayRateCad)}/hr.`
    );
  }

  await db.employee.update({
    where: { id },
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || null,
      nidNumber: data.nidNumber || null,
      passportNumber: data.passportNumber || null,
      address: data.address || null,
      bankAccountNumber: data.bankAccountNumber || null,
      bankName: data.bankName || null,
      bankAccountHolder: data.bankAccountHolder || null,
      bankBranchName: data.bankBranchName || null,
      emergencyName: data.emergencyName || null,
      emergencyRelation: data.emergencyRelation || null,
      emergencyPhone: data.emergencyPhone || null,
      payRateCad: data.payRateCad,
      actualSalaryBdt: data.actualSalaryBdt,
      startDate: new Date(data.startDate),
      status: data.status,
    },
  });
}
