'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { CategoryData } from '@/lib/api';

import { Card } from '@/components/ui/card'; // Only need the base Card component now

interface CategoryCardProps {
  category: CategoryData;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const { title, slug, imageUrl, alt } = category;

  return (
    <Link
      href={`/products?category=${slug}`}
      className="block group h-full text-center" // Link wrapper, ensure full height for grid alignment, text-center for title below
      aria-label={`Shop ${title} category`}
    >
      <Card className="
        w-full flex-shrink-0
        overflow-hidden /* Ensures image doesn't spill out on hover scale */
        shadow-md /* Subtle shadow for the card */
        transition-all duration-300 ease-in-out
        group-hover:shadow-xl /* Deeper shadow on hover */
        border border-gray-100 /* Subtle border for definition */
      ">
        {/* Image directly inside the Card, taking full width and a fixed aspect ratio */}
        <div className="relative w-full aspect-[3/2] /* Adjusted to aspect-[3/3] for a slightly wider image, closer to Image_1 */">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={alt || `${title} category image`}
              fill
              // Adjusted sizes to better reflect a 3-column layout where images are larger
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
              className="
                transition-transform duration-500 ease-in-out transform
                group-hover:scale-110 group-hover:brightness-90
              "
              priority={category.order <= 3}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400 text-sm">
              No Image
            </div>
          )}
        </div>
      </Card>
      
      {/* Category Title positioned OUTSIDE the Card, directly below it */}
      <h3 className="
        mt-4 /* Margin top to separate from the card */
        text-lg sm:text-xl font-semibold text-gray-800 /* Styling for the title */
        group-hover:text-primary transition-colors duration-300 /* Hover effect for text */
        leading-tight /* Tight line height */
      ">
        {title}
      </h3>
    </Link>
  );
}
