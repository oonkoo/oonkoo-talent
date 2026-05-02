"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center py-20">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center py-10 text-center">
          <AlertCircle className="size-10 text-destructive mb-4" />
          <h3 className="text-lg font-medium mb-1">Something went wrong</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
          <div className="flex gap-3">
            <Button onClick={reset}>Try again</Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
