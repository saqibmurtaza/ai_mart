// app/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  shipping_address: string;
  total_amount: number;
  status: string;
  created_at: string;
  items?: OrderItem[];
}

export default function OrdersPage() {
  const { getToken, isSignedIn } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error('Missing auth token');

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || 'Failed to fetch orders');
        }

        const data = await res.json();
        setOrders(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    if (isSignedIn) {
      fetchOrders();
    }
  }, [isSignedIn]);

  if (!isSignedIn) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600">You must be signed in to view your orders.</p>
        <Link href="/checkout" className="btn btn-primary mt-4">
          Sign In
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 font-semibold">{error}</p>
        <Link href="/checkout" className="btn btn-primary mt-4">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Your Order History</h1>
      {orders.length === 0 ? (
        <p className="text-center text-gray-600">No orders found.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="mb-6 border rounded-md p-4 shadow-sm bg-white">
            <p className="text-sm font-semibold">Order #{order.id}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Shipping Address:</strong> {order.shipping_address}</p>
            <p><strong>Total:</strong> ${order.total_amount.toFixed(2)}</p>
            <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>

            {order.items && order.items.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Items:</h3>
                <ul className="space-y-2">
                  {order.items.map((item, index) => (
                    <li key={index} className="border rounded p-2 bg-gray-50">
                      <p><strong>{item.name}</strong></p>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: ${item.price.toFixed(2)}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))
      )}

      <div className="text-center mt-10">
        <p className="text-gray-600">Want to place another order?</p>
        <Link
          href="/products"
          className="mt-2 inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
