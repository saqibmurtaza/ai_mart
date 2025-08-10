// 'use client';

// import { useUser, useClerk, useAuth, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import Image from 'next/image';
// import { useCallback } from 'react';
// import { useCart } from '@/context/CartContext';
// import type { CartItem as CartItemType } from '@/lib/api';

// export default function CartPage() {
//   const { user } = useUser();
//   const { openSignIn } = useClerk();
//   const { getToken } = useAuth();
//   const router = useRouter();

//   const {
//     cart,
//     cartTotal,
//     loadingCart,
//     errorCart,
//     updateItemQuantity,
//     removeItemFromCart,
//   } = useCart();

//   const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

//   const safeMessage = useCallback(async (res: Response) => {
//     try {
//       const j = await res.json();
//       return j?.detail || j?.message || `HTTP ${res.status}`;
//     } catch {
//       return `HTTP ${res.status}`;
//     }
//   }, []);

//   const handleQuantityChange = useCallback(
//     async (productId: string, newQuantity: number) => {
//       await updateItemQuantity(productId, newQuantity);
//     },
//     [updateItemQuantity]
//   );

//   const handleRemoveItem = useCallback(
//     async (productId: string) => {
//       await removeItemFromCart(productId);
//     },
//     [removeItemFromCart]
//   );

//   const onCheckout = useCallback(async () => {
//     if (!user) {
//       await openSignIn({ redirectUrl: '/checkout' });
//       return;
//     }

//     const token = await getToken({ template: 'supabase' });

//     const res = await fetch(`${backendBase}/checkout`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`,
//       },
//       body: JSON.stringify({ shipping_address: '' }),
//       cache: 'no-store',
//     });

//     if (!res.ok) {
//       const msg = await safeMessage(res);
//       throw new Error(`Failed to process checkout: ${msg}`);
//     }

//     router.refresh();
//     router.push('/orders');
//   }, [user, openSignIn, getToken, backendBase, router, safeMessage]);

//   if (loadingCart) {
//     return (
//       <div className="py-16 text-center">
//         <span className="loading loading-dots loading-lg" /> Loading cart...
//       </div>
//     );
//   }

//   if (errorCart) {
//     return (
//       <div className="py-10 text-center text-red-600">
//         Error loading cart: {errorCart}
//       </div>
//     );
//   }

//   if (!cart || cart.length === 0) {
//     return (
//       <div className="py-16 text-center text-gray-600">
//         <div>Your cart is empty.</div>
//         <Link href="/products">
//           <button className="mt-6 bg-blue-600 text-white py-3 px-8 rounded-lg font-bold text-lg hover:bg-blue-700">
//             Continue Shopping
//           </button>
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto max-w-3xl px-4 py-8">
//       <h1 className="text-3xl font-semibold mb-6">Shopping Cart</h1>
//       <div className="divide-y divide-gray-200">
//         {cart.map((item: CartItemType, index: number) => (
//           <div
//             key={item.product_id ?? index}
//             className="flex items-center py-4 gap-4"
//           >
//             <div>
//               {item.imageUrl ? (
//                 <Image
//                   src={item.imageUrl}
//                   alt={item.name}
//                   width={90}
//                   height={90}
//                   className="bg-gray-100 object-cover rounded-lg"
//                 />
//               ) : (
//                 <div className="bg-gray-100 w-[90px] h-[90px] flex items-center justify-center rounded-lg">
//                   <span className="text-gray-400">No image</span>
//                 </div>
//               )}
//             </div>
//             <div className="flex-1">
//               <div className="font-medium">{item.name}</div>
//               <div className="text-gray-400 text-sm">{item.sku ? `SKU: ${item.sku}` : ''}</div>
//             </div>
//             <div className="flex items-center gap-2">
//               <input
//                 type="number"
//                 min={1}
//                 value={item.quantity}
//                 onChange={e => handleQuantityChange(item.product_id, Number(e.target.value))}
//                 className="w-14 border border-gray-300 rounded px-2 py-1"
//               />
//               <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
//               <button
//                 onClick={() => handleRemoveItem(item.product_id)}
//                 className="ml-2 text-red-600 hover:underline"
//                 aria-label="Remove item"
//               >
//                 Remove
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//       <div className="pt-8 text-right text-2xl">
//         Total: <span className="font-bold">${cartTotal.toFixed(2)}</span>
//       </div>
//       <div className="pt-4 flex flex-col md:flex-row justify-between gap-4">
//         <Link href="/products">
//           <button className="bg-gray-200 hover:bg-gray-300 text-blue-700 py-3 px-8 rounded-lg font-bold text-lg">
//             Continue Shopping
//           </button>
//         </Link>

