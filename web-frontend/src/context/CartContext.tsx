'use client';

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

  // --- Step 1: On load/sign-in/sign-out, load correct cart (guest/server) ---
  useEffect(() => {
    const loadCart = async () => {
      setLoadingCart(true);
      setErrorCart(null);
      if (!user || !getToken) {
        // Guest: use localStorage, never call backend!
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        setCartItems(guestCart);
        setLoadingCart(false);
        return;
      }
      // Logged-in: backend cart
      try {
        const token = await getToken({ template: 'supabase' });
        const items = await fetchCartItems(user.id, token);
        setCartItems(items ?? []);
      } catch (err) {
        setCartItems([]); // fallback to empty, backend failed
        setErrorCart('Failed to load cart');
      } finally {
        setLoadingCart(false);
      }
    };
    loadCart();
  }, [user, getToken]);

  // --- Step 2: Guest-to-User cart merge on login ---
  useEffect(() => {
    if (!user || !getToken) return;
    const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
    if (!guestCart.length) return;
    const mergeGuestCart = async () => {
      const token = await getToken({ template: 'supabase' });
      for (const item of guestCart) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/cart`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              user_id: user.id,
              product_id: item.product_id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              imageUrl: item.imageUrl,
              slug: item.slug,
              sku: item.sku
            })
          });
        } catch {
          // Optionally toast or log
        }
      }
      localStorage.removeItem('guestCart');
      // Reload backend cart
      try {
        const items = await fetchCartItems(user.id, token);
        setCartItems(items ?? []);
      } catch {
        setCartItems([]);
      }
    };
    mergeGuestCart();
    // eslint-disable-next-line
  }, [user, getToken]);

  // --- Add to Cart: guest uses local, user uses backend ---
  const addItemToCart = async (product: Product & { quantity?: number }) => {
    const quantity = product.quantity ?? 1;
    if (!product || !product.id) {
      toast.error('Cannot add item: Product info missing.');
      return;
    }
    if (!user || !getToken) {
      // Guest: localStorage cart
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
    // Auth user: backend fetch
    try {
      const token = await getToken({ template: 'supabase' });
      const payload = {
        user_id: user.id,
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        imageUrl: product.imageUrl,
        slug: product.slug,
        sku: product.sku
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to add item to cart');
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
      // Guest: localStorage
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const updatedCart = guestCart.filter((item: CartItem) => item.product_id !== productId);
      localStorage.setItem('guestCart', JSON.stringify(updatedCart));
      setCartItems(updatedCart);
      toast.success('Item removed.');
      return;
    }
    try {
      const token = await getToken({ template: 'supabase' });
      const response = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/cart/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to remove item');
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
      // Guest: localStorage
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const updatedCart = guestCart.map((item: CartItem) =>
        item.product_id === productId ? { ...item, quantity } : item
      );
      localStorage.setItem('guestCart', JSON.stringify(updatedCart));
      setCartItems(updatedCart);
      return;
    }
    try {
      const token = await getToken({ template: 'supabase' });
      const response = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });
      if (!response.ok) throw new Error('Failed to update quantity');
      const updatedItem = await response.json();
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
