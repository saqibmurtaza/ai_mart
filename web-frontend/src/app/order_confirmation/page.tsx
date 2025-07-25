// frontend/app/order-confirmation/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Basic confetti effect for celebration
    if (typeof window !== 'undefined') {
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        setShowConfetti(true);
      });
    }
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center bg-white p-8 rounded-lg shadow-lg">
        <svg
          className="mx-auto h-24 w-24 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Order Placed Successfully!
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Thank you for your purchase. Your order has been confirmed.
        </p>
        {orderId && (
          <p className="mt-2 text-xl font-semibold text-gray-800">
            Order ID: <span className="text-blue-600">{orderId}</span>
          </p>
        )}
        <div className="mt-6">
          <Link
            href="/products"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Continue Shopping
          </Link>
        </div>
        <div className="mt-4">
          <Link
            href="/orders" // Assuming you'll have an orders page to view past orders
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View Your Orders
          </Link>
        </div>
      </div>
    </div>
  );
}