'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { checkout } from '@/lib/api';
import { createClient } from '@/utils/supabase/client';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    picture?: string;
    [key: string]: any;
  };
}

export default function CheckoutPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const { cartItems, cartTotal, loadingCart, errorCart, clearCart } = useCart();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    addressLine1: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  useEffect(() => {
    const supabase = createClient();
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsUserLoading(false);
    };
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error('You must be logged in to place an order.');
      return;
    }
    setIsProcessing(true);

    const shippingAddressString = [
      formData.fullName,
      formData.addressLine1,
      `${formData.city}, ${formData.state} ${formData.zipCode}`,
      formData.country,
    ]
      .filter(Boolean)
      .join(', ');

    const orderPayload = {
      user_id: user.id,
      shipping_address: shippingAddressString,
    };

    try {
      const result = await checkout(orderPayload);
      toast.success(`Order placed successfully! Order ID: ${result.order_id}`);
      clearCart();
      router.push(`/orders`);
    } catch (error: any) {
      console.error('Checkout failed:', error);
      toast.error(`Failed to process checkout: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loadingCart || isUserLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold">Loading...</h1>
      </div>
    );
  }

  if (errorCart) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>Failed to load cart for checkout: {errorCart}</p>
        <Link href="/cart" className="mt-4 inline-block text-blue-600 hover:underline">
          &larr; Back to Cart
        </Link>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
        <p>Please add items to your cart before checking out.</p>
        <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Complete Your Order</h1>
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-semibold mb-6">Shipping Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="fullName" type="text" placeholder="Full Name" required className="input input-bordered w-full" onChange={handleChange} />
            <input name="addressLine1" type="text" placeholder="Address Line 1" required className="input input-bordered w-full" onChange={handleChange} />
            <input name="city" type="text" placeholder="City" required className="input input-bordered w-full" onChange={handleChange} />
            <input name="state" type="text" placeholder="State/Province" required className="input input-bordered w-full" onChange={handleChange} />
            <input name="zipCode" type="text" placeholder="Zip/Postal Code" required className="input input-bordered w-full" onChange={handleChange} />
            <input name="country" type="text" placeholder="Country" required className="input input-bordered w-full" onChange={handleChange} />
            <button type="submit" className="btn btn-primary w-full mt-6" disabled={isProcessing}>
              {isProcessing ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.product_id} className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {item.imageUrl && <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-lg" />}
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="divider my-6"></div>
          <div className="flex justify-between text-xl font-bold">
            <span>Order Total:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <Link href="/cart" className="btn btn-ghost w-full mt-4">
            Edit Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
