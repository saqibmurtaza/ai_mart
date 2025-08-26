'use client';
import dynamic from 'next/dynamic';

/* ─── Clerk provider ────────────────────────────────────────── */
export const ClerkProviderDynamic = dynamic(
  () => import('@clerk/nextjs').then(m => m.ClerkProvider),
  { ssr: false, loading: () => null }
);

/* ─── Clerk UI widgets (optional) ───────────────────────────── */
export const UserButton   = dynamic(
  () => import('@clerk/nextjs').then(m => m.UserButton),
  { ssr: false }
);
export const SignInButton = dynamic(
  () => import('@clerk/nextjs').then(m => m.SignInButton),
  { ssr: false }
);
export const SignedIn     = dynamic(
  () => import('@clerk/nextjs').then(m => m.SignedIn),
  { ssr: false }
);
export const SignedOut    = dynamic(
  () => import('@clerk/nextjs').then(m => m.SignedOut),
  { ssr: false }
);
