'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProducts, getCategories, Product as ProductType, Category } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategorySlug = searchParams.get('category') || '';
  const currentSortOrder = searchParams.get('sort') || 'newest';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';

  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);

  const updateSearchParams = useCallback((newCategory: string, newSort: string, newMinPrice: string, newMaxPrice: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newCategory) {
      params.set('category', newCategory);
    } else {
      params.delete('category');
    }
    
    params.set('sort', newSort);

    if (newMinPrice) {
      params.set('minPrice', newMinPrice);
    } else {
      params.delete('minPrice');
    }

    if (newMaxPrice) {
      params.set('maxPrice', newMaxPrice);
    } else {
      params.delete('maxPrice');
    }

    router.push(`/products?${params.toString()}`);
  }, [searchParams, router]);

  useEffect(() => {
    async function fetchPageData() {
      setLoading(true);
      setError(null);
      try {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);

        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts.filter(product => product !== null && product !== undefined && product.id !== undefined && product.id !== null));
      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        setError(err.message || 'Failed to load products or categories.');
      } finally {
        setLoading(false);
      }
    }
    fetchPageData();
  }, [currentCategorySlug, currentSortOrder, currentMinPrice, currentMaxPrice]);

  useEffect(() => {
    setMinPriceInput(currentMinPrice);
    setMaxPriceInput(currentMaxPrice);
  }, [currentMinPrice, currentMaxPrice]);

  const getPageTitle = () => {
    if (currentCategorySlug) {
      const activeCategory = categories.find(cat => cat.slug === currentCategorySlug);
      return activeCategory ? `Products in ${activeCategory.title}` : 'All Products';
    }
    return 'All Products';
  };

  const handleCategoryChange = (categorySlug: string) => {
    updateSearchParams(categorySlug, currentSortOrder, minPriceInput, maxPriceInput);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    updateSearchParams(currentCategorySlug, event.target.value, minPriceInput, maxPriceInput);
  };

  const handleMinPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMinPriceInput(event.target.value);
  };

  const handleMaxPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaxPriceInput(event.target.value);
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
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 mt-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 text-center">{getPageTitle()}</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-1/4 p-6 bg-white rounded-lg shadow-md h-fit sticky top-24">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Categories</h2>
          <nav>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors duration-200
                    ${currentCategorySlug === '' ? 'bg-blue-600 text-white font-semibold' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  All Categories
                </button>
              </li>
              {categories.map((category) => (
                <li key={category._id}>
                  <button
                    onClick={() => handleCategoryChange(category.slug)}
                    className={`w-full text-left px-4 py-2 rounded-md transition-colors duration-200
                      ${currentCategorySlug === category.slug ? 'bg-blue-600 text-white font-semibold' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                  >
                    {category.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Filter by Price</h2>
            <div className="flex flex-col space-y-3">
              <input
                type="number"
                placeholder="Min Price"
                value={minPriceInput}
                onChange={handleMinPriceChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={maxPriceInput}
                onChange={handleMaxPriceChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={applyPriceFilter}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Apply
                </button>
                <button
                  onClick={clearPriceFilter}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors duration-200"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </aside>
        <main className="flex-1">
          <div className="flex justify-end mb-6">
            <label htmlFor="sort-select" className="sr-only">Sort by</label>
            <select
              id="sort-select"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={handleSortChange}
              value={currentSortOrder}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A-Z</option>
              <option value="name-desc">Name: Z-A</option>
            </select>
          </div>
          {products.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-xl text-gray-600">No products found for this selection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product, index) => {
                if (!product.id) {
                  console.warn(`DEBUG (ShopPage): Product at index ${index} is missing an 'id' for its key. Product name: ${product.name || 'Unknown'}. Full product:`, product);
                }
                return (
                  <ProductCard key={product.id || `product-${index}`} product={product} />
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
