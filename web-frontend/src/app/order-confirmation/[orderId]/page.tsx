// src/app/order-confirmation/[orderId]/page.tsx
'use client';

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
  name?: string;  // Optional, from your response model
  imageUrl?: string;
}

interface OrderDetails {
  id: string;
  payment_order_id?: string;
  user_id: string;
  shipping_address: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export default function OrderConfirmationPage() {
  const { orderId } = useParams();  // Get dynamic orderId from URL
  const { getToken } = useAuth();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = await getToken({ template: "supabase" });
        const response = await fetch(`${backendBase}/orders/${orderId}`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch order details.");
        }

        const data: OrderDetails = await response.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message);
        toast.error("Could not load order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, getToken, backendBase]);

  if (loading) {
    return <div className="py-16 text-center"><span className="loading loading-dots loading-lg" /> Loading order details...</div>;
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        <h1 className="text-2xl font-bold mb-4">Error Loading Order</h1>
        <p>{error || "Order not found."}</p>
        <Link href="/orders" className="mt-4 inline-block text-blue-600 hover:underline">View All Orders</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Order Confirmation</h1>
      <div className="max-w-md mx-auto bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-6">Thank you for your order!</h2>
        <p className="mb-4">Order ID: {order.id}</p>
        <p className="mb-4">Status: {order.status}</p>
        <p className="mb-4">Shipping to: {order.shipping_address}</p>
        <p className="mb-4">Total: ${order.total_amount.toFixed(2)}</p>
        
        <h3 className="text-xl font-semibold mb-4">Order Items</h3>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.product_id} className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                {item.imageUrl && <Image src={item.imageUrl} alt={item.name || "Product"} width={64} height={64} className="rounded-lg" />}
                <div>
                  <p className="font-semibold">{item.name || "Product"}</p>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
              </div>
              <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/products" className="btn btn-primary">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
