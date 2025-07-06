'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { CategoryData } from '@/lib/api';

// Import shadcn/ui Card components
// Ensure this path is correct based on your shadcn setup (typically @/components/ui/card)
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PortableText } from '@portabletext/react'; // Assuming PortableText is used for descriptions

interface CategoryCardProps {
  category: CategoryData;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const { title, slug, imageUrl, alt, description } = category; // Added description to destructuring

  return (
    <Link
      href={`/products?category=${slug}`}
      className="block group h-full" // Link wrapper, allow group-hover on the Card, ensure full height for grid alignment
      aria-label={`Shop ${title} category`}
    >
      <Card className="
        w-full h-full flex flex-col justify-between
        overflow-hidden rounded-lg shadow-md
        transition-all duration-300 ease-in-out
        transform group-hover:-translate-y-1 group-hover:shadow-xl
        border border-gray-100 group-hover:border-primary-light
      ">
        {/* CardContent for the image, taking full width and a fixed aspect ratio */}
        <CardContent className="p-0 relative w-full aspect-[16/9] flex-shrink-0"> {/* Use aspect-[16/9] from Tailwind JIT */}
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={alt || `${title} category image`}
              fill // Fill the parent container
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              style={{ objectFit: 'cover' }} // Cover the container, cropping if necessary
              className="
                transition-transform duration-500 ease-in-out transform
                group-hover:scale-110 group-hover:brightness-90
              " // Zoom in effect on hover, and slight darkening
              priority={category.order <= 3} // Prioritize top categories for LCP
            />
          ) : (
            // Placeholder if no image is available
            <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400 text-sm">
              No Image
            </div>
          )}
        </CardContent>
        
        {/* CardFooter for the title and optional description */}
        <CardFooter className="p-4 pt-3 flex flex-col items-center flex-grow"> {/* flex-grow to ensure vertical alignment */}
          <CardTitle className="
            text-lg sm:text-xl font-semibold text-gray-800
            group-hover:text-primary transition-colors duration-300
            leading-tight text-center mb-1
          ">
            {title}
          </CardTitle>
          {/* Optional: Render description if available and desired */}
          {description && (
            <CardDescription className="text-sm text-gray-600 mt-1 line-clamp-2">
              <PortableText value={description} />
            </CardDescription>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
