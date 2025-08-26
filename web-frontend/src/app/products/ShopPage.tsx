'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProducts, getCategories, Product as ProductType, Category } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

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
    (newCategory: string, newSort: string, newMinPrice: string, newMaxPrice: string) => {
      const params = new URLSearchParams();
      if (newCategory) params.set('category', newCategory);
      if (newSort) params.set('sort', newSort);
      if (newMinPrice) params.set('minPrice', newMinPrice);
      if (newMaxPrice) params.set('maxPrice', newMaxPrice);
      router.push(`/products?${params.toString()}`);
    },
    [router]
  );

  // Main data fetching effect - now delegates filtering to the backend
  useEffect(() => {
    let didCancel = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const minPriceNum = currentMinPrice ? parseFloat(currentMinPrice) : undefined;
        const maxPriceNum = currentMaxPrice ? parseFloat(currentMaxPrice) : undefined;

        const [categoriesData, productsData] = await Promise.all([
          getCategories(),
          getProducts(currentCategorySlug, currentSortOrder, minPriceNum, maxPriceNum)
        ]);

        if (didCancel) return;

        setCategories(categoriesData);
        setProducts(productsData);
      } catch (err: any) {
        if (didCancel) return;
        setError(err.message || 'Failed to load data.');
      } finally {
        if (!didCancel) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      didCancel = true;
    };
  }, [currentCategorySlug, currentSortOrder, currentMinPrice, currentMaxPrice]);
  
  // Sync input fields if URL changes
  useEffect(() => {
    setMinPriceInput(currentMinPrice);
    setMaxPriceInput(currentMaxPrice);
  }, [currentMinPrice, currentMaxPrice]);


  const handleCategoryChange = (categorySlug: string) => {
    updateSearchParams(categorySlug, currentSortOrder, minPriceInput, maxPriceInput);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    updateSearchParams(currentCategorySlug, event.target.value, minPriceInput, maxPriceInput);
  };

  const applyPriceFilter = () => {
    updateSearchParams(currentCategorySlug, currentSortOrder, minPriceInput, maxPriceInput);
  };

  const clearPriceFilter = () => {
    setMinPriceInput('');
    setMaxPriceInput('');
    updateSearchParams(currentCategorySlug, currentSortOrder, '', '');
  };

  if (loading) {
    return <div className="text-center py-10">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{currentCategorySlug ? categories.find(c=>c.slug === currentCategorySlug)?.title : 'All Products'}</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="md:col-span-1">
          <h2 className="font-semibold mb-4">Categories</h2>
          <ul className="space-y-2">
            <li><a href="#" onClick={() => handleCategoryChange('')} className={!currentCategorySlug ? 'font-bold' : ''}>All Products</a></li>
            {categories.map((cat) => (
              <li key={cat._id}><a href="#" onClick={() => handleCategoryChange(cat.slug)} className={currentCategorySlug === cat.slug ? 'font-bold' : ''}>{cat.title}</a></li>
            ))}
          </ul>

          <h2 className="font-semibold mt-8 mb-4">Filter by Price</h2>
          <div className="flex space-x-2">
            <input type="number" placeholder="Min" value={minPriceInput} onChange={(e) => setMinPriceInput(e.target.value)} className="w-full p-2 border rounded" />
            <input type="number" placeholder="Max" value={maxPriceInput} onChange={(e) => setMaxPriceInput(e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <button onClick={applyPriceFilter} className="w-full mt-2 bg-blue-500 text-white p-2 rounded">Apply</button>
          <button onClick={clearPriceFilter} className="w-full mt-2 text-sm text-gray-500">Clear</button>

          <h2 className="font-semibold mt-8 mb-4">Sort by</h2>
          <select value={currentSortOrder} onChange={handleSortChange} className="w-full p-2 border rounded">
            <option value="newest">Newest Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A-Z</option>
            <option value="name-desc">Name: Z-A</option>
          </select>
        </aside>

        {/* Product Grid */}
        <main className="md:col-span-3">
          {products.length === 0 ? (
            <p>No products found for this selection.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
