import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const ALLOWED_EMAIL = process.env.OWNER_EMAIL;

if (!ALLOWED_EMAIL) {
  throw new Error(
    "OWNER_EMAIL environment variable is not set. " +
      "Add it to .env (locally) and to your Vercel project settings (production).",
  );
}

/**
 * Verify the current user is the owner — the single email defined by the
 * OWNER_EMAIL env var. Call this in any server component or server action
 * that needs owner-only protection. Redirects to login if not authenticated;
 * logs out the user if their email doesn't match the configured owner.
 */
export async function requireOwner() {
  const { isAuthenticated, getUser } = getKindeServerSession();

  if (!(await isAuthenticated())) {
    redirect("/api/auth/login");
  }

  const user = await getUser();

  if (!user?.email || user.email !== ALLOWED_EMAIL) {
    redirect("/api/auth/logout");
  }

  return user;
}

/**
 * Require any authenticated Kinde user. Use for routes that any signed-in
 * user can access (e.g. /onboard, /auth/callback). No email gating — the
 * owner-only guard is requireOwner().
 */
export async function requireAuth() {
  const { isAuthenticated, getUser } = getKindeServerSession();

  if (!(await isAuthenticated())) {
    redirect("/api/auth/login");
  }

  const user = await getUser();
  if (!user?.id) {
    redirect("/api/auth/login");
  }

  return user;
}

export function isOwnerEmail(email: string | null | undefined): boolean {
  return email === ALLOWED_EMAIL;
}
