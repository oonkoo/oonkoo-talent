import { UTApi } from "uploadthing/server";

// Lazily instantiate so module import doesn't pay the cost when cleanup is
// never called (e.g. test runs, build-time analysis).
let _utapi: UTApi | null = null;
function getUtapi(): UTApi {
  if (!_utapi) _utapi = new UTApi();
  return _utapi;
}

type DocLike = { fileKey: string; fileUrl: string };

/**
 * Resolve the UploadThing file key for a document. After the backfill +
 * NOT NULL constraint, `fileKey` is always present on EmployeeDocument
 * rows; the regex fallback stays as a defensive last resort.
 */
export function extractFileKey(doc: DocLike): string | null {
  if (doc.fileKey) return doc.fileKey;
  const match = doc.fileUrl.match(/\/f\/([^/?#]+)/);
  return match?.[1] ?? null;
}

/**
 * Best-effort delete of UploadThing files. Never throws — UT is a remote
 * dependency and we prefer leaking a file (a billing nuisance) over blocking
 * a deletion (a UX failure that would also leak the file because the user
 * gives up). Failures are logged so they can be reconciled later.
 *
 * Pass any number of keys; empty array is a no-op.
 */
export async function deleteUploadthingFiles(keys: string[]): Promise<void> {
  const cleaned = keys.filter((k): k is string => typeof k === "string" && k.length > 0);
  if (cleaned.length === 0) return;
  try {
    await getUtapi().deleteFiles(cleaned);
  } catch (err) {
    console.error(
      "[uploadthing-cleanup] deleteFiles failed",
      { count: cleaned.length, keys: cleaned, error: err },
    );
  }
}

/** Convenience for the doc-row → key → delete pipeline. */
export async function deleteUploadthingFilesForDocs(
  docs: DocLike[],
): Promise<void> {
  const keys = docs
    .map(extractFileKey)
    .filter((k): k is string => k !== null);
  await deleteUploadthingFiles(keys);
}
