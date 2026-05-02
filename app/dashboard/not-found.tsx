import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardNotFound() {
  return (
    <div className="flex items-center justify-center py-20">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center py-10 text-center">
          <FileQuestion className="size-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-1">Page not found</h3>
          <p className="text-sm text-muted-foreground mb-6">The page you're looking for doesn't exist.</p>
          <Button asChild><Link href="/dashboard">Back to Dashboard</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
