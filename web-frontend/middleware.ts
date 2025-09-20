import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const ua = req.headers.get("user-agent") || "";

  // Redirect LinkedIn, Facebook, Twitter crawlers to static fallback
  if (/LinkedInBot|Twitterbot|facebookexternalhit/i.test(ua)) {
    return NextResponse.rewrite(new URL("/og-fallback.html", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
