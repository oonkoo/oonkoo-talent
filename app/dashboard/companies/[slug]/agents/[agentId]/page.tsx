import { getCompany, getAgent } from "@/app/dashboard/companies/actions";
import { AgentForm } from "@/app/dashboard/companies/[slug]/agents/agent-form";

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ slug: string; agentId: string }>;
}) {
  const { slug, agentId } = await params;

  const isNew = agentId === "new";
  const [company, agent] = await Promise.all([
    getCompany(slug),
    isNew ? Promise.resolve(undefined) : getAgent(agentId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {isNew ? "Add Agent" : "Edit Agent"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isNew ? "Create a new agent for this company." : "Update agent information and revenue share."}
        </p>
      </div>
      <AgentForm companyId={company.id} agent={agent ?? undefined} />
    </div>
  );
}
