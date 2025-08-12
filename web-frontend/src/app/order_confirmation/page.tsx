// src/app/order-confirmation/[orderId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';

// Define TypeScript types to match your backend response
interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
  name: string;
  imageUrl?: string;
}

interface OrderDetails {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export default function OrderConfirmationPage({ params }: { params: { orderId: string } }) {
  const { getToken } = useAuth();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!params.orderId) return;
      try {
        const token = await getToken({ template: 'supabase' });
        const response = await fetch(`${backendBase}/orders/${params.orderId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch order details.');
        const data = await response.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [params.orderId, getToken, backendBase]);

  if (loading) {
    return <div className="text-center p-10"><span className="loading loading-dots loading-lg" /></div>;
  }
  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }
  if (!order) {
    return <div className="text-center p-10">Order not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-8">
        <h1 className="text-2xl font-bold">Thank you for your order!</h1>
        <p>Your order has been confirmed. You will receive an email receipt shortly.</p>
      </div>
      <div className="max-w-2xl mx-auto border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary (ID: {order.id.substring(0, 8)})</h2>
        {/* Display order details here */}
      </div>
    </div>
  );
}
