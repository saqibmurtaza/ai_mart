'use client';

import { useState, useEffect } from 'react';
import { getProductBySlug, Product } from '@/lib/api';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import { toast } from 'react-hot-toast';
import { useCart } from '@/context/CartContext';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItemToCart } = useCart();

  useEffect(() => {
    async function fetchProductData() {
      if (!slug) {
        setError('Product not found.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const productData = await getProductBySlug(Array.isArray(slug) ? slug[0] : slug);
        if (productData) {
          setProduct(productData);
        } else {
          setError('Product not found.');
        }
      } catch (err: any) {
        console.error('Failed to fetch product:', err);
        setError(err.message || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    }
    fetchProductData();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) {
      toast.error('Cannot add an unknown product to cart.');
      return;
    }
    try {
      addItemToCart(product);
      toast.success(`${product.name} added to cart!`);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.error(`Failed to add ${product.name} to cart: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">Loading product details...</p>
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
    return (
      <div className="flex justify-center">
        <p className="text-xl text-gray-600">Product details not available.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 mt-12">
      <div className="flex flex-col lg:flex-row gap-12 bg-white rounded-lg shadow-lg p-8">
        <div className="w-full lg:w-1/2 flex justify-center items-center">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.alt || `${product.name} product image`}
              width={600}
              height={600}
              className="rounded-lg shadow-md object-contain max-h-[600px] w-auto"
              priority
            />
          ) : (
            <div className="flex items-center justify-center w-full h-96 bg-gray-100 text-gray-400 text-xl rounded-lg">
              No Image Available
            </div>
          )}
        </div>
        <div className="w-full lg:w-1/2 flex flex-col justify-center text-center lg:text-left">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            {product.name}
          </h1>
          <p className="text-3xl font-bold text-blue-600 mb-6">
            ${product.price.toFixed(2)}
          </p>
          <div className="text-gray-700 text-lg leading-relaxed mb-8 prose">
            {product.description ? (
              typeof product.description === 'string' ? (
                <p>{product.description}</p>
              ) : (
                <PortableText value={product.description} />
              )
            ) : (
              <p>No description available for this product.</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md text-xl font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-lg"
              disabled={(product.stock ?? 0) <= 0}
            >
              {(product.stock ?? 0) > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            In Stock: {product.stock ?? 0} units
          </p>
          {product.sku && (
            <p className="text-sm text-gray-500 mt-2">SKU: {product.sku}</p>
          )}
          {product.category && (
            <p className="text-sm text-gray-500 mt-2">Category: {product.category}</p>
          )}
        </div>
      </div>
    </div>
  );
}
