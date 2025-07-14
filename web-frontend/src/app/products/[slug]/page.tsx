// 'use client';

// import { useEffect, useState } from 'react';
// import { notFound } from 'next/navigation';
// import Image from 'next/image';
// import { PortableText } from '@portabletext/react';
// import { getProduct, Product as ProductType } from '@/lib/api'; // Alias Product to ProductType to avoid conflict

// // Fallback Button component if ShadCN's is not installed or found
// // If you have installed shadcn-ui button, you can remove this and keep the original import
// const Button = ({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
//   <button
//     className={`px-4 py-2 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors ${className}`}
//     {...props}
//   >
//     {children}
//   </button>
// );


// interface ProductPageProps {
//   params: {
//     slug: string; // Next.js will provide the slug from the URL
//   };
// }

// export default function ProductPage({ params }: ProductPageProps) {
//   const { slug } = params;
//   const [product, setProduct] = useState<ProductType | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     async function fetchProductData() {
//       setLoading(true);
//       setError(null);
//       try {
//         const fetchedProduct = await getProduct(slug); // Fetch product by slug
//         if (!fetchedProduct) {
//           notFound(); // If product not found, trigger Next.js notFound page
//         }
//         setProduct(fetchedProduct);
//       } catch (err: any) {
//         console.error(`Failed to fetch product ${slug}:`, err);
//         setError(err.message || 'Failed to load product details.');
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchProductData();
//   }, [slug]); // Re-fetch if slug changes

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <p className="text-xl text-gray-600">Loading product...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <p className="text-xl text-red-600">Error: {error}</p>
//       </div>
//     );
//   }

//   if (!product) {
//     // This case should ideally be caught by notFound() above, but as a fallback
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <p className="text-xl text-gray-600">Product not found.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-4 md:p-8 mt-12">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
//         {/* Product Image Section */}
//         <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg">
//           {product.imageUrl ? (
//             <Image
//               src={product.imageUrl}
//               alt={product.alt || product.name || 'Product Image'} // <<<<< Safely access product.alt >>>>>
//               fill
//               style={{ objectFit: 'contain' }} // Use 'contain' for product images
//               className="bg-gray-100 p-4" // Add some padding/background for contained images
//               priority // Prioritize loading for the main product image
//             />
//           ) : (
//             <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400 text-2xl">
//               No Image Available
//             </div>
//           )}
//         </div>

//         {/* Product Details Section */}
//         <div className="flex flex-col gap-4">
//           <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>
//           {product.category && (
//             <p className="text-lg text-gray-600">Category: {product.category}</p>
//           )}
//           <p className="text-3xl font-extrabold text-primary-600">${product.price.toFixed(2)}</p>
          
//           {product.description && (
//             <div className="text-gray-700 leading-relaxed prose prose-lg max-w-none">
//               {/* Ensure description is passed as 'value' to PortableText */}
//               <PortableText value={product.description} /> {/* <<<<< Value type now matches 'any' >>>>> */}
//             </div>
//           )}

//           <div className="mt-6 flex items-center gap-4">
//             <Button className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-md text-lg font-semibold shadow-md transition-colors duration-300">
//               Add to Cart
//             </Button>
//             {product.stock !== undefined && (
//               <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
//                 {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
//               </span>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


'use client';

import { useEffect, useState } from 'react';
import { getProduct, addToCart, Product } from '@/lib/api';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import { toast } from 'react-hot-toast'; // Import toast for notifications

// Placeholder for user ID. In a real app, this would come from authentication.
const MOCK_USER_ID = 'user_123'; // Consistent with cart page and ProductCard

export default function ProductDetailPage() {
  const { slug } = useParams(); // Get the slug from the URL
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProductData() {
      if (!slug) {
        setError('Product slug is missing.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Ensure slug is a string, as useParams can return string | string[]
        const productData = await getProduct(Array.isArray(slug) ? slug[0] : slug);
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
  }, [slug]); // Re-fetch when slug changes

  const handleAddToCart = async () => {
    if (!product) {
      toast.error("Cannot add an unknown product to cart.");
      return;
    }

    try {
      await addToCart({
        user_id: MOCK_USER_ID,
        product_id: product.slug || product.id, // Use slug if available, else id
        name: product.name,
        price: product.price,
        quantity: 1, // Add one quantity by default
        imageUrl: product.imageUrl, // Pass imageUrl for cart display
        sku: product.sku, // Pass sku for cart display
        slug: product.slug // Pass slug for cart display
      });
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
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">Product details not available.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 mt-12">
      <div className="flex flex-col lg:flex-row gap-12 bg-white rounded-lg shadow-lg p-8">
        {/* Product Image */}
        <div className="w-full lg:w-1/2 flex justify-center items-center">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.alt || `${product.name} product image`}
              width={600}
              height={600}
              className="rounded-lg shadow-md object-contain max-h-[600px] w-auto"
              priority // Prioritize loading for the main product image
            />
          ) : (
            <div className="flex items-center justify-center w-full h-96 bg-gray-100 text-gray-400 text-xl rounded-lg">
              No Image Available
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center text-center lg:text-left">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            {product.name}
          </h1>
          <p className="text-3xl font-bold text-blue-600 mb-6">
            ${product.price.toFixed(2)}
          </p>
          
          <div className="text-gray-700 text-lg leading-relaxed mb-8 prose">
            {product.description ? (
              <PortableText value={product.description} />
            ) : (
              <p>No description available for this product.</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md text-xl font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-lg"
              disabled={product.stock <= 0} // Disable if out of stock
            >
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>

            {/* Optionally, a "Buy Now" or "Add to Wishlist" button */}
            {/* <button
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-md text-xl font-semibold hover:bg-gray-300 transition-colors duration-200"
            >
              Buy Now
            </button> */}
          </div>

          {product.stock > 0 && (
            <p className="text-sm text-gray-500 mt-4">In Stock: {product.stock} units</p>
          )}
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
