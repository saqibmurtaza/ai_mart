'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import { getProduct, Product as ProductType } from '@/lib/api'; // Alias Product to ProductType to avoid conflict

// Fallback Button component if ShadCN's is not installed or found
// If you have installed shadcn-ui button, you can remove this and keep the original import
const Button = ({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`px-4 py-2 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);


interface ProductPageProps {
  params: {
    slug: string; // Next.js will provide the slug from the URL
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProductData() {
      setLoading(true);
      setError(null);
      try {
        const fetchedProduct = await getProduct(slug); // Fetch product by slug
        if (!fetchedProduct) {
          notFound(); // If product not found, trigger Next.js notFound page
        }
        setProduct(fetchedProduct);
      } catch (err: any) {
        console.error(`Failed to fetch product ${slug}:`, err);
        setError(err.message || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    }
    fetchProductData();
  }, [slug]); // Re-fetch if slug changes

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">Loading product...</p>
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

  if (!product) {
    // This case should ideally be caught by notFound() above, but as a fallback
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 mt-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Product Image Section */}
        <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.alt || product.name || 'Product Image'} // <<<<< Safely access product.alt >>>>>
              fill
              style={{ objectFit: 'contain' }} // Use 'contain' for product images
              className="bg-gray-100 p-4" // Add some padding/background for contained images
              priority // Prioritize loading for the main product image
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400 text-2xl">
              No Image Available
            </div>
          )}
        </div>

        {/* Product Details Section */}
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>
          {product.category && (
            <p className="text-lg text-gray-600">Category: {product.category}</p>
          )}
          <p className="text-3xl font-extrabold text-primary-600">${product.price.toFixed(2)}</p>
          
          {product.description && (
            <div className="text-gray-700 leading-relaxed prose prose-lg max-w-none">
              {/* Ensure description is passed as 'value' to PortableText */}
              <PortableText value={product.description} /> {/* <<<<< Value type now matches 'any' >>>>> */}
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <Button className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-md text-lg font-semibold shadow-md transition-colors duration-300">
              Add to Cart
            </Button>
            {product.stock !== undefined && (
              <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
