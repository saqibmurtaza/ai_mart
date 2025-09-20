import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest, event: any) {
  const ua = req.headers.get("user-agent") || "";

  // ✅ Allow crawlers directly (do not rewrite to missing /api/og-fallback)
  if (/LinkedInBot|Twitterbot|facebookexternalhit/i.test(ua)) {
    return NextResponse.next();
  }

  // ✅ Normal users → Clerk auth
  return clerkMiddleware()(req, event);
}

// Make sure middleware only applies to routes you want
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
