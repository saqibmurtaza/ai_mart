'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import { CartItem, Product, fetchCartItems } from '@/lib/api';

console.log('FASTAPI URL:', process.env.NEXT_PUBLIC_FASTAPI_URL);

export interface CartContextType {
  cart: CartItem[];
  cartItemCount: number;
  cartTotal: number;
  addItemToCart: (product: Product & { quantity?: number }) => Promise<void>;
  removeItemFromCart: (productId: string) => Promise<void>;
  updateItemQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  loadingCart: boolean;
  errorCart: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// ---------- Utilities for Guest Cart ----------
const getGuestCart = (): CartItem[] =>
  JSON.parse(localStorage.getItem('guestCart') || '[]');

const setGuestCart = (cart: CartItem[]) =>
  localStorage.setItem('guestCart', JSON.stringify(cart));

// ---------- CartProvider ----------
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [errorCart, setErrorCart] = useState<string | null>(null);

  // Load cart (user or guest) on mount/login
  useEffect(() => {
    const loadCart = async () => {
      setLoadingCart(true);
      try {
        if (user && getToken) {
          const token = await getToken({ template: 'supabase' }) ?? undefined;
          const items = await fetchCartItems(token);
          setCartItems(items?.map(i => ({ ...i, user_id: user.id })) ?? []);
        } else {
          const guestCart = getGuestCart().map(i => ({ ...i, user_id: "guest" }));
          setCartItems(guestCart);
        }
      } catch (err: any) {
        setErrorCart(err.message || 'Failed to load cart');
        setCartItems([]);
      } finally {
        setLoadingCart(false);
      }
    };
    loadCart();
  }, [user, getToken]);

  // Merge guest cart into user cart after login
  useEffect(() => {
    if (!user || !getToken) return;
    const guestCart = getGuestCart();
    if (!guestCart.length) return;

    const mergeGuestCart = async () => {
      const token = await getToken({ template: 'supabase' }) ?? undefined;
      for (const item of guestCart) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/cart`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ...item, user_id: user.id }),
          });
        } catch (err) {
          console.warn('[CartContext] Guest cart merge failed:', err);
        }
      }
      localStorage.removeItem('guestCart');
      try {
        const items = await fetchCartItems(token);
        setCartItems(items?.map(i => ({ ...i, user_id: user.id })) ?? []);
      } catch {
        setCartItems([]);
      }
    };
    mergeGuestCart();
  }, [user, getToken]);

  // ---------------- Actions ----------------
  const addItemToCart = async (product: Product & { quantity?: number }) => {
    if (!product?.id) {
      toast.error('Cannot add item: Product info missing or corrupted.');
      return;
    }

    const quantity = product.quantity ?? 1;

    // Guest mode
    if (!user || !getToken) {
      const guestCart = getGuestCart();
      const idx = guestCart.findIndex((i) => i.product_id === product.id);

      if (idx > -1) {
        guestCart[idx].quantity += quantity;
      } else {
        guestCart.push({
          user_id: "guest",
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity,
          imageUrl: product.imageUrl,
          slug: product.slug,
          sku: product.sku,
        });
      }
      setGuestCart(guestCart);
      setCartItems(guestCart);
      toast.success(`${product.name} added to cart!`);
      return;
    }

    // Authenticated mode
    try {
      const token = await getToken({ template: 'supabase' }) ?? undefined;
      const endpoint = `${process.env.NEXT_PUBLIC_FASTAPI_URL}/cart`;

      if (!endpoint || endpoint.includes('undefined') || endpoint.includes('/products/')) {
        throw new Error('Cart API URL misconfiguration');
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: user.id,
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity,
          imageUrl: product.imageUrl,
          slug: product.slug,
          sku: product.sku,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `Server error: ${res.status}`);
      }

      const updatedItem = await res.json();
      setCartItems((prev) => {
        const exists = prev.find((i) => i.product_id === product.id);
        return exists
          ? prev.map((i) => (i.product_id === product.id ? { ...updatedItem, user_id: user.id } : i))
          : [...prev, { ...updatedItem, user_id: user.id }];
      });
      toast.success(`${product.name} added to cart`);
    } catch (err: any) {
      console.error('[CartContext] Error adding item:', err);
      toast.error(err.message || 'Could not add item.');
    }
  };

  const removeItemFromCart = async (productId: string) => {
    if (!user || !getToken) {
      const updatedCart = getGuestCart().filter((i) => i.product_id !== productId);
      setGuestCart(updatedCart);
      setCartItems(updatedCart.map(i => ({ ...i, user_id: "guest" })));
      toast.success('Item removed.');
      return;
    }
    try {
      const token = await getToken({ template: 'supabase' }) ?? undefined;
      const res = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/cart/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to remove item');
      setCartItems((prev) => prev.filter((i) => i.product_id !== productId));
      toast.success('Item removed.');
    } catch (err) {
      console.error('[CartContext] Remove failed:', err);
      toast.error('Could not remove item.');
    }
  };

  const updateItemQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return removeItemFromCart(productId);

    if (!user || !getToken) {
      const updatedCart = getGuestCart().map((i) =>
        i.product_id === productId ? { ...i, quantity, user_id: "guest" } : i
      );
      setGuestCart(updatedCart);
      setCartItems(updatedCart);
      return;
    }
    try {
      const token = await getToken({ template: 'supabase' }) ?? undefined;
      const res = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity, user_id: user.id }),
      });
      if (!res.ok) throw new Error('Failed to update quantity');
      const updatedItem = await res.json();
      setCartItems((prev) =>
        prev.map((i) => (i.product_id === productId ? { ...updatedItem, user_id: user.id } : i))
      );
    } catch (err) {
      console.error('[CartContext] Quantity update failed:', err);
      toast.error('Could not update quantity.');
    }
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('guestCart');
  };

  const cartTotal = cartItems.reduce((t, i) => t + i.price * i.quantity, 0);
  const cartItemCount = cartItems.reduce((c, i) => c + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart: cartItems,
        cartItemCount,
        cartTotal,
        addItemToCart,
        removeItemFromCart,
        updateItemQuantity,
        clearCart,
        loadingCart,
        errorCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};
