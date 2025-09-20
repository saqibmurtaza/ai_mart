import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest, event: any) {
  const ua = req.headers.get("user-agent") || "";

  // Let LinkedIn, Twitter, Facebook bots pass through normally
  if (/LinkedInBot|Twitterbot|facebookexternalhit/i.test(ua)) {
    return NextResponse.next();
  }

  // Fallback to Clerk middleware for normal users
  return clerkMiddleware()(req, event);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
