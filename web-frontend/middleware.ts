import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest, event: any) {
  const ua = req.headers.get("user-agent") || "";

  // ✅ Allow social crawlers (LinkedIn, Twitter, Facebook) without Clerk auth
//   if (/LinkedInBot|Twitterbot|facebookexternalhit/i.test(ua)) {
//     return NextResponse.next();
//   }
if (/LinkedInBot|Twitterbot|facebookexternalhit/i.test(ua)) {
  return NextResponse.rewrite(new URL("/api/og-fallback", req.url));
}


  // ✅ Fallback to Clerk middleware for normal users
  return clerkMiddleware()(req, event);
}

// Make sure middleware only applies to routes you want
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
