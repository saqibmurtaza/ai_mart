// src/app/checkout/payment/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';

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

export default function PaymentPage() {
  const router = useRouter();
  const { cartItems, cartItemCount, cartTotal, loadingCart } = useCart();
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('credit_card'); // Default to credit card
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 1. Fetch shipping address from sessionStorage
  useEffect(() => {
    const storedAddress = sessionStorage.getItem('shippingAddress');
    if (storedAddress) {
      setShippingAddress(JSON.parse(storedAddress));
    } else {
      // If no shipping address, redirect back to shipping step
      toast.error('Please provide shipping information first.');
      router.push('/checkout/shipping');
    }
  }, [router]);

  // 2. Redirect if cart is empty after loading
  useEffect(() => {
    if (!loadingCart && cartItemCount === 0) {
      toast.error("Your cart is empty. Please add items before checking out.");
      router.push('/products');
    }
  }, [loadingCart, cartItemCount, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation for payment method (can be expanded later)
    if (!selectedPaymentMethod) {
      setErrors({ paymentMethod: 'Please select a payment method.' });
      toast.error('Please select a payment method.');
      return;
    }

    // Store selected payment method in session storage
    sessionStorage.setItem('paymentMethod', selectedPaymentMethod);
    toast.success('Payment method selected!');
    router.push('/checkout/review'); // Navigate to the next step: Order Review
  };

  if (loadingCart || !shippingAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-700">Loading checkout details...</p>
      </div>
    );
  }

  if (cartItemCount === 0 && !loadingCart) {
    return null; // Handled by useEffect redirect
  }

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Checkout: Payment Method</h1>

      <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-lg shadow-xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Payment Selection */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Select Payment Method</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              {/* Option 1: Credit Card */}
              <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="credit_card"
                  checked={selectedPaymentMethod === 'credit_card'}
                  onChange={() => { setSelectedPaymentMethod('credit_card'); setErrors({}); }}
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="ml-3 text-lg font-medium text-gray-800">Credit Card</span>
                <div className="ml-auto flex items-center gap-2">
                    <Image src="/images/visa.png" alt="Visa" width={30} height={20} className="object-contain"/>
                    <Image src="/images/mastercard.png" alt="Mastercard" width={30} height={20} className="object-contain"/>
                    {/* Add more card icons as needed */}
                </div>
              </label>

              {/* Option 2: PayPal */}
              <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paypal"
                  checked={selectedPaymentMethod === 'paypal'}
                  onChange={() => { setSelectedPaymentMethod('paypal'); setErrors({}); }}
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="ml-3 text-lg font-medium text-gray-800">PayPal</span>
                <div className="ml-auto">
                    <Image src="/images/paypal.png" alt="PayPal" width={50} height={20} className="object-contain"/>
                </div>
              </label>

              {/* Option 3: Cash on Delivery (COD) */}
              <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={selectedPaymentMethod === 'cod'}
                  onChange={() => { setSelectedPaymentMethod('cod'); setErrors({}); }}
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="ml-3 text-lg font-medium text-gray-800">Cash on Delivery (COD)</span>
              </label>
            </div>
            {errors.paymentMethod && <p className="mt-2 text-sm text-red-600">{errors.paymentMethod}</p>}

            <div className="mt-6">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Continue to Order Review
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <Link href="/checkout/shipping" className="text-blue-600 hover:underline">
              ← Back to Shipping
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary and Shipping Details */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Order Summary</h2>
          <div className="space-y-3 mb-6">
            {cartItems.map(item => (
              <div key={item.product_id} className="flex justify-between items-center text-gray-700">
                <span>{item.name} (x{item.quantity})</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
              <span>Cart Total:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 mt-8">Shipping To</h2>
          {shippingAddress && (
            <div className="text-gray-700 space-y-1">
              <p className="font-medium">{shippingAddress.fullName}</p>
              <p>{shippingAddress.addressLine1}</p>
              {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
              <p>{shippingAddress.city}, {shippingAddress.stateProvince} {shippingAddress.postalCode}</p>
              <p>{shippingAddress.country}</p>
              <p>Phone: {shippingAddress.phone}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}