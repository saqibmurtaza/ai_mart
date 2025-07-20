// src/app/checkout/review/page.tsx
'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { checkout as apiCheckout } from '@/lib/api'; // Rename to avoid conflict with function name

// Define types for stored data
interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  phone: string;
}

// Placeholder for user ID.
const MOCK_USER_ID = 'user_123'; // Make sure this matches your CartContext's MOCK_USER_ID

export default function OrderReviewPage() {
  const router = useRouter();
  const { cartItems, cartTotal, loadingCart, fetchCart, removeItemFromCart } = useCart();
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Constants for fixed costs (for now) - these would ideally come from backend config
  const SHIPPING_COST = 10.00;
  const TAX_RATE = 0.08; // 8% tax

  const subtotal = cartTotal;
  const taxAmount = subtotal * TAX_RATE;
  const grandTotal = subtotal + SHIPPING_COST + taxAmount;


  // 1. Fetch shipping address and payment method from sessionStorage
  useEffect(() => {
    const storedAddress = sessionStorage.getItem('shippingAddress');
    const storedPaymentMethod = sessionStorage.getItem('paymentMethod');

    if (storedAddress) {
      setShippingAddress(JSON.parse(storedAddress));
    } else {
      toast.error('Shipping information is missing. Please go back.');
      router.push('/checkout/shipping');
      return; // Stop further execution
    }

    if (storedPaymentMethod) {
      setPaymentMethod(storedPaymentMethod);
    } else {
      toast.error('Payment method is missing. Please go back.');
      router.push('/checkout/payment');
      return; // Stop further execution
    }
  }, [router]);

  // 2. Redirect if cart is empty after loading
  useEffect(() => {
    if (!loadingCart && cartItems.length === 0) {
      toast.error("Your cart is empty. Please add items before checking out.");
      router.push('/products');
    }
  }, [loadingCart, cartItems, router]);

  const handlePlaceOrder = async () => {
    if (isPlacingOrder) return; // Prevent double submission
    
    setOrderError(null);
    setIsPlacingOrder(true);
    
    if (!shippingAddress || !paymentMethod || cartItems.length === 0) {
      setOrderError("Missing checkout details. Please review your cart, shipping, and payment information.");
      setIsPlacingOrder(false);
      return;
    }

    try {
      // Prepare order data for the backend
      const orderData = {
        user_id: MOCK_USER_ID,
        items: cartItems.map(item => ({
          product_id: item.product_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl, // Include if your backend expects it for order items
          sku: item.sku,
          slug: item.slug,
        })),
        shipping_address: {
          full_name: shippingAddress.fullName,
          address_line1: shippingAddress.addressLine1,
          address_line2: shippingAddress.addressLine2,
          city: shippingAddress.city,
          state_province: shippingAddress.stateProvince,
          postal_code: shippingAddress.postalCode,
          country: shippingAddress.country,
          phone: shippingAddress.phone,
        },
        payment_method: paymentMethod,
        order_total: grandTotal, // Send calculated total, backend should also verify
        // Add other fields as per your backend's POST /checkout endpoint
        // e.g., created_at, status (initial), transaction_id (if payment gateway integrated)
      };
      
      const response = await apiCheckout(orderData); // Call your backend's checkout API

      if (response && response.order_id) {
        toast.success('Order placed successfully!');
        // Clear cart after successful order
        // Note: Backend should also clear cart for the user_id if that's its logic.
        // If not, we can trigger `clearCart` from CartContext here.
        // For simplicity, let's assume backend clears cart or `fetchCart` will return empty.
        sessionStorage.removeItem('shippingAddress'); // Clear session data
        sessionStorage.removeItem('paymentMethod');
        await fetchCart(); // Re-fetch cart to ensure it's empty
        
        // Redirect to order success page
        router.push(`/checkout/success?orderId=${response.order_id}`);
      } else {
        throw new Error(response?.message || 'Failed to place order.');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setOrderError(err.message || 'An error occurred during checkout. Please try again.');
      toast.error(err.message || 'Failed to place order.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (loadingCart || !shippingAddress || !paymentMethod) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-700">Loading order review...</p>
      </div>
    );
  }

  if (cartItems.length === 0 && !loadingCart) {
    return null; // Handled by useEffect redirect
  }

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Checkout: Order Review</h1>

      <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-lg shadow-xl">
        {orderError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {orderError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Order Summary */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Items in Order</h2>
            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.product_id} className="flex justify-between items-center text-gray-700 border-b border-gray-100 pb-2 last:border-b-0 last:pb-0">
                  <div className="flex items-center">
                    <div className="relative w-16 h-16 mr-3 flex-shrink-0 rounded-md overflow-hidden">
                        <Image 
                            src={item.imageUrl || '/images/placeholder.png'} 
                            alt={item.name} 
                            fill 
                            style={{objectFit: 'cover'}}
                            sizes="64px"
                        />
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-500">SKU: {item.sku || 'N/A'}</p>
                    </div>
                  </div>
                  <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                    <span>Shipping:</span>
                    <span>${SHIPPING_COST.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                    <span>Tax ({TAX_RATE * 100}%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Order Total:</span>
                    <span>${grandTotal.toFixed(2)}</span>
                </div>
            </div>
          </div>

          {/* Shipping and Payment Details */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Shipping Details</h2>
            {shippingAddress && (
              <div className="text-gray-700 space-y-1 mb-6">
                <p className="font-medium">{shippingAddress.fullName}</p>
                <p>{shippingAddress.addressLine1}</p>
                {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                <p>{shippingAddress.city}, {shippingAddress.stateProvince} {shippingAddress.postalCode}</p>
                <p>{shippingAddress.country}</p>
                <p>Phone: {shippingAddress.phone}</p>
                <Link href="/checkout/shipping" className="text-blue-600 hover:underline text-sm mt-2 block">
                  Edit Shipping
                </Link>
              </div>
            )}

            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Payment Method</h2>
            {paymentMethod && (
              <div className="text-gray-700 space-y-1">
                <p className="font-medium capitalize">{paymentMethod.replace('_', ' ')}</p>
                {/* You can add more details here if your payment method has them, e.g., last 4 digits of card */}
                <Link href="/checkout/payment" className="text-blue-600 hover:underline text-sm mt-2 block">
                  Edit Payment
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Place Order Button */}
        <div className="mt-8">
          <button
            onClick={handlePlaceOrder}
            className={`w-full py-3 px-6 rounded-md text-lg font-semibold transition-colors duration-200 ${
              isPlacingOrder
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
            }`}
            disabled={isPlacingOrder}
          >
            {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}