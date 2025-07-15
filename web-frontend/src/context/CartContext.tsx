'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getCart, addToCart, removeFromCart, Product } from '@/lib/api';
import { toast } from 'react-hot-toast';

// Placeholder for user ID. In a real app, get this from authentication.
const MOCK_USER_ID = 'user_123';

interface CartItemData {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  slug?: string;
  sku?: string;
}

interface CartContextType {
  cartItems: CartItemData[];
  cartItemCount: number;
  cartTotal: number;
  loadingCart: boolean;
  errorCart: string | null;
  fetchCart: () => Promise<void>;
  addItemToCart: (product: Product, quantity?: number) => Promise<void>;
  updateItemQuantity: (productId: string, newQuantity: number) => Promise<void>;
  removeItemFromCart: (productId: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [loadingCart, setLoadingCart] = useState<boolean>(true);
  const [errorCart, setErrorCart] = useState<string | null>(null);

  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const fetchCart = useCallback(async (): Promise<void> => {
    setLoadingCart(true);
    setErrorCart(null);
    try {
      const response = await getCart(MOCK_USER_ID);
      if (response && Array.isArray(response.cart)) {
        setCartItems(response.cart);
      } else {
        setCartItems([]);
      }
    } catch (err: any) {
      setErrorCart(err.message || 'Failed to load cart.');
      setCartItems([]);
    } finally {
      setLoadingCart(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItemToCart = useCallback(
    async (product: Product, quantity: number = 1): Promise<void> => {
      // 1. Snapshot the current state for rollback if API fails
      const previousCartItems = [...cartItems];

      // Determine product ID to use (slug or generic id)
      const productIdToUse = product.slug || (product as any).id;
      if (!productIdToUse) {
        toast.error(`Cannot add ${product.name} to cart: Missing ID.`);
        return;
      }

      // 2. Optimistic Update: Update UI state immediately
      setCartItems(currentItems => {
        const existingItemIndex = currentItems.findIndex(
          item => item.product_id === productIdToUse
        );

        if (existingItemIndex > -1) {
          // Item exists, update quantity optimistically
          const updatedItems = [...currentItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity,
          };
          return updatedItems;
        } else {
          // New item, add to cart optimistically
          return [
            ...currentItems,
            {
              product_id: productIdToUse,
              name: product.name,
              price: product.price,
              quantity: quantity,
              imageUrl: product.imageUrl,
              slug: product.slug,
              sku: product.sku,
            },
          ];
        }
      });
      toast.success(`${product.name} added to cart!`); // Show success message immediately

      try {
        // 3. Call the backend API
        await addToCart({
          user_id: MOCK_USER_ID,
          product_id: productIdToUse,
          name: product.name,
          price: product.price,
          quantity: quantity, // Quantity to add/set for the backend
          imageUrl: product.imageUrl,
          slug: product.slug,
          sku: product.sku,
        });

        // 4. After successful API call, re-fetch to ensure consistency (especially for new items with backend-assigned IDs or complex price calculations)
        await fetchCart();
      } catch (error: any) {
        toast.error(`Failed to add ${product.name} to cart: ${error.message}`);
        // 5. Rollback on failure: Revert UI to previous state
        setCartItems(previousCartItems);
        // And then fetch actual state from backend to be safe
        await fetchCart();
      }
    },
    [cartItems, fetchCart]
  );

  const updateItemQuantity = useCallback(
    async (productId: string, newQuantity: number): Promise<void> => {
      if (newQuantity <= 0) {
        await removeItemFromCart(productId);
        return;
      }

      // 1. Snapshot the current state for rollback
      const previousCartItems = [...cartItems];
      const existingItem = previousCartItems.find(item => item.product_id === productId);

      if (!existingItem) {
        toast.error('Item not found in cart to update quantity.');
        return;
      }

      // 2. Optimistic Update
      setCartItems(currentItems =>
        currentItems.map(item =>
          item.product_id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
      toast.success(`Quantity updated for ${existingItem.name}.`); // Show success message immediately

      try {
        // 3. Call the backend API
        await addToCart({
          user_id: MOCK_USER_ID,
          product_id: productId,
          name: existingItem.name,
          price: existingItem.price,
          quantity: newQuantity,
          imageUrl: existingItem.imageUrl,
          slug: existingItem.slug,
          sku: existingItem.sku,
        });

        // 4. After successful API call, re-fetch to ensure consistency
        await fetchCart();
      } catch (error: any) {
        toast.error(`Failed to update quantity for ${existingItem.name}: ${error.message}`);
        // 5. Rollback on failure
        setCartItems(previousCartItems);
        await fetchCart(); // Re-fetch to get the true state if optimistic failed
      }
    },
    [fetchCart, cartItems]
  );

  const removeItemFromCart = useCallback(
    async (productId: string): Promise<void> => {
      // 1. Snapshot the current state for rollback
      const previousCartItems = [...cartItems];
      const existingItem = previousCartItems.find(item => item.product_id === productId);

      if (!existingItem) {
        toast.error('Item not found in cart to remove.');
        return;
      }

      // 2. Optimistic Update
      setCartItems(currentItems =>
        currentItems.filter(item => item.product_id !== productId)
      );
      toast.success(`${existingItem.name} removed from cart.`); // Show success message immediately

      try {
        // 3. Call the backend API
        await removeFromCart(MOCK_USER_ID, productId);

        // 4. After successful API call, re-fetch to ensure consistency
        await fetchCart();
      } catch (error: any) {
        toast.error(`Failed to remove ${existingItem.name} from cart: ${error.message}`);
        // 5. Rollback on failure
        setCartItems(previousCartItems);
        await fetchCart(); // Re-fetch to get the true state if optimistic failed
      }
    },
    [fetchCart, cartItems]
  );

  const contextValue: CartContextType = {
    cartItems,
    cartItemCount,
    cartTotal,
    loadingCart,
    errorCart,
    fetchCart,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};