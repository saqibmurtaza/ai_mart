'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { getProductBySlug, Product } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function ProductPage({ params }: { params: { slug: string } }) {
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
        if (params.slug) {
          const prod = await getProductBySlug(params.slug);
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
  }, [params.slug]);

  // Add to Cart Handler -- for both guests and signed-in users
  const handleAddToCart = async () => {
    if (!product?.id) {
      toast.error('Product not loaded yet. Please wait.');
      return;
    }
    await addItemToCart(product);
    // CartContext will toast "added" or show guest error if needed
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

  return (
    <div className="container mx-auto p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          <div className="bg-gray-200 w-full h-96 flex items-center justify-center text-xl text-gray-700">
            Image of {product.name}
          </div>
        </div>
        {/* Product Details */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-2xl text-green-700 mb-4">${product.price.toFixed(2)}</p>
          <div className="mb-6">
            {product.description
              ? <div>{product.description}</div>
              : <div className="text-gray-500">No description available.</div>
            }
          </div>
          <div className="text-sm text-gray-500 mb-6">
            In Stock: {product.stock ?? 0} units
            {product.sku && <span> &nbsp;| SKU: {product.sku}</span>}
            {product.category && <span>&nbsp;| Category: {product.category}</span>}
          </div>
          {/* --- FINAL, UNIVERSAL BUTTON --- */}
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
