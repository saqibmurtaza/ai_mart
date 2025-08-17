'use client';

console.log('FASTAPI URL:', process.env.NEXT_PUBLIC_API_BASE_URL);

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import { CartItem, Product, fetchCartItems } from '@/lib/api';

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

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [errorCart, setErrorCart] = useState<string | null>(null);

  // Load (guest or user) cart at mount/login
useEffect(() => {
  const loadCart = async () => {
    setLoadingCart(true);
    setErrorCart(null);
    try {
      if (user && getToken) {
        const token = await getToken({ template: 'supabase' }) || undefined;
        const items = await fetchCartItems(token);
        setCartItems(items ?? []);
      } else {
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
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


  // Guest-to-user cart merge after login
  useEffect(() => {
    if (!user || !getToken) return;
    const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
    if (!guestCart.length) return;
    const mergeGuestCart = async () => {
      const token = await getToken({ template: 'supabase' }) ?? undefined;
      for (const item of guestCart) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/cart`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              // Do NOT send user_id if your backend infers user from JWT
              // user_id: user.id,
              product_id: item.product_id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              imageUrl: item.imageUrl,
              slug: item.slug,
              sku: item.sku
            })
          });
        } catch (err) {
          // Optionally toast or log
        }
      }
      localStorage.removeItem('guestCart');
      try {
        const items = await fetchCartItems(token);
        setCartItems(items ?? []);
      } catch {
        setCartItems([]);
      }
    };
    mergeGuestCart();
    // eslint-disable-next-line
  }, [user, getToken]);

  // ===============================
  // >> Hardened addItemToCart   <<
  // ===============================
  const addItemToCart = async (product: Product & { quantity?: number }) => {
    if (!product || typeof product !== "object" || !product.id) {
      toast.error('Cannot add item: Product info missing or corrupted.');
      return;
    }
    const quantity = product.quantity ?? 1;
    if (!user || !getToken) {
      // Guest mode
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const idx = guestCart.findIndex((item: CartItem) => item.product_id === product.id);
      if (idx > -1) {
        guestCart[idx].quantity += quantity;
      } else {
        guestCart.push({
          user_id: null,
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity,
          imageUrl: product.imageUrl,
          slug: product.slug,
          sku: product.sku
        });
      }
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
      setCartItems(guestCart);
      toast.success(`${product.name} added to cart!`);
      return;
    }
    try {
      const token = await getToken({ template: 'supabase' }) ?? undefined;
      const payload = {
        // Do NOT send user_id if backend infers user from JWT
        // user_id: user.id,
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        imageUrl: product.imageUrl,
        slug: product.slug,
        sku: product.sku
      };
      // ------- HARDENED: Never use a dynamic endpoint! -------
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
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        let errorData, errorText;
        try {
          errorData = await res.json();
        } catch (err) {
          errorText = await res.text();
          throw new Error(`Server error: ${res.status} - ${errorText?.slice(0, 80)}`);
        }
        throw new Error(errorData?.detail || 'Failed to add item to cart');
      }
      const updatedItem = await res.json();
      setCartItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.product_id === product.id);
        if (existingItem) {
          return prevItems.map((item) =>
            item.product_id === product.id ? updatedItem : item
          );
        } else {
          return [...prevItems, updatedItem];
        }
      });
      toast.success(`${product.name} added to cart`);
    } catch (error: any) {
      console.error('[CartContext] Error adding to cart:', error);
      toast.error(error.message || 'Could not add item.');
    }
  };

  const removeItemFromCart = async (productId: string) => {
    if (!user || !getToken) {
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const updatedCart = guestCart.filter((item: CartItem) => item.product_id !== productId);
      localStorage.setItem('guestCart', JSON.stringify(updatedCart));
      setCartItems(updatedCart);
      toast.success('Item removed.');
      return;
    }
    try {
      const token = await getToken({ template: 'supabase' }) ?? undefined;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/cart/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to remove item');
      setCartItems((prev) => prev.filter((item) => item.product_id !== productId));
      toast.success('Item removed.');
    } catch (error) {
      console.error('[CartContext] Failed to remove item:', error);
      toast.error('Could not remove item.');
    }
  };

  const updateItemQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) {
      await removeItemFromCart(productId);
      return;
    }
    if (!user || !getToken) {
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const updatedCart = guestCart.map((item: CartItem) =>
        item.product_id === productId ? { ...item, quantity } : item
      );
      localStorage.setItem('guestCart', JSON.stringify(updatedCart));
      setCartItems(updatedCart);
      return;
    }
    try {
      const token = await getToken({ template: 'supabase' }) ?? undefined;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });
      if (!res.ok) throw new Error('Failed to update quantity');
      const updatedItem = await res.json();
      setCartItems((prev) =>
        prev.map((item) => (item.product_id === productId ? updatedItem : item))
      );
    } catch (error) {
      console.error('[CartContext] Failed to update quantity:', error);
      toast.error('Could not update quantity.');
    }
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('guestCart');
    // Optionally: clear backend cart for signed-in users here, if you wish
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

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
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
