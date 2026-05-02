"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { finalizeInvoice, markDownloaded } from "../actions";
import { FileText, Download, CheckCircle, ExternalLink } from "lucide-react";

interface InvoiceActionsProps {
  id: string;
  status: string;
}

export function InvoiceActions({ id, status }: InvoiceActionsProps) {
  const router = useRouter();
  const [finalizing, setFinalizing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function handleFinalize() {
    setFinalizing(true);
    try {
      await finalizeInvoice(id);
      toast.success("Invoice finalized successfully.");
      router.refresh();
    } catch {
      toast.error("Failed to finalize invoice.");
    } finally {
      setFinalizing(false);
    }
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      await markDownloaded(id);
      router.refresh();
      window.open(`/api/invoices/${id}/pdf`, "_blank");
    } catch {
      toast.error("Failed to mark invoice as downloaded.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {status === "draft" && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={finalizing}>
              <CheckCircle className="mr-2 size-4" />
              {finalizing ? "Finalizing…" : "Finalize Invoice"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Finalize this invoice?</AlertDialogTitle>
              <AlertDialogDescription>
                Finalized invoices cannot be edited. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleFinalize}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Finalize
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {(status === "finalized" || status === "downloaded") && (
        <Button onClick={handleDownload} disabled={downloading}>
          <Download className="mr-2 size-4" />
          {downloading ? "Opening…" : "Download PDF"}
        </Button>
      )}

      <Button variant="outline" asChild>
        <Link href={`/dashboard/invoices/${id}/report`}>
          <ExternalLink className="mr-2 size-4" />
          View Owner Report
        </Link>
      </Button>
    </div>
  );
}
