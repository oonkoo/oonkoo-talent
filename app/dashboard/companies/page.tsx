import Link from "next/link";
import { Plus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCompanies } from "./actions";
import { CompanyTable } from "./company-table";

export default async function CompaniesPage() {
  const companies = await getCompanies();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Companies</h2>
          <p className="text-sm text-muted-foreground">
            {companies.length} {companies.length === 1 ? "company" : "companies"}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/companies/new">
            <Plus className="mr-2 size-4" />
            Add Company
          </Link>
        </Button>
      </div>

      {companies.length > 0 ? (
        <CompanyTable data={companies} />
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="size-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No companies yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first client company to get started.
            </p>
            <Button asChild>
              <Link href="/dashboard/companies/new">
                <Plus className="mr-2 size-4" />
                Add Company
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
