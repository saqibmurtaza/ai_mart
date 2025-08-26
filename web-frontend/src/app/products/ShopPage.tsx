'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';           // NEW

import {
  getProducts,
  getCategories,
  Product as ProductType,
  Category,
} from '@/lib/api';

import ProductCard from '@/components/ProductCard';

// ---- NEW: lazy-load Sanity + RxJS heavy code ------------------------------
const loadSanity = () =>
  import('@/lib/sanityClient').then((m) => m.getSanityClient());
// ---------------------------------------------------------------------------

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read state from URL
  const currentCategorySlug = searchParams.get('category') || '';
  const currentSortOrder = searchParams.get('sort') || 'newest';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';

  // Component state
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for the filter inputs
  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);

  // Function to update URL, which triggers a data re-fetch
  const updateSearchParams = useCallback(
    (
      newCategory: string,
      newSort: string,
      newMinPrice: string,
      newMaxPrice: string,
    ) => {
      const params = new URLSearchParams();
      if (newCategory) params.set('category', newCategory);
      if (newSort) params.set('sort', newSort);
      if (newMinPrice) params.set('minPrice', newMinPrice);
      if (newMaxPrice) params.set('maxPrice', newMaxPrice);
      router.push(`/products?${params.toString()}`);
    },
    [router],
  );

  // Main data-fetching effect ─ delegates filtering to the backend
  useEffect(() => {
    let didCancel = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const minPriceNum = currentMinPrice
          ? parseFloat(currentMinPrice)
          : undefined;
        const maxPriceNum = currentMaxPrice
          ? parseFloat(currentMaxPrice)
          : undefined;

        // OPTIONAL: if you plan to fetch via Sanity directly instead
        // of your FastAPI gateway, load the Sanity client here:
        // const client = await loadSanity();

        const [categoriesData, productsData] = await Promise.all([
          getCategories(),
          getProducts(
            currentCategorySlug,
            currentSortOrder,
            minPriceNum,
            maxPriceNum,
          ),
        ]);

        if (!didCancel) {
          setCategories(categoriesData);
          setProducts(productsData);
        }
      } catch (err: any) {
        if (!didCancel) setError(err.message || 'Failed to load data.');
      } finally {
        if (!didCancel) setLoading(false);
      }
    }

    fetchData();
    return () => {
      didCancel = true;
    };
  }, [
    currentCategorySlug,
    currentSortOrder,
    currentMinPrice,
    currentMaxPrice,
  ]);

  // Sync input fields if URL changes
  useEffect(() => {
    setMinPriceInput(currentMinPrice);
    setMaxPriceInput(currentMaxPrice);
  }, [currentMinPrice, currentMaxPrice]);

  // ──────────────────────────  UI  ──────────────────────────
  if (loading) return <p>Loading products…</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      {/* Example header */}
      <h1 className="text-2xl font-semibold mb-4">
        {currentCategorySlug
          ? categories.find((c) => c.slug === currentCategorySlug)?.title
          : 'All Products'}
      </h1>

      {/* Product Grid */}
      {products.length === 0 ? (
        <p>No products found for this selection.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}
