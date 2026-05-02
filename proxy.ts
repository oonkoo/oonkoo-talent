import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes anyone can access without a Kinde session.
// Server actions invoked from these pages POST back to the same path
// and inherit the public access (no extra matcher work needed).
const PUBLIC_PATHS = new Set<string>([
  "/",
]);

export function proxy(request: NextRequest) {
  if (PUBLIC_PATHS.has(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Matcher already excludes api/auth, _next/*, static files.
  // Any other request reaching here needs auth.
  const hasSession = request.cookies.getAll().some(
    (c) => c.name.startsWith("kinde") || c.name === "access_token" || c.name === "id_token"
  );

  if (!hasSession) {
    const loginUrl = new URL("/api/auth/login", request.url);
    loginUrl.searchParams.set("post_login_redirect_url", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip:
    //   - /api/auth/* (Kinde callbacks)
    //   - /_next/* (Next.js internals)
    //   - any path containing a "." — i.e. static files served from /public
    //     (favicon.ico, oonkoo_talent.svg, /elements/*.svg, /people/*.png,
    //     /fonts/*.ttf, sitemap.xml, robots.txt, etc.)
    "/((?!api/auth|_next/static|_next/image|.*\\..*).*)",
  ],
};
