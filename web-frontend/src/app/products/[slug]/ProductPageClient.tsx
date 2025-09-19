// web-frontend/src/app/products/[slug]/ProductPageClient.tsx
'use client'; 

import { useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/api';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

/* -------------------------------------------------
  Lazy-load PortableText.
------------------------------------------------- */
const PortableText = dynamic(
  () => import('@portabletext/react').then(m => m.PortableText),
  { ssr: false, loading: () => <p>Loading description…</p> }
);

export default function ProductPageClient({ product }: { product: Product }) {
  const { addItemToCart } = useCart();

  /* ---------- helpers ---------- */
  const handleAddToCart = useCallback(async () => {
    if (!product) {
      toast.error('Product not loaded yet. Please wait.');
      return;
    }
    await addItemToCart(product);
  }, [product, addItemToCart]);

  /* ---------- UI ---------- */
  return (
    <div className="container mx-auto p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* image */}
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.alt || product.name}
            width={500}
            height={300}
            priority={false}
            className="object-cover rounded-xl"
          />
        ) : (
          <p>No image available.</p>
        )}

        {/* details */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          {/* ... all your other UI code here ... */}
          <button
            onClick={handleAddToCart}
            disabled={!product}
            className="w-full bg-blue-600 hover:bg-blue-700
                       disabled:bg-gray-400 text-white py-3
                       rounded-lg text-lg font-semibold"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
