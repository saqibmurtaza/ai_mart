// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Public routes
    "/",
    "/login",
    "/signup",
    "/products(.*)",
    "/api/webhooks/clerk",

    // Protect everything else
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};
