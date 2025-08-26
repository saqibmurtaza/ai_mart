'use client';                                        // <-- keep client-side

import { useEffect, useState, useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import { getProductBySlug, Product } from '@/lib/api';
import dynamic from 'next/dynamic';                  // ★ CHANGED

import Image from 'next/image';
import { toast } from 'react-hot-toast';

/* -------------------------------------------------
   1.  Lazy-load PortableText so its 70 KB bundle
       is fetched only when this page is viewed.
   ------------------------------------------------- */
const PortableText = dynamic(
  () => import('@portabletext/react').then(m => m.PortableText),
  { ssr: false, loading: () => <p>Loading description…</p> }
);                                                   // ★ CHANGED

export default function ProductPage({ params }: { params: { slug: string } }) {

  const { slug } = params;
  const { addItemToCart } = useCart();

  /* ---------- state ---------- */
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState<string | null>(null);

  /* ---------- data fetch ---------- */
  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (!slug) {
          setError('No product slug in URL.');
          return;
        }

        const prod = await getProductBySlug(slug);
        if (!ignore) setProduct(prod);
      } catch (err) {
        console.error(err);
        if (!ignore) setError('Could not load product data.');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => { ignore = true; };
  }, [slug]);

  /* ---------- helpers ---------- */
  const handleAddToCart = useCallback(async () => {
    if (!product) {
      toast.error('Product not loaded yet. Please wait.');
      return;
    }
    await addItemToCart(product);
  }, [product, addItemToCart]);                      // ★ CHANGED (memoised)

  /* ---------- UI ---------- */
  if (loading)   return <p className="py-10 text-center">Loading product …</p>;
  if (error)     return <p className="py-10 text-center text-red-600">{error}</p>;
  if (!product)  return <p className="py-10 text-center">Product not found.</p>;

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
            priority={false}                        // ★ CHANGED (no FCP block)
            className="object-cover rounded-xl"
          />
        ) : (
          <p>No image available.</p>
        )}

        {/* details */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

          <p className="text-2xl text-green-700 mb-4">
            ${product.price.toFixed(2)}
          </p>

          <div className="prose mb-6">
            {Array.isArray(product.description) && product.description.length ? (
              <PortableText value={product.description} />
            ) : (
              <p className="text-gray-500">No description available.</p>
            )}
          </div>

          <p className="text-sm text-gray-500 mb-6">
            In Stock: {product.stock ?? 0} units
            {product.sku && <> | SKU: {product.sku}</>}
            {product.category && (
              <> | Category: {typeof product.category === 'string'
                ? product.category
                : product.category.title}</>
            )}
          </p>

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
