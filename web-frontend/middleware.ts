// web_frontend/middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest, event: any) {
  const ua = req.headers.get("user-agent") || "";

  // ✅ Allow crawlers to bypass Clerk (they must see HTML + meta tags)
  if (/LinkedInBot|Twitterbot|facebookexternalhit/i.test(ua)) {
    return NextResponse.next();
  }

  // ✅ Normal visitors go through Clerk
  return clerkMiddleware()(req, event);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
