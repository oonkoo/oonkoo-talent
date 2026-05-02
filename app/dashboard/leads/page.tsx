import { Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getLeads } from "./actions";
import { LeadsTable } from "./leads-table";

export default async function LeadsPage() {
  const leads = await getLeads();
  const newCount = leads.filter((l) => l.status === "NEW").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Leads</h2>
          <p className="text-sm text-muted-foreground">
            {leads.length} total
            {newCount > 0 && (
              <>
                {" · "}
                <span className="text-blue-600 font-medium">{newCount} new</span>
              </>
            )}
          </p>
        </div>
      </div>

      {leads.length > 0 ? (
        <LeadsTable data={leads} />
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Inbox className="size-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No leads yet</h3>
            <p className="text-sm text-muted-foreground">
              When someone drops a contact form or signs up, they&apos;ll appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
