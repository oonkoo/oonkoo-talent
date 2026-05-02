import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { isOwnerEmail } from "@/lib/auth";

const f = createUploadthing();

export const uploadRouter = {
  employeeDocument: f({
    pdf: { maxFileSize: "8MB", maxFileCount: 5 },
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    "application/msword": { maxFileSize: "8MB", maxFileCount: 5 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "8MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const { isAuthenticated, getUser } = getKindeServerSession();
      if (!(await isAuthenticated())) throw new Error("Unauthorized");
      const user = await getUser();
      if (!isOwnerEmail(user?.email)) throw new Error("Forbidden");
      return { userEmail: user!.email };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url, name: file.name, size: file.size };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
