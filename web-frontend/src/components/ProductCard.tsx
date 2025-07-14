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

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { addToCart } from '@/lib/api'; // Import addToCart function
import { toast } from 'react-hot-toast'; // Assuming you have react-hot-toast installed for notifications

interface ProductCardProps {
  product: Product;
}

// Placeholder for user ID. In a real app, this would come from authentication.
const MOCK_USER_ID = 'user_123'; // Consistent with cart page

export default function ProductCard({ product }: ProductCardProps) {
  const { id, name, imageUrl, slug, price, alt, isFeatured, sku } = product;

  // IMPORTANT: Add a check for null/undefined slug before rendering the Link
  if (!slug) {
    console.error("DEBUG (ProductCard): Product has a null or undefined slug, cannot create link:", product);
    return (
      <Card className="
        w-full flex-shrink-0
        overflow-hidden
        shadow-md
        border border-gray-100
        rounded-lg
        flex flex-col
        p-4 items-center text-center bg-red-50
      ">
        <p className="text-red-700 font-bold">Error: Product Missing Slug</p>
        <p className="text-sm text-gray-600">{name || 'Unknown Product'}</p>
        <div className="w-full aspect-[4/3] bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
          No Image / Invalid Link
        </div>
      </Card>
    );
  }

  const handleAddToCart = async (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent navigating to product detail page when button is clicked
    event.stopPropagation(); // Stop event from bubbling up to the Link

    try {
      await addToCart({
        user_id: MOCK_USER_ID,
        product_id: slug, // Using slug as product_id for cart, as per backend assumption
        name: name,
        price: price,
        quantity: 1, // Add one quantity by default
        imageUrl: imageUrl, // Pass imageUrl for cart display
        sku: sku, // Pass sku for cart display
        slug: slug // Pass slug for cart display
      });
      toast.success(`${name} added to cart!`); // Show success notification
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.error(`Failed to add ${name} to cart: ${error.message}`); // Show error notification
    }
  };

  return (
    <Link
      href={`/products/${slug}`} // Use Next.js Link for client-side navigation
      className="block group h-full text-center" // Link wrapper, ensure full height for grid alignment, text-center for title below
      aria-label={`View ${name} product details`}
    >
      <Card className="
        w-full flex-shrink-0
        overflow-hidden /* Ensures image doesn't spill out on hover scale */
        shadow-md /* Subtle shadow for the card */
        transition-all duration-300 ease-in-out
        group-hover:shadow-xl /* Deeper shadow on hover */
        group-hover:scale-[1.02] /* Slightly scale up the card on hover */
        border border-gray-100 /* Subtle border for definition */
        rounded-lg /* Rounded corners for the card */
        flex flex-col /* Use flexbox for internal layout */
      ">
        {/* Image container with fixed aspect ratio */}
        <div className="relative w-full aspect-[4/3] bg-gray-50 overflow-hidden rounded-t-lg">
          {imageUrl ? (
            <Image // Re-instated Next.js Image component
              src={imageUrl}
              alt={alt || `${name} product image`} // Use alt prop directly
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              style={{ objectFit: 'cover' }} // Ensure image covers the area
              className="
                transition-transform duration-500 ease-in-out transform
                group-hover:scale-110 group-hover:brightness-90
              "
              priority={isFeatured} // Use isFeatured prop directly
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400 text-sm">
              No Image
            </div>
          )}
        </div>

        {/* Product Details - positioned inside the Card for better grouping */}
        <div className="p-4 flex flex-col items-center flex-grow">
          <h3 className="
            text-lg sm:text-xl font-semibold text-gray-800 /* Styling for the title */
            group-hover:text-blue-600 transition-colors duration-300 /* Hover effect for text */
            leading-tight mb-2 /* Tight line height, margin bottom */
            truncate w-full text-center /* Truncate long names, center text */
          ">
            {name}
          </h3>
          <p className="
            text-xl font-bold text-gray-900 /* Prominent price styling */
            mt-1 /* Margin top for separation */
          ">
            ${price.toFixed(2)}
          </p>
          {/* Add to Cart button */}
          <button
            onClick={handleAddToCart}
            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 text-lg font-medium"
          >
            Add to Cart
          </button>
        </div>
      </Card>
    </Link>
  );
}
