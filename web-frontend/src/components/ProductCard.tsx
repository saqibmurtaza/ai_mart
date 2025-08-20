// 'use client';

// import Image from 'next/image';
// import Link from 'next/link';
// import { Product } from '@/lib/api';

// interface ProductCardProps {
//   product: Product;
// }

// export default function ProductCard({ product }: ProductCardProps) {
//   const imageUrl = product.imageUrl || '/images/placeholder-image.png';

//   return (
//     <Link href={`/products/${product.slug}`} className="group block">
//       <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl">
//         <div className="aspect-square w-full bg-gray-100">
//           <Image
//             src={imageUrl}
//             alt={product.name || 'Product'}
//             fill
//             className="object-cover"
//           />
//         </div>
//         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
//         <div className="absolute bottom-0 left-0 p-4">
//           <h3 className="text-lg font-bold text-white">
//             {product.name}
//           </h3>
//         </div>
//       </div>
//     </Link>
//   );
// }


'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItemToCart } = useCart();
  const imageUrl = product.imageUrl || '/images/600x400.svg'; // Fallback image

  const handleAddToCart = () => {
    if (product) {
      addItemToCart(product);
    } else {
      toast.error("Cannot add item: product data is missing.");
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <Link href={`/products/${product.slug}`} className="block relative h-64 w-full">
        <Image
          src={imageUrl}
          alt={product.alt || product.name}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-lg truncate">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="text-gray-600 mt-1 flex-grow">${product.price.toFixed(2)}</p>
        <button
          onClick={handleAddToCart}
          className="mt-4 w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
