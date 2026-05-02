import Link from "next/link";
import {
  User,
  Pencil,
  DollarSign,
  CalendarDays,
  TrendingUp,
  BanknoteIcon,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getEmployee } from "../actions";
import { BreadcrumbLabel } from "@/components/breadcrumb-context";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const employee = await getEmployee(id);

  // Get rate config for this employee's company + role
  const rateConfig = employee.company.rateConfigs?.find(
    (rc: { roleId: string }) => rc.roleId === employee.role?.id
  );
  const billRateCad = rateConfig ? Number(rateConfig.billRateCad) : 0;
  const hoursPerMonth = rateConfig ? Number(rateConfig.hoursPerMonth) : 0;
  const payRateCad = Number(employee.payRateCad);
  const salaryBdt = Number(employee.actualSalaryBdt);
  const agreedRate = Number(employee.company.agreedRateBdt) || 88;

  const monthlyRevenueCad = billRateCad * hoursPerMonth;
  const monthlyCostCad = payRateCad * hoursPerMonth;
  const grossProfitCad = monthlyRevenueCad - monthlyCostCad;

  return (
    <div className="space-y-6">
      <BreadcrumbLabel uuid={employee.id} label={employee.fullName} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{employee.fullName}</h2>
          <p className="text-sm text-muted-foreground">
            {employee.company.name} · {employee.role?.title ?? "No role"}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/employees/${id}/edit`}>
            <Pencil className="mr-2 size-4" />
            Edit Employee
          </Link>
        </Button>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="flex items-center gap-6 py-6">
          {/* Initials Avatar */}
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
            {getInitials(employee.fullName)}
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-lg font-medium">{employee.fullName}</p>
            <div className="flex flex-wrap items-center gap-2">
              {employee.role?.title && (
                <Badge variant="secondary">{employee.role.title}</Badge>
              )}
              <Badge variant="outline">{employee.company.name}</Badge>
              {employee.status === "active" ? (
                <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/10">
                  Active
                </Badge>
              ) : employee.status === "on_leave" ? (
                <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/10">
                  On Leave
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Inactive
                </Badge>
              )}
            </div>
            {(employee.email || employee.phone) && (
              <p className="text-sm text-muted-foreground">
                {[employee.email, employee.phone].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">C${monthlyRevenueCad.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground tabular-nums">
              ৳{(monthlyRevenueCad * agreedRate).toLocaleString("en-US", { maximumFractionDigits: 0 })} · {hoursPerMonth} hrs/mo × C${billRateCad.toFixed(2)}/hr
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Actual Salary</CardTitle>
            <BanknoteIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">৳{salaryBdt.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground tabular-nums">
              C${(salaryBdt / agreedRate).toFixed(2)}/mo · Cost basis C${monthlyCostCad.toFixed(2)}/mo
            </p>
          </CardContent>
        </Card>

        <Card className="border-accent">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gross Profit</CardTitle>
            <DollarSign className="size-4 text-accent" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums text-emerald-600">C${grossProfitCad.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground tabular-nums">
              ৳{(grossProfitCad * agreedRate).toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rate Details */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm tabular-nums">
            <div>
              <p className="text-muted-foreground text-xs">Bill Rate</p>
              <p className="font-medium">C${billRateCad.toFixed(2)}/hr</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Cost Basis Rate</p>
              <p className="font-medium">C${payRateCad.toFixed(2)}/hr</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Hours/Month</p>
              <p className="font-medium">{hoursPerMonth} hrs</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Start Date</p>
              <p className="font-medium">{formatDate(employee.startDate as unknown as string)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Action Links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href={`/dashboard/employees/${id}/edit`} className="block">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 py-5">
              <Pencil className="size-5 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium">Edit Employee</p>
                <p className="text-sm text-muted-foreground">Update details &amp; pay rate</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/dashboard/employees/${id}/documents`} className="block">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 py-5">
              <FileText className="size-5 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium">View Documents</p>
                <p className="text-sm text-muted-foreground">Manage uploaded files</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Documents Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Documents</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/employees/${id}/documents`}>
              <ExternalLink className="mr-2 size-4" />
              Manage
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {employee.documents.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
              <Button asChild variant="link" className="mt-2 h-auto p-0 text-sm">
                <Link href={`/dashboard/employees/${id}/documents`}>
                  Upload documents
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Uploaded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employee.documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.fileName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{doc.documentType}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground tabular-nums">
                      {new Date(doc.uploadedAt as unknown as string).toLocaleDateString("en-CA")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
