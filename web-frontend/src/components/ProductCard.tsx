// 'use client';

// import React from 'react';
// import Image from 'next/image';
// import Link from 'next/link';
// import type { Product } from '@/lib/api'; // Assuming Product interface is imported
// import { Card } from '@/components/ui/card'; // Only need the base Card component
// // REMOVED: import { urlFor } from '@/lib/sanity'; // This import is not needed as imageUrl is already a string URL from FastAPI

// interface ProductCardProps {
//   product: Product;
// }

// export default function ProductCard({ product }: ProductCardProps) {
//   // Assuming product has 'id', 'name' (for title), and 'imageUrl'
//   const { id, name, imageUrl, slug } = product; // Destructure slug here

//   return (
//     <Link
//       href={`/products/${slug}`} // <<<<< CHANGED TO USE SLUG FOR LINKING >>>>>
//       className="block group h-full text-center" // Link wrapper, full height, text-center for title below
//       aria-label={`View ${name} product details`}
//     >
//       <Card className="
//         w-full flex-shrink-0
//         overflow-hidden /* Ensures image doesn't spill out on hover scale */
//         shadow-md /* Subtle shadow for the card */
//         transition-all duration-300 ease-in-out
//         group-hover:shadow-xl /* Deeper shadow on hover */
//         border border-gray-100 /* Subtle border for definition */
//       ">
//         {/* Image directly inside the Card, taking full width and a fixed aspect ratio */}
//         <div className="relative w-full aspect-[3/2] /* Aspect ratio for the image, adjust as needed */">
//           {imageUrl ? (
//             <Image
//               src={imageUrl} // Use imageUrl directly as it's already a string URL
//               alt={name || 'Product image'}
//               fill
//               sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
//               style={{ objectFit: 'cover' }}
//               className="
//                 transition-transform duration-500 ease-in-out transform
//                 group-hover:scale-110 group-hover:brightness-90
//               "
//               // priority={product.order <= 3} // Priority might not be applicable for all products
//             />
//           ) : (
//             <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400 text-sm">
//               No Image
//             </div>
//           )}
//         </div>
//       </Card>
      
//       {/* Product Title positioned OUTSIDE the Card, directly below it */}
//       <h3 className="
//         mt-4 /* Margin top to separate from the card */
//         text-lg sm:text-xl font-semibold text-gray-800 /* Styling for the title */
//         group-hover:text-primary transition-colors duration-300 /* Hover effect for text */
//         leading-tight /* Tight line height */
//       ">
//         {name} {/* Display the product name as the title */}
//       </h3>
//     </Link>
//   );
// }



'use client';

import React from 'react';
import Image from 'next/image'; // Re-imported Next.js Image
import Link from 'next/link';   // Re-imported Next.js Link
import type { Product } from '@/lib/api'; // Assuming Product interface is imported
import { Card } from '@/components/ui/card'; // Only need the base Card component

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { id, name, imageUrl, slug, price } = product;

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
              alt={product.alt || `${name} product image`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              style={{ objectFit: 'cover' }} // Ensure image covers the area
              className="
                transition-transform duration-500 ease-in-out transform
                group-hover:scale-110 group-hover:brightness-90
              "
              priority={product.isFeatured} // Prioritize loading for featured products
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
            group-hover:text-primary transition-colors duration-300 /* Hover effect for text */
            leading-tight mb-2 /* Tight line height, margin bottom */
            truncate w-full text-center /* Truncate long names, center text */
          ">
            {name}
          </h3>
          <p className="
            text-xl font-bold text-primary-600 /* Prominent price styling */
            mt-1 /* Margin top for separation */
          ">
            ${price.toFixed(2)}
          </p>
          {/* Add to Cart button or other actions can go here, maybe on hover */}
        </div>
      </Card>
    </Link>
  );
}
