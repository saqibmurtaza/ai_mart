// 'use client';

// import { useEffect, useState } from 'react';
// import { useSearchParams } from 'next/navigation'; // Hook to read URL query parameters
// import { getProducts, Product } from '@/lib/api';
// import ProductCard from '@/components/ProductCard'; // Re-use your existing ProductCard

// export default function ShopPage() {
//   const searchParams = useSearchParams();
//   const categorySlug = searchParams.get('category'); // Get the 'category' query parameter

//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     async function fetchProducts() {
//       setLoading(true);
//       setError(null);
//       try {
//         // Pass the category slug to the API function if it exists
//         // The getProducts function in api.tsx already handles constructing the URL
//         // with ?category= if the 'category' argument is provided.
//         const fetchedProducts = await getProducts(categorySlug || undefined);
//         setProducts(fetchedProducts);
//         // Add a log here to see what products were fetched for the category
//         console.log(`Fetched products for category '${categorySlug}':`, fetchedProducts);
//       } catch (err: any) {
//         console.error('Failed to fetch products:', err);
//         setError(err.message || 'Failed to load products.');
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchProducts();
//   }, [categorySlug]); // Re-fetch products whenever the categorySlug changes in the URL

//   return (
//     <div className="container mx-auto p-4 md:p-8 mt-12">
//       <h1 className="text-4xl font-bold text-gray-900 mb-10 text-center">
//         {categorySlug ? `Products in ${categorySlug.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}` : 'All Products'}
//       </h1>

//       {loading ? (
//         <div className="text-center py-8 text-gray-600 text-lg">Loading products...</div>
//       ) : error ? (
//         <div className="text-center py-8 text-red-600 text-lg">Error: {error}</div>
//       ) : products.length > 0 ? (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
//           {products.map((product) => (
//             <ProductCard key={product.id} product={product} />
//           ))}
//         </div>
//       ) : (
//         <div className="text-center py-8 text-gray-600 text-lg">No products found for this category.</div>
//       )}
//     </div>
//   );
// }




'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProducts, getCategories, Product as ProductType, CategoryData } from '@/lib/api';
import ProductCard from '@/components/ProductCard'; // Ensure this path is correct

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategorySlug = searchParams.get('category') || '';

  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to update URL parameters
  const updateCategoryParam = useCallback((newCategory: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newCategory) {
      params.set('category', newCategory);
    } else {
      params.delete('category'); // Remove category param if "All Categories" is selected
    }
    router.push(`/products?${params.toString()}`);
  }, [searchParams, router]);

  useEffect(() => {
    async function fetchPageData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch categories for the sidebar filter
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);

        // Fetch products based on the current category slug from URL
        const fetchedProducts = await getProducts(currentCategorySlug || undefined);
        setProducts(fetchedProducts);
      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        setError(err.message || 'Failed to load products or categories.');
      } finally {
        setLoading(false);
      }
    }
    fetchPageData();
  }, [currentCategorySlug]); // Re-fetch data when the category slug in the URL changes

  const getPageTitle = () => {
    if (currentCategorySlug) {
      const activeCategory = categories.find(cat => cat.slug === currentCategorySlug);
      return activeCategory ? `Products in ${activeCategory.title}` : 'All Products';
    }
    return 'All Products';
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
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">{getPageTitle()}</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar for Categories */}
        <aside className="w-full lg:w-1/4 p-6 bg-white rounded-lg shadow-md h-fit sticky top-24">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Categories</h2>
          <nav>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => updateCategoryParam('')}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors duration-200
                    ${currentCategorySlug === '' ? 'bg-blue-600 text-white font-semibold' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  All Categories
                </button>
              </li>
              {categories.map((category) => (
                <li key={category._id}>
                  <button
                    onClick={() => updateCategoryParam(category.slug)}
                    className={`w-full text-left px-4 py-2 rounded-md transition-colors duration-200
                      ${currentCategorySlug === category.slug ? 'bg-blue-600 text-white font-semibold' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                  >
                    {category.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          {/* Future: Add other filters like price range, color, size here */}
        </aside>

        {/* Main Content Area for Products */}
        <main className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-xl text-gray-600">No products found for this selection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
