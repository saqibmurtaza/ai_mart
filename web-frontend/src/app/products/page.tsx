// src/app/products/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getProducts } from '@/lib/api';
import ProductGrid from '@/components/ProductGrid';
import { Product } from '@/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProductsData() {
      setLoading(true);
      setError(null);
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err: any) {
        console.error('Failed to fetch products:', err);
        setError(err.message || 'Failed to load products.');
      } finally {
        setLoading(false);
      }
    }
    fetchProductsData();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-gray-700 text-lg">Loading products...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600 text-lg">Error: {error}</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Shop Products</h1>
      <ProductGrid products={products} />
    </div>
  );
}
