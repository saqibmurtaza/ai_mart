'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/api';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.imageUrl || '/images/placeholder-image.png';

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl">
        <div className="aspect-square w-full bg-gray-100">
          <Image
            src={imageUrl}
            alt={product.name || 'Product'}
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="text-lg font-bold text-white">
            {product.name}
          </h3>
        </div>
      </div>
    </Link>
  );
}
