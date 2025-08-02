'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { addToCart, fetchCartItems /*, clearUserCartBackend */ } from '@/lib/api'; // import backend API helpers as needed
import { CartItem, Product } from '@/lib/api';
import { toast } from 'react-hot-toast';

export interface CartContextType {
  cart: CartItem[];
  cartItemCount: number;      // Total count of all items
  cartTotal: number;          // Total cart price
  addItemToCart: (product: Product & { quantity?: number }) => Promise<void>;
  removeItemFromCart: (productId: string) => Promise<void>;
  updateItemQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadingCart: boolean;
  errorCart: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState<boolean>(true);
  const [errorCart, setErrorCart] = useState<string | null>(null);

  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoadingCart(true);
        if (user?.id) {
          const items = await fetchCartItems(user.id);
          setCartItems(items ?? []);
        } else {
          const storedCart = localStorage.getItem('guestCart');
          if (storedCart) {
            setCartItems(JSON.parse(storedCart));
          } else {
            setCartItems([]);
          }
        }
      } catch (err) {
        console.error('[CartContext] Failed to load cart:', err);
        setErrorCart('Failed to load cart');
      } finally {
        setLoadingCart(false);
      }
    };

    loadCart();
  }, [user?.id]);

  const addItemToCart = async (product: Product & { quantity?: number }) => {
    const quantity = product.quantity ?? 1;

    if (!product.id) {
      console.error('[CartContext] Product is missing `id` (Supabase ID):', product);
      throw new Error('Product id (Supabase) is required but missing.');
    }

    const cartItem: CartItem = {
      user_id: user?.id ?? 'guest',
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: product.imageUrl,
      slug: product.slug,
      sku: product.sku,
    };

    if (user?.id) {
      try {
        await addToCart(cartItem);
        setCartItems((prevItems) => {
          const existing = prevItems.find((item) => item.product_id === product.id);
          if (existing) {
            return prevItems.map((item) =>
              item.product_id === product.id ? { ...item, quantity: item.quantity + quantity } : item
            );
          } else {
            return [...prevItems, cartItem];
          }
        });
      } catch (error: any) {
        console.error('[CartContext] Error adding to cart (logged in):', error);
        toast.error('Failed to add item to cart: ' + (error instanceof Error ? error.message : String(error)));
        throw error;
      }
    } else {
      try {
        const storedCart = localStorage.getItem('guestCart');
        const guestItems: CartItem[] = storedCart ? JSON.parse(storedCart) : [];

        const updatedCart = guestItems.find((item) => item.product_id === product.id)
          ? guestItems.map((item) =>
              item.product_id === product.id ? { ...item, quantity: item.quantity + quantity } : item
            )
          : [...guestItems, cartItem];

        localStorage.setItem('guestCart', JSON.stringify(updatedCart));
        setCartItems(updatedCart);
      } catch (error) {
        console.error('[CartContext] Error saving guest cart:', error);
        toast.error('Failed to save guest cart: ' + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  const removeItemFromCart = async (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product_id !== productId));
    // TODO: Add backend removal if needed
    // e.g., await removeFromCartBackend(user?.id, productId);
  };

  const updateItemQuantity = async (productId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.product_id === productId ? { ...item, quantity } : item))
    );
    // TODO: Add backend update if needed
    // e.g., await updateCartQuantityBackend(user?.id, productId, quantity);
  };

  const clearCart = async () => {
    setCartItems([]);
    if (user?.id) {
      try {
        // If your backend supports clearing cart:
        // await clearUserCartBackend(user.id);
      } catch (error) {
        console.error('[CartContext] Failed to clear backend cart:', error);
      }
    } else {
      localStorage.removeItem('guestCart');
    }
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
