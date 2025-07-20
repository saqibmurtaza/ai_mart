// src/app/cart/page.tsx
'use client';

import { useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// Import useCart hook from your CartContext
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast'; // Assuming you have react-hot-toast for notifications

export default function CartPage() {
  // Use the cart state and functions directly from CartContext
  const { 
    cartItems, 
    cartItemCount, // From context, though not directly used in this rendering for total count, good for consistency
    cartTotal, 
    loadingCart, // Renamed from 'loading' for clarity with context
    errorCart,   // Renamed from 'error' for clarity with context
    fetchCart,   // To re-fetch if needed (e.g., initial load, or error recovery)
    updateItemQuantity, // Use context's update function
    removeItemFromCart  // Use context's remove function
  } = useCart();

  // Fetch cart on component mount (this is handled by CartProvider's useEffect,
  // but keeping it here for explicit re-fetch if needed, or if CartProvider isn't parent)
  // However, since CartProvider handles the initial fetch, this useEffect is mostly redundant here
  // if CartPage is always wrapped by CartProvider.
  // For robustness, we can keep a simple fetch call here as a safeguard or initial load.
  useEffect(() => {
    // Only fetch if cartItems are not loaded and not already loading
    if (cartItems.length === 0 && !loadingCart && !errorCart) {
      fetchCart();
    }
  }, [cartItems.length, loadingCart, errorCart, fetchCart]);


  // Handlers now directly call functions from useCart context
  const handleQuantityChange = useCallback(async (productId: string, newQuantity: number) => {
    // The optimistic update and API call logic is now handled inside CartContext's updateItemQuantity
    await updateItemQuantity(productId, newQuantity);
    // toast messages are also handled by CartContext
  }, [updateItemQuantity]);

  const handleRemoveItem = useCallback(async (productId: string) => {
    // The optimistic update and API call logic is now handled inside CartContext's removeItemFromCart
    await removeItemFromCart(productId);
    // toast messages are also handled by CartContext
  }, [removeItemFromCart]);


  if (loadingCart) { // Use loadingCart from context
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">Loading cart...</p>
      </div>
    );
  }

  if (errorCart) { // Use errorCart from context
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-red-600">Error: {errorCart}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 mt-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Your Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow-md p-6">
          <p className="text-xl text-gray-600 mb-4">Your cart is empty.</p>
          <Link href="/products" className="text-blue-600 hover:underline text-lg">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items List */}
          <div className="flex-1 bg-white rounded-lg shadow-md p-6">
            <div className="hidden md:grid grid-cols-[1fr_2fr_1fr_1fr_0.5fr] gap-4 pb-4 border-b border-gray-200 font-semibold text-gray-700">
              <div>Product</div>
              <div>Details</div>
              <div className="text-center">Price</div>
              <div className="text-center">Quantity</div>
              <div className="text-right">Subtotal</div>
            </div>
            {cartItems.map((item) => (
              <div key={item.product_id} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr_1fr_0.5fr] gap-4 py-4 border-b border-gray-100 items-center">
                {/* Product Image & Link */}
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                    <Image
                      src={item.imageUrl || `https://placehold.co/80x80/e2e8f0/64748b?text=No+Image`}
                      alt={item.name}
                      fill
                      style={{objectFit: 'cover'}}
                      sizes="80px"
                    />
                  </div>
                  <Link href={`/products/${item.slug || item.product_id}`} className="text-lg font-semibold text-blue-600 hover:underline">
                    {item.name}
                  </Link>
                </div>

                {/* Product Details (can be expanded) */}
                <div>
                  <p className="text-gray-600 text-sm">SKU: {item.sku || 'N/A'}</p>
                </div>

                {/* Price */}
                <div className="text-center text-gray-800 font-medium">
                  ${item.price.toFixed(2)}
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)} // Pass product_id
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300 transition-colors"
                    aria-label={`Decrease quantity of ${item.name}`}
                  >
                    -
                  </button>
                  <span className="font-medium text-lg">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)} // Pass product_id
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300 transition-colors"
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    +
                  </button>
                </div>

                {/* Subtotal & Remove Button */}
                <div className="flex flex-col items-end md:items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                  <button
                    onClick={() => handleRemoveItem(item.product_id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="w-full lg:w-1/3 bg-white rounded-lg shadow-md p-6 h-fit sticky top-24">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Cart Summary</h2>
            <div className="flex justify-between items-center text-xl font-bold text-gray-900 mb-6">
              <span>Total:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            {/* FIX: Changed href to point directly to the shipping page */}
            <Link href="/checkout/shipping" passHref>
              <button className="w-full bg-green-600 text-white py-3 rounded-md text-lg font-semibold hover:bg-green-700 transition-colors duration-200">
                Proceed to Checkout
              </button>
            </Link>
            <Link href="/products" className="block text-center text-blue-600 hover:underline mt-4">
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}