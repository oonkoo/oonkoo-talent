import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getEmployees } from "./actions";
import { EmployeeTable } from "./employee-table";

export default async function EmployeesPage() {
  const employees = await getEmployees();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Employees</h2>
          <p className="text-sm text-muted-foreground">
            {employees.length} {employees.length === 1 ? "employee" : "employees"}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/employees/new">
            <Plus className="mr-2 size-4" />
            Add Employee
          </Link>
        </Button>
      </div>

      {employees.length > 0 ? (
        <EmployeeTable data={employees} />
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="size-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No employees yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Onboard your first employee to get started.
            </p>
            <Button asChild>
              <Link href="/dashboard/employees/new">
                <Plus className="mr-2 size-4" />
                Add Employee
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
