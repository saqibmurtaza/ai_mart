// src/app/checkout/shipping/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext'; // To check if cart is empty
import { toast } from 'react-hot-toast';

// Define a type for shipping address
interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2: string; // Optional
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  phone: string;
}

export default function ShippingPage() {
  const router = useRouter();
  const { cartItemCount, loadingCart } = useCart(); // Access cart context

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: '',
    phone: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Redirect if cart is empty after loading
  useEffect(() => {
    if (!loadingCart && cartItemCount === 0) {
      toast.error("Your cart is empty. Please add items before checking out.");
      router.push('/products'); // Redirect to shop page
    }
  }, [loadingCart, cartItemCount, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
    // Clear error for the field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!shippingAddress.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!shippingAddress.addressLine1.trim()) newErrors.addressLine1 = 'Address Line 1 is required';
    if (!shippingAddress.city.trim()) newErrors.city = 'City is required';
    if (!shippingAddress.stateProvince.trim()) newErrors.stateProvince = 'State/Province is required';
    if (!shippingAddress.postalCode.trim()) newErrors.postalCode = 'Postal Code is required';
    if (!shippingAddress.country.trim()) newErrors.country = 'Country is required';
    if (!shippingAddress.phone.trim()) newErrors.phone = 'Phone Number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // For now, store in session storage and navigate to next step
      sessionStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
      toast.success('Shipping address saved!');
      router.push('/checkout/payment');
    } else {
      toast.error('Please correct the errors in the form.');
    }
  };

  if (loadingCart) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-700">Loading cart...</p>
      </div>
    );
  }

  if (cartItemCount === 0 && !loadingCart) {
    // This case is handled by useEffect redirect, but good to have a fallback render
    return null;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Checkout: Shipping Information</h1>
      
      <div className="max-w-3xl mx-auto bg-white p-6 md:p-10 rounded-lg shadow-xl">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={shippingAddress.fullName}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              required
            />
            {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
            <input
              type="text"
              id="addressLine1"
              name="addressLine1"
              value={shippingAddress.addressLine1}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${errors.addressLine1 ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              required
            />
            {errors.addressLine1 && <p className="mt-1 text-sm text-red-600">{errors.addressLine1}</p>}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
            <input
              type="text"
              id="addressLine2"
              name="addressLine2"
              value={shippingAddress.addressLine2}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={shippingAddress.city}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              required
            />
            {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
          </div>

          <div>
            <label htmlFor="stateProvince" className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
            <input
              type="text"
              id="stateProvince"
              name="stateProvince"
              value={shippingAddress.stateProvince}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${errors.stateProvince ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              required
            />
            {errors.stateProvince && <p className="mt-1 text-sm text-red-600">{errors.stateProvince}</p>}
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={shippingAddress.postalCode}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${errors.postalCode ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              required
            />
            {errors.postalCode && <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>}
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              id="country"
              name="country"
              value={shippingAddress.country}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${errors.country ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              required
            />
            {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel" // Use type="tel" for phone numbers
              id="phone"
              name="phone"
              value={shippingAddress.phone}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              required
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>

          <div className="md:col-span-2 mt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Continue to Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}