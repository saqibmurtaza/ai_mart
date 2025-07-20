// frontend/app/checkout/page.tsx
'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext'; // Import useCart for cart details
import { toast } from 'react-hot-toast';

export default function CheckoutPage() {
  const { cartItems, cartTotal, loadingCart, errorCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // This is where you would typically send the order data to your backend API
    console.log('Order submitted with data:', {
      shippingInfo: formData,
      cartItems: cartItems,
      cartTotal: cartTotal,
    });
    toast.success('Shipping information submitted! (Order not yet placed)');
    // Further steps like calling an order placement API would go here
  };

  if (loadingCart) {
    return (
      <div className="container mx-auto p-4 py-8 text-center min-h-[60vh]">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>
        <p className="text-lg text-gray-600">Loading cart for checkout...</p>
      </div>
    );
  }

  if (errorCart) {
    return (
      <div className="container mx-auto p-4 py-8 text-center min-h-[60vh]">
        <h1 className="text-3xl font-bold text-red-600 mb-6">Error</h1>
        <p className="text-lg text-red-500">Failed to load cart for checkout: {errorCart}</p>
        <Link href="/cart" className="mt-4 inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
          Back to Cart
        </Link>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto p-4 py-8 text-center min-h-[60vh]">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Cart is Empty</h1>
        <p className="text-lg text-gray-600">Please add items to your cart before checking out.</p>
        <Link href="/products" className="mt-4 inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Complete Your Order</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Shipping Information Form */}
        <div className="w-full lg:w-2/3 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Shipping Information</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-full">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="fullName"
                id="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="col-span-full">
              <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">Address Line 1</label>
              <input
                type="text"
                name="addressLine1"
                id="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="col-span-full">
              <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">Address Line 2 (Optional)</label>
              <input
                type="text"
                name="addressLine2"
                id="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                name="city"
                id="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">State/Province</label>
              <input
                type="text"
                name="state"
                id="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">Zip/Postal Code</label>
              <input
                type="text"
                name="zipCode"
                id="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
              <input
                type="text"
                name="country"
                id="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Place Order Button */}
            <div className="col-span-full mt-6">
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-md text-lg font-semibold hover:bg-green-700 transition-colors duration-200"
              >
                Place Order (Placeholder)
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-1/3 bg-white rounded-lg shadow-md p-6 h-fit sticky top-24">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Order Summary</h2>
          <div className="space-y-4 mb-6">
            {cartItems.map((item) => (
              <div key={item.product_id} className="flex items-center justify-between text-gray-700">
                <div className="flex items-center gap-2">
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt={item.name || "Product Image"}
                      width={40}
                      height={40}
                      className="rounded-md"
                    />
                  )}
                  <span>{item.name} (x{item.quantity})</span>
                </div>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center text-xl font-bold text-gray-900 mb-6 border-t pt-4">
            <span>Order Total:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <Link href="/cart" className="block text-center text-blue-600 hover:underline mt-4">
            Edit Cart
          </Link>
        </div>
      </div>
    </div>
  );
}