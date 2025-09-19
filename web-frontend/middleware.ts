// // middleware.ts at root
// import { clerkMiddleware } from "@clerk/nextjs/server";

// export default clerkMiddleware();

// web-frontend/middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest, event: any) {
  const ua = req.headers.get("user-agent") || "";

  // ✅ Allow social crawlers (LinkedIn, Twitter, Facebook) without Clerk auth
  if (/LinkedInBot|Twitterbot|facebookexternalhit/i.test(ua)) {
    return NextResponse.next();
  }

  // ✅ Fallback to Clerk middleware for normal users
  return clerkMiddleware()(req, event);
}

// Make sure middleware only applies to routes you want
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
