"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "@uploadthing/react";
import { toast } from "sonner";
import { FileText, Download, Trash2, Calendar, Upload, Loader2, CloudUpload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteEmployeeDocument } from "../../actions";
import { cn } from "@/lib/utils";

const typeLabels: Record<string, string> = {
  offer_letter: "Offer Letter",
  terms_conditions: "Terms & Conditions",
  bank_info: "Bank Info",
  other: "Other",
};

type DocumentType = "offer_letter" | "terms_conditions" | "bank_info" | "other";

type Doc = {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number | null;
  uploadedAt: string;
  notes: string | null;
};

export function DocumentManager({
  employeeId,
  documents,
}: {
  employeeId: string;
  documents: Doc[];
}) {
  const router = useRouter();
  const [docType, setDocType] = useState<DocumentType>("offer_letter");
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
  });

  async function handleUpload() {
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.set("employeeId", employeeId);
      formData.set("documentType", docType);
      for (const file of files) {
        formData.append("files", file);
      }

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      toast.success(`${data.uploaded} document${data.uploaded > 1 ? "s" : ""} uploaded`);
      setFiles([]);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(docId: string) {
    try {
      await deleteEmployeeDocument(docId);
      toast.success("Document deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete document");
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Upload Section */}
      <Card>
        <CardContent className="py-6 space-y-4">
          <div className="space-y-2">
            <Label>Document Type</Label>
            <Select value={docType} onValueChange={(v) => setDocType(v as DocumentType)}>
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer",
              isDragActive ? "border-accent bg-accent/5" : "border-border hover:border-accent/50 hover:bg-muted/30"
            )}
          >
            <input {...getInputProps()} />
            <CloudUpload className={cn("size-10 mb-3", isDragActive ? "text-accent" : "text-muted-foreground")} />
            {isDragActive ? (
              <p className="text-sm font-medium">Drop files here</p>
            ) : (
              <>
                <p className="text-sm font-medium">Drag & drop files here, or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, Images, Word docs up to 8MB</p>
              </>
            )}
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border bg-muted/20 px-3 py-2 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="size-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setFiles((prev) => prev.filter((_, j) => j !== i)); }}>
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={handleUpload} disabled={isUploading} className="w-full">
                {isUploading ? (
                  <><Loader2 className="mr-2 size-4 animate-spin" />Uploading...</>
                ) : (
                  <><Upload className="mr-2 size-4" />Upload {files.length} file{files.length > 1 ? "s" : ""}</>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document List */}
      {documents.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            {documents.length} {documents.length === 1 ? "document" : "documents"}
          </h3>
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <FileText className="size-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.fileName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-xs">
                      {typeLabels[doc.documentType] ?? doc.documentType}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="size-3" />
                      {new Date(doc.uploadedAt).toLocaleDateString("en-CA")}
                    </span>
                    {doc.fileSizeBytes && (
                      <span className="text-xs text-muted-foreground">
                        {(doc.fileSizeBytes / 1024).toFixed(0)} KB
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" asChild>
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="size-4" />
                    </a>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {doc.fileName}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove the document record.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(doc.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Upload className="size-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No documents yet</h3>
            <p className="text-sm text-muted-foreground">
              Select a document type above and drop files to upload.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
