// src/app/order-confirmation/[orderId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';

// Define TypeScript types to perfectly match your new backend Pydantic response models
interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
  name: string; // This now comes from the backend
  imageUrl?: string | null;
}

interface OrderDetails {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  shipping_address: string;
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
      if (!params.orderId) {
        setError("Order ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const token = await getToken({ template: 'supabase' });
        const response = await fetch(`${backendBase}/orders/${params.orderId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch order details.');
        }

        const data: OrderDetails = await response.json();
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
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-6 rounded-md mb-8 text-center">
          <h1 className="text-3xl font-bold">Thank You!</h1>
          <p className="mt-2">Your order has been successfully placed.</p>
        </div>
        
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 mb-6 text-sm text-gray-600">
            <p><strong>Order ID:</strong> {order.id.substring(0, 8)}...</p>
            <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span className="font-medium capitalize text-black">{order.status}</span></p>
            <p><strong>Shipping To:</strong> {order.shipping_address}</p>
          </div>

          <div className="divider"></div>

          <div className="space-y-4 my-6">
            {order.items.map((item) => (
              <div key={item.product_id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="object-cover rounded-md" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="divider"></div>

          <div className="flex justify-end text-xl font-bold mt-6">
            <span>Order Total:</span>
            <span className="ml-4">${order.total_amount.toFixed(2)}</span>
          </div>

          <div className="mt-8 text-center">
            <Link href="/orders" className="btn btn-primary">
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
