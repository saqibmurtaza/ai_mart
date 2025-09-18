// src/app/checkout/page.tsx
'use client';

import { useAuth, useUser } from "@clerk/nextjs";
import { SignInButton } from '@/components/ClerkUI';
import { useState, useCallback } from 'react'; // Import useCallback
import Link from 'next/link';
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

  
  const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  // Log the client ID to the console for easy debugging
  console.log("Initializing PayPal with Client ID:", paypalClientId);

  // Use useCallback to stabilize the function identity across re-renders
  const createOrder = useCallback(async () => {
    console.log("CreateOrder function called. Cart Total:", cartTotal);
    
    if (cartTotal <= 0) {
      toast.error("Cart total must be greater than zero.");
      return "";
    }

    setErrorMessage(null);
    try {
      const token = await getToken({ template: "supabase" });
      const response = await fetch(`${backendBase}/api/orders/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      });
      const order = await response.json();
      if (!response.ok) throw new Error(order.detail || "Failed to create PayPal order.");
      
      console.log("Backend successfully created PayPal order:", order.orderID);
      return order.orderID;
    } catch (error: any) {
      toast.error("Could not initiate PayPal transaction.");
      setErrorMessage(String(error));
      return "";
    }
  }, [cartTotal, getToken, backendBase]); // Dependencies for useCallback

  // const onApprove = useCallback(async (data: { orderID: string }) => {
  //   setIsProcessing(true);
  //   setErrorMessage(null);
  //   try {
  //     const token = await getToken({ template: "supabase" });
  //     const response = await fetch(`${backendBase}/api/orders/${data.orderID}/capture`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
  //     });
  //     const orderDetails = await response.json();
  //     if (!response.ok) throw new Error(orderDetails.detail || "Failed to finalize order.");
      
  //     toast.success("Payment successful! Redirecting...");
  //     clearCart();
  //     router.refresh();
  //     router.push(`/order-confirmation/${orderDetails.orderId}`);
  //   } catch (error: any) {
  //     toast.error(error.message);
  //     setErrorMessage(error.message);
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // }, [getToken, backendBase, router, clearCart]);

  const onApprove = async (data: { orderID: string }) => {
  setIsProcessing(true);
  setErrorMessage(null);
  try {
    const token = await getToken({ template: "supabase" });
    const response = await fetch(`${backendBase}/api/orders/${data.orderID}/capture`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    });

    const orderDetails = await response.json();
    
    // --- CRITICAL FIX: Log the full response for debugging ---
    console.log("Full capture response from backend:", orderDetails);
    
    // Improved error check: Only throw if status is not OK or if PayPal indicates failure
    if (!response.ok || orderDetails.status !== "COMPLETED") {
      throw new Error(orderDetails.detail || orderDetails.error || "Failed to finalize order.");
    }
    
    toast.success("Payment successful! Redirecting...");
    clearCart();
    router.refresh();
    router.push(`/order-confirmation/${orderDetails.orderId || orderDetails.id}`);
  } catch (error: any) {
    console.error("Capture error details:", error);
    toast.error("Could not capture payment. Please try again.");
    setErrorMessage(error.message);
  } finally {
    setIsProcessing(false);
  }
};




  const onError = useCallback((err: any) => {
    toast.error("An unexpected payment error occurred.");
    setErrorMessage(err.toString());
  }, []);

  // --- Page Guards ---
  if (!paypalClientId) {
    return <div className="text-center p-8">Payment gateway is not configured.</div>;
  }
  if (loadingCart || !isLoaded) {
    return <div className="py-16 text-center"><span className="loading loading-dots loading-lg" /> Loading...</div>;
  }
  if (errorCart) {
    return <div className="py-10 text-center text-red-500">Error: {errorCart}</div>;
  }
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Sign in to Checkout</h1>
        <SignInButton mode="modal" fallbackRedirectUrl="/checkout"><button className="btn btn-primary">Sign in</button></SignInButton>
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
  
  const isButtonDisabled = loadingCart || cartTotal <= 0;

  return (
    <PayPalScriptProvider options={{ "clientId": paypalClientId, currency: "USD", intent: "capture" }}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Complete Your Order</h1>
        <div className="max-w-md mx-auto">
          <div className="bg-gray-50 p-6 rounded-lg">
            {/* Order Summary ... */}
            <div className="flex justify-between text-xl font-bold"><span>Order Total:</span><span>${cartTotal.toFixed(2)}</span></div>
          </div>
          
          <div className="mt-8 text-center">
            {isProcessing ? (
              <div className="p-4"><span className="loading loading-spinner" /><p>Finalizing your order...</p></div>
            ) : (
              <PayPalButtons
                // --- THE DEFINITIVE FIX ---
                // By changing the key, we force React to create a fresh instance of the PayPalButtons
                // component whenever the cart total changes from zero to non-zero, or vice-versa.
                // This guarantees the button script re-initializes correctly.
                key={cartTotal > 0 ? "paypal-buttons-ready" : "paypal-buttons-disabled"}
                style={{ layout: "vertical", label: "pay" }}
                createOrder={createOrder}
                onApprove={onApprove}
                onError={onError}
                disabled={isButtonDisabled}
              />
            )}
            {errorMessage && (<div className="text-red-500 mt-4"><p>Error: {errorMessage}</p></div>)}
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
