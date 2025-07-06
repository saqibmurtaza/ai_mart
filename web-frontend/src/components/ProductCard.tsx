'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Product } from '@/lib/api'; // Use the Product interface from api.ts

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { id, name, imageUrl, price, category } = product;

  return (
    <Link
      href={`/products/${id}`} // Link to individual product detail page (will create later)
      className="block group h-full"
      aria-label={`View product ${name}`}
    >
      <Card className="
        w-full h-full flex flex-col justify-between
        overflow-hidden rounded-lg shadow-md
        transition-all duration-300 ease-in-out
        transform group-hover:-translate-y-1 group-hover:shadow-xl
        border border-gray-100 group-hover:border-primary-light
      ">
        <CardContent className="p-0 relative w-full aspect-[16/9] flex-shrink-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name || "Product image"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              style={{ objectFit: 'cover' }}
              className="
                transition-transform duration-500 ease-in-out transform
                group-hover:scale-110 group-hover:brightness-90
              "
              priority={false} // Only prioritize categories, not all products
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400 text-sm">
              No Image
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-4 pt-3 flex flex-col items-center flex-grow">
          <CardTitle className="
            text-lg sm:text-xl font-semibold text-gray-800
            group-hover:text-primary transition-colors duration-300
            leading-tight text-center mb-1
          ">
            {name}
          </CardTitle>
          <CardDescription className="text-base font-bold text-accent">
            ${price.toFixed(2)}
          </CardDescription>
          {category && (
            <CardDescription className="text-sm text-gray-500 mt-1">
              Category: {category}
            </CardDescription>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
