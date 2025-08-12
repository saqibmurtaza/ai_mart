// src/app/checkout/page.tsx
'use client';

import { useAuth, useUser, SignInButton } from "@clerk/nextjs";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { CartItem } from '@/lib/api';
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

export default function CheckoutPage() {
  const { cart, cartTotal, loadingCart, errorCart, clearCart } = useCart();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  // Calls your backend to set up the transaction with PayPal
  const createOrder = async () => {
    setErrorMessage(null); // Clear previous errors
    try {
      const token = await getToken({ template: "supabase" });
      const response = await fetch(`${backendBase}/api/orders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      const order = await response.json();
      if (!response.ok) {
        throw new Error(order.detail || "Failed to create PayPal order.");
      }
      
      return order.orderID;
    } catch (error: any) {
      toast.error(error.message);
      setErrorMessage(error.message);
      return "";
    }
  };

  // Called after the user approves the payment in the PayPal popup
  const onApprove = async (data: { orderID: string }) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const token = await getToken({ template: "supabase" });
      const response = await fetch(`${backendBase}/api/orders/${data.orderID}/capture`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      const orderDetails = await response.json();
      if (!response.ok) {
        throw new Error(orderDetails.detail || "Failed to finalize order.");
      }
      
      toast.success("Payment successful! Redirecting...");
      clearCart();
      router.refresh(); // Refreshes server components, updating the cart icon in the header
      
      // Redirect to the new confirmation page with the internal database ID
      router.push(`/order-confirmation/${orderDetails.orderId}`);

    } catch (error: any) {
      toast.error(error.message);
      setErrorMessage(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const onError = (err: any) => {
    toast.error("An unexpected payment error occurred.");
    setErrorMessage(err.toString());
  };


  if (!paypalClientId) {
    return <div className="text-center p-8">Payment gateway is not configured.</div>;
  }
  if (loadingCart || !isLoaded) {
    return <div className="py-16 text-center"><span className="loading loading-dots loading-lg" /> Loading...</div>;
  }
  if (errorCart) {
    return <div className="py-10 text-center text-red-500">Error loading cart: {errorCart}</div>;
  }
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Sign in to Checkout</h1>
        <SignInButton mode="modal" fallbackRedirectUrl="/checkout">
          <button className="btn btn-primary">Sign in</button>
        </SignInButton>
      </div>
    );
  }
  if (!cart || cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
        <Link href="/products" className="mt-4 inline-block text-blue-600 hover:underline">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={{ "clientId": paypalClientId, currency: "USD", intent: "capture" }}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Complete Your Order</h1>
        <div className="max-w-md mx-auto">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
            <div className="space-y-4">
              {cart.map((item: CartItem) => (
                <div key={item.product_id} className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    {item.imageUrl && (
                      <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-lg" />
                    )}
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
          </div>
          
          <div className="mt-8 text-center">
            {isProcessing ? (
              <div className="p-4">
                <span className="loading loading-spinner" />
                <p>Finalizing your order, please do not close this window...</p>
              </div>
            ) : (
              <PayPalButtons
                style={{ layout: "vertical", label: "pay" }}
                createOrder={createOrder}
                onApprove={onApprove}
                onError={onError}
              />
            )}

            {errorMessage && (
                <div className="text-red-500 mt-4">
                    <p>Error: {errorMessage}</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
