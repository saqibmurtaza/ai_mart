'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Category } from '@/lib/api';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/products?category=${category.slug}`} // use slug, not title
      className="block rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
    >
      <div className="relative w-full h-40">
        <img
          src={category.imageUrl || '/images/default-category.jpg'}
          alt={category.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 text-center">
        <h3 className="font-semibold text-lg">{category.title}</h3>
      </div>
    </Link>
  );
}
