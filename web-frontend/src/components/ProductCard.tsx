'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Product } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useCart } from '@/context/CartContext';
import { CartItemInput } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useUser();
  const { addItemToCart } = useCart();

  const handleAddToCart = async () => {
    if (!user?.id) {
      toast.error('Please log in to add items to your cart.');
      return;
    }

     if (!product._id) {
      console.warn('❌ Missing product._id. Full product object:', product);
      toast.error('Product is missing required information. Please try again later.');
      return;
    }

    try {
      await addItemToCart({
        ...product,
        quantity: 1,
      });
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
