import Link from "next/link";
import { getCompany } from "@/app/dashboard/companies/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function CompanyAgentsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await getCompany(slug);

  if (!company.agentEnabled) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Agents</h2>
          <p className="text-sm text-muted-foreground">Manage agents for this company.</p>
        </div>
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground mb-4">Agent mode is disabled for this company.</p>
            <Button asChild variant="outline">
              <Link href={`/dashboard/companies/${slug}/edit`}>Edit Company to Enable</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Agents</h2>
          <p className="text-sm text-muted-foreground">Manage agents for this company.</p>
        </div>
        {company.agents.length === 0 && (
          <Button asChild>
            <Link href={`/dashboard/companies/${slug}/agents/new`}>Add Agent</Link>
          </Button>
        )}
      </div>

      {company.agents.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">No agents configured yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {company.agents.map((agent) => (
            <Link
              key={agent.id}
              href={`/dashboard/companies/${slug}/agents/${agent.id}`}
              className="block"
            >
              <Card className="hover:ring-2 hover:ring-primary/40 transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle>{agent.name}</CardTitle>
                    <Badge variant="secondary">Agent</Badge>
                  </div>
                  {agent.email && (
                    <CardDescription>{agent.email}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-1">
                  {agent.phone && (
                    <p className="text-sm text-muted-foreground">{agent.phone}</p>
                  )}
                  <p className="text-sm font-medium">
                    {agent.name.split(" ")[0]} receives{" "}
                    <span className="text-primary tabular-nums">{Number(agent.revenueSharePct)}%</span>{" "}
                    of gross profit
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
