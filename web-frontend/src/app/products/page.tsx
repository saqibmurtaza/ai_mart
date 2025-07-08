'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'; // Hook to read URL query parameters
import { getProducts, Product } from '@/lib/api';
import ProductCard from '@/components/ProductCard'; // Re-use your existing ProductCard

export default function ShopPage() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category'); // Get the 'category' query parameter

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        // Pass the category slug to the API function if it exists
        const fetchedProducts = await getProducts(categorySlug || undefined); 
        setProducts(fetchedProducts);
      } catch (err: any) {
        console.error('Failed to fetch products:', err);
        setError(err.message || 'Failed to load products.');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [categorySlug]); // Re-fetch products whenever the categorySlug changes in the URL

  return (
    <div className="container mx-auto p-4 md:p-8 mt-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-10 text-center">
        {categorySlug ? `Products in ${categorySlug.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}` : 'All Products'}
      </h1>

      {loading ? (
        <div className="text-center py-8 text-gray-600 text-lg">Loading products...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-600 text-lg">Error: {error}</div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-600 text-lg">No products found for this category.</div>
      )}
    </div>
  );
}
