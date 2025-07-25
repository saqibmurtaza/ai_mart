// 'use client';

// import React from 'react';
// import Image from 'next/image';
// import Link from 'next/link';
// import type { Product } from '@/lib/api'; // Assuming Product interface is imported
// import { Card } from '@/components/ui/card'; // Only need the base Card component

// interface ProductCardProps {
//   product: Product;
// }

// export default function ProductCard({ product }: ProductCardProps) {
//   // --- DEBUGGING: Log the product object received by the card ---
//   console.log("DEBUG (ProductCard): Product received:", product);
//   // --- END DEBUGGING ---

//   const { id, name, imageUrl, slug, price, alt, isFeatured } = product; // Destructure all needed props

//   // IMPORTANT: Add a check for null/undefined slug before rendering the Link
//   if (!slug) {
//     console.error("DEBUG (ProductCard): Product has a null or undefined slug, cannot create link:", product);
//     // You might want to render a fallback or a disabled card here
//     return (
//       <Card className="
//         w-full flex-shrink-0
//         overflow-hidden
//         shadow-md
//         border border-gray-100
//         rounded-lg
//         flex flex-col
//         p-4 items-center text-center bg-red-50
//       ">
//         <p className="text-red-700 font-bold">Error: Product Missing Slug</p>
//         <p className="text-sm text-gray-600">{name || 'Unknown Product'}</p>
//         <div className="w-full aspect-[4/3] bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
//           No Image / Invalid Link
//         </div>
//       </Card>
//     );
//   }

//   return (
//     <Link
//       href={`/products/${slug}`} // Use Next.js Link for client-side navigation
//       className="block group h-full text-center" // Link wrapper, ensure full height for grid alignment, text-center for title below
//       aria-label={`View ${name} product details`}
//     >
//       <Card className="
//         w-full flex-shrink-0
//         overflow-hidden /* Ensures image doesn't spill out on hover scale */
//         shadow-md /* Subtle shadow for the card */
//         transition-all duration-300 ease-in-out
//         group-hover:shadow-xl /* Deeper shadow on hover */
//         group-hover:scale-[1.02] /* Slightly scale up the card on hover */
//         border border-gray-100 /* Subtle border for definition */
//         rounded-lg /* Rounded corners for the card */
//         flex flex-col /* Use flexbox for internal layout */
//       ">
//         {/* Image container with fixed aspect ratio */}
//         <div className="relative w-full aspect-[4/3] bg-gray-50 overflow-hidden rounded-t-lg">
//           {imageUrl ? (
//             <Image // Re-instated Next.js Image component
//               src={imageUrl}
//               alt={alt || `${name} product image`} // Use alt prop directly
//               fill
//               sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
//               style={{ objectFit: 'cover' }} // Ensure image covers the area
//               className="
//                 transition-transform duration-500 ease-in-out transform
//                 group-hover:scale-110 group-hover:brightness-90
//               "
//               priority={isFeatured} // Use isFeatured prop directly
//             />
//           ) : (
//             <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400 text-sm">
//               No Image
//             </div>
//           )}
//         </div>

//         {/* Product Details - positioned inside the Card for better grouping */}
//         <div className="p-4 flex flex-col items-center flex-grow">
//           <h3 className="
//             text-lg sm:text-xl font-semibold text-gray-800 /* Styling for the title */
//             group-hover:text-primary transition-colors duration-300 /* Hover effect for text */
//             leading-tight mb-2 /* Tight line height, margin bottom */
//             truncate w-full text-center /* Truncate long names, center text */
//           ">
//             {name}
//           </h3>
//           <p className="
//             text-xl font-bold text-primary-600 /* Prominent price styling */
//             mt-1 /* Margin top for separation */
//           ">
//             ${price.toFixed(2)}
//           </p>
//           {/* Add to Cart button or other actions can go here, maybe on hover */}
//         </div>
//       </Card>
//     </Link>
//   );
// }

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { createClient } from '@/utils/supabase/client';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItemToCart } = useCart();

  const handleAddToCart = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please log in to add items to your cart.');
      return;
    }
    try {
      await addItemToCart(product);
      toast.success(`${product.name} added to cart!`);
    } catch (error: any) {
      toast.error(`Failed to add item: ${error.message}`);
    }
  };

  const imageUrl = product.imageUrl || '/images/placeholder-image.png';

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-lg group">
      <Link href={`/products/${product.slug}`}>
        <div className="relative w-full aspect-square bg-gray-100">
          <Image src={imageUrl} alt={product.name || 'Product'} fill className="object-cover" />
        </div>
      </Link>
      <div className="p-4">
        <h3 className="font-semibold truncate">{product.name}</h3>
        <p className="text-gray-600">${product.price?.toFixed(2)}</p>
        <button onClick={handleAddToCart} className="btn btn-primary w-full mt-2">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
