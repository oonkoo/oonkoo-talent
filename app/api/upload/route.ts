import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { UTApi } from "uploadthing/server";
import { db } from "@/lib/db";
import { isOwnerEmail } from "@/lib/auth";

const utapi = new UTApi();

export async function POST(request: Request) {
  // Auth check
  const { isAuthenticated, getUser } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await getUser();
  if (!isOwnerEmail(user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const files = formData.getAll("files") as File[];
  const employeeId = formData.get("employeeId") as string;
  const documentType = formData.get("documentType") as string;

  if (!files.length || !employeeId || !documentType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Upload to UploadThing
  const uploaded = await utapi.uploadFiles(files);

  // Save metadata to database
  const results = [];
  for (const res of uploaded) {
    if (res.data) {
      const doc = await db.employeeDocument.create({
        data: {
          employeeId,
          documentType: documentType as
            | "offer_letter"
            | "terms_conditions"
            | "bank_info"
            | "promotion_letter"
            | "other",
          fileName: res.data.name,
          fileUrl: res.data.ufsUrl,
          fileKey: res.data.key,
          fileSizeBytes: res.data.size,
        },
      });
      results.push(doc);
    }
  }

  return NextResponse.json({ uploaded: results.length });
}
