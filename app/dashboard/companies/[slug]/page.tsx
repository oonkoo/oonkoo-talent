import Link from "next/link";
import { Users, DollarSign, Globe, UserCheck, Pencil, Settings, BarChart3, ExternalLink } from "lucide-react";
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
import { getCompany } from "../actions";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await getCompany(slug);

  const agentCount = company.agents.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{company.name}</h2>
          <p className="text-sm text-muted-foreground">
            {company.country} · {company.contactName} · {company.contactEmail}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/companies/${slug}/edit`}>
            <Pencil className="mr-2 size-4" />
            Edit Company
          </Link>
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Employees</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{company._count.employees}</p>
            <p className="text-xs text-muted-foreground">active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Agreed Rate</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {Number(company.agreedRateBdt).toFixed(4)}
            </p>
            <p className="text-xs text-muted-foreground">BDT per unit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Currency</CardTitle>
            <Globe className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{company.currency}</p>
            <p className="text-xs text-muted-foreground">{company.country}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Agent</CardTitle>
            <UserCheck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {company.agentEnabled && agentCount > 0 ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  None
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {agentCount > 0 ? company.agents[0].name : "No agent assigned"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href={`/dashboard/companies/${slug}/edit`} className="block">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 py-5">
              <Pencil className="size-5 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium">Edit Company</p>
                <p className="text-sm text-muted-foreground">Update details &amp; settings</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/dashboard/companies/${slug}/agents`} className="block">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 py-5">
              <Settings className="size-5 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium">Manage Agents</p>
                <p className="text-sm text-muted-foreground">Configure agent assignment</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/dashboard/companies/${slug}/rates`} className="block">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 py-5">
              <BarChart3 className="size-5 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium">Rate Config</p>
                <p className="text-sm text-muted-foreground">Bill &amp; pay rates by role</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Employee Roster */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Roster</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {company.employees.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">
              No active employees yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Pay Rate</TableHead>
                  <TableHead className="text-right">Salary (BDT)</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tenure</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {company.employees.map((emp) => {
                  const startDate = new Date(emp.startDate as unknown as string);
                  const now = new Date();
                  const diffMs = now.getTime() - startDate.getTime();
                  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                  const years = Math.floor(diffDays / 365);
                  const months = Math.floor((diffDays % 365) / 30);
                  const tenure = years > 0 ? `${years}y ${months}m` : months > 0 ? `${months}m` : `${diffDays}d`;

                  return (
                    <TableRow key={emp.id} className="cursor-pointer hover:bg-accent/30 transition-colors">
                      <TableCell className="p-0">
                        <Link href={`/dashboard/employees/${emp.id}`} className="group flex items-center gap-1.5 px-4 py-3 font-medium">
                          {emp.fullName}
                          <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{emp.role?.title ?? "—"}</Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        C${Number(emp.payRateCad).toFixed(2)}/hr
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        ৳{Number(emp.actualSalaryBdt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {emp.email}
                      </TableCell>
                      <TableCell className="text-sm tabular-nums text-muted-foreground">
                        {tenure}
                      </TableCell>
                      <TableCell>
                        {emp.status === "active" ? (
                          <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/10">
                            Active
                          </Badge>
                        ) : emp.status === "on_leave" ? (
                          <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/10">
                            On Leave
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
