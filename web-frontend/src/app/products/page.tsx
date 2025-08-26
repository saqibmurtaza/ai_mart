/* src/app/products/page.tsx */
import { Suspense } from 'react';
import ShopPage from './ShopPage';

// 1. Tell Next.js to re-generate this page every 60 s (Incremental Static Regeneration)
export const revalidate = 60;          // ← adjust later if you need faster updates


export default function ProductsPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <ShopPage />
    </Suspense>
  );
}
