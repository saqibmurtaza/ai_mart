'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getOrders, Order } from '@/lib/api';
import { format } from 'date-fns';
import { useUser, useAuth } from '@clerk/nextjs';

export default function OrdersPage() {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setError('You need to log in to view your orders.');
        setLoading(false);
        return;
      }

      try {
        const token = await getToken({ template: 'supabase' });
        if (!token) throw new Error('Authentication token missing. Please re-login.');

        const userOrders = await getOrders(token);
        setOrders(userOrders);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, getToken]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-500">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 font-semibold">{error}</p>
        {!user && (
          <Link href="/sign-in" className="btn btn-primary mt-4">
            Login to view orders
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Your Order History</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-700">No Orders Found</h2>
          <p className="text-gray-500 mt-2">You haven't placed any orders yet.</p>
          <Link href="/products" className="btn btn-primary mt-6">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex flex-col md:flex-row justify-between md:items-center border-b pb-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-mono text-gray-800">{order.id}</p>
                </div>
                <div className="mt-2 md:mt-0 md:text-right">
                  <p className="text-sm text-gray-500">Date Placed</p>
                  <p className="font-semibold text-gray-800">
                    {format(new Date(order.created_at), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div className="mt-2 md:mt-0 md:text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${order.total_amount.toFixed(2)}
                  </p>
                </div>
                <div className="mt-2 md:mt-0 md:text-right">
                  <span
                    className={`badge capitalize ${
                      order.status === 'delivered'
                        ? 'badge-success'
                        : 'badge-warning'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Items in this order</h3>
                <ul className="space-y-4">
                  {order.items.map((item) => (
                    <li key={item.product_id} className="flex items-center space-x-4">
                      <Image
                        src={item.imageUrl || '/placeholder-image.png'}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="rounded-md border"
                      />
                      <div className="flex-grow">
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-700">
                        ${item.price.toFixed(2)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
