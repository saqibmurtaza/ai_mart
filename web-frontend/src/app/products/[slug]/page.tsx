'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { getProductBySlug, Product } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { PortableText } from '@portabletext/react';
import { urlFor } from '@/lib/sanityimage'
import Image from 'next/image'

export default function ProductPage({ params }: { params: any }) {
  // ✅ Fix: Unwrap route params (Next.js App Router, 14+)
  
  const { slug } = React.use(params) as { slug: string };


  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { addItemToCart } = useCart();

  // Fetch product by slug
  useEffect(() => {
    async function fetchProduct() {
      try {
        setIsLoading(true);
        setLoadError(null);
        if (slug) {
          const prod = await getProductBySlug(slug);
          setProduct(prod); // can be null if not found
        } else {
          setLoadError('No product slug in URL.');
        }
      } catch (err) {
        console.error('Fetch product error:', err);
        setLoadError('Could not load product data.');
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  // Add to Cart Handler
  const handleAddToCart = async () => {
    if (!product?.id) {
      toast.error('Product not loaded yet. Please wait.');
      return;
    }
    await addItemToCart(product);
    // CartContext will show toast messages as needed
  };

  // ---- UI Rendering ----
  if (isLoading) {
    return <div className="py-10 text-center">Loading product details...</div>;
  }

  if (loadError) {
    return <div className="py-10 text-center text-red-600">{loadError}</div>;
  }

  if (!product) {
    return <div className="py-10 text-center text-gray-600">Product not found.</div>;
  }

  console.log('Product:', product);


  return (
    <div className="container mx-auto p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        {/* <div>
          <div className="bg-gray-200 w-full h-96 flex items-center justify-center text-xl text-gray-700">
            Image of {product.name}
          </div>
        </div> */}

{product.imageUrl ? (
  <img
    src={product.imageUrl}
    alt={product.alt || product.name}
    className="w-full h-auto object-cover rounded-xl"
  />
) : (
  <p>No image available.</p>
)}



        {/* Product Details */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-2xl text-green-700 mb-4">${product.price.toFixed(2)}</p>
          <div className="mb-6">
  {product.description && Array.isArray(product.description) && product.description.length > 0 ? (
    <PortableText value={product.description} />
  ) : (
    <div className="text-gray-500">No description available.</div>
  )}
</div>
          <div className="text-sm text-gray-500 mb-6">
            In Stock: {product.stock ?? 0} units
            {product.sku && <span> &nbsp;| SKU: {product.sku}</span>}
            {product.category && <span>&nbsp;| Category: {typeof product.category === 'string' ? product.category : product.category?.title}</span>}
          </div>
          {/* --- Add to Cart Button --- */}
          <button
            className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
            onClick={handleAddToCart}
            disabled={isLoading || !product.id}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

