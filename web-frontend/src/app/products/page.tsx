import { Suspense } from 'react';
import ShopPage from './ShopPage';

export const dynamic = 'force-dynamic'; // Optional but safe fallback

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShopPage />
    </Suspense>
  );
}
