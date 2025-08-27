// 'use client';

// import Image from 'next/image';
// import Link from 'next/link';
// import { useCart } from '@/context/CartContext';
// import { Product } from '@/lib/api';
// import { toast } from 'react-hot-toast';

// interface ProductCardProps {
//   product: Product;
// }

// export default function ProductCard({ product }: ProductCardProps) {
//   const { addItemToCart } = useCart();
//   const imageUrl = product.imageUrl || '/images/600x400.svg'; // Fallback image

//   const handleAddToCart = () => {
//     if (product) {
//       addItemToCart(product);
//     } else {
//       toast.error("Cannot add item: product data is missing.");
//     }
//   };

//   return (
//     <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
//       <Link href={`/products/${product.slug}`} className="block relative h-64 w-full">
//         <Image
//           src={imageUrl}
//           alt={product.alt || product.name}
//           layout="fill"
//           objectFit="cover"
//           className="transition-transform duration-300 group-hover:scale-105"
//         />
//       </Link>
//       <div className="p-4 flex flex-col flex-grow">
//         <h3 className="font-semibold text-lg truncate">
//           <Link href={`/products/${product.slug}`}>{product.name}</Link>
//         </h3>
//         <p className="text-gray-600 mt-1 flex-grow">${product.price.toFixed(2)}</p>
//         <button
//           onClick={handleAddToCart}
//           className="mt-4 w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors"
//         >
//           Add to Cart
//         </button>
//       </div>
//     </div>
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
  isPriority?: boolean;
}

export default function ProductCard({ product, isPriority = false }: ProductCardProps) {
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
          alt=""
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 group-hover:scale-105"
          priority={isPriority}
        />
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-lg truncate">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="text-gray-600 mt-1 flex-grow">${product.price.toFixed(2)}</p>
        <button
          onClick={handleAddToCart}
          className="mt-4 w-full bg-blue-700 text-white py-2 rounded-md hover:bg-blue-800 transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