//         <SignedOut>
//           <SignInButton mode="modal" fallbackRedirectUrl="/checkout" signUpFallbackRedirectUrl="/checkout">
//             <button
//               className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-bold text-lg"
//               type="button"
//             >
//               Sign in to Checkout
//             </button>
//           </SignInButton>
//         </SignedOut>

//         <SignedIn>
//           <button
//             className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-bold text-lg disabled:bg-blue-300"
//             onClick={onCheckout}
//             type="button"
//           >
//             Proceed to Checkout
//           </button>
//         </SignedIn>
//       </div>
//     </div>
//   );
// }



'use client';

import { useUser, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import type { CartItem as CartItemType } from '@/lib/api';

export default function CartPage() {
  const {
    cart,
    cartTotal,
    loadingCart,
    errorCart,
    updateItemQuantity,
    removeItemFromCart,
  } = useCart();

  const handleQuantityChange = useCallback(
    async (productId: string, newQuantity: number) => {
      await updateItemQuantity(productId, newQuantity);
    },
    [updateItemQuantity]
  );

  const handleRemoveItem = useCallback(
    async (productId: string) => {
      await removeItemFromCart(productId);
    },
    [removeItemFromCart]
  );

  if (loadingCart) {
    return (
      <div className="py-16 text-center">
        <span className="loading loading-dots loading-lg" /> Loading cart...
      </div>
    );
  }

  if (errorCart) {
    return (
      <div className="py-10 text-center text-red-600">
        Error loading cart: {errorCart}
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="py-16 text-center text-gray-600">
        <div>Your cart is empty.</div>
        <Link href="/products">
          <button className="mt-6 bg-blue-600 text-white py-3 px-8 rounded-lg font-bold text-lg hover:bg-blue-700">
            Continue Shopping
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">Shopping Cart</h1>
      <div className="divide-y divide-gray-200">
        {cart.map((item: CartItemType, index: number) => (
          <div
            key={item.product_id ?? index}
            className="flex items-center py-4 gap-4"
          >
            <div>
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={90}
                  height={90}
                  className="bg-gray-100 object-cover rounded-lg"
                />
              ) : (
                <div className="bg-gray-100 w-[90px] h-[90px] flex items-center justify-center rounded-lg">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium">{item.name}</div>
              <div className="text-gray-400 text-sm">{item.sku ? `SKU: ${item.sku}` : ''}</div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={e => handleQuantityChange(item.product_id, Number(e.target.value))}
                className="w-14 border border-gray-300 rounded px-2 py-1"
              />
              <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
              <button
                onClick={() => handleRemoveItem(item.product_id)}
                className="ml-2 text-red-600 hover:underline"
                aria-label="Remove item"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="pt-8 text-right text-2xl">
        Total: <span className="font-bold">${cartTotal.toFixed(2)}</span>
      </div>
      <div className="pt-4 flex flex-col md:flex-row justify-between gap-4">
        <Link href="/products">
          <button className="bg-gray-200 hover:bg-gray-300 text-blue-700 py-3 px-8 rounded-lg font-bold text-lg">
            Continue Shopping
          </button>
        </Link>

        <SignedOut>
          <SignInButton mode="modal" fallbackRedirectUrl="/checkout" signUpFallbackRedirectUrl="/checkout">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-bold text-lg"
              type="button"
            >
              Sign in to Checkout
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <Link href="/checkout">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-bold text-lg"
              type="button"
            >
              Proceed to Checkout
            </button>
          </Link>
        </SignedIn>
      </div>
    </div>
  );
}
