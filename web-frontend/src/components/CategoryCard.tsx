'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Category } from '@/lib/api';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  // FIX: Use 'imageUrl' field from the Category type and correct placeholder path
  const imageUrl = category.imageUrl || '/images/placeholder-image.png';

  return (
    <Link href={`/products?category=${category.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl">
        <div className="aspect-square w-full bg-gray-100">
          <Image src={imageUrl} alt={category.title} fill className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="text-lg font-bold text-white">{category.title}</h3>
        </div>
      </div>
    </Link>
  );
}
