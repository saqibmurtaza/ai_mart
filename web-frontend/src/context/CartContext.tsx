'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getCart, addToCart, removeFromCart, Product } from '@/lib/api';
import { toast } from 'react-hot-toast';

// Placeholder for user ID. In a real app, this would come from authentication.
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
  const [loadingCart, setLoadingCart] = useState(true);
  const [errorCart, setErrorCart] = useState<string | null>(null);

  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const fetchCart = useCallback(async () => {
    console.log("DEBUG (CartContext): Initiating cart fetch...");
    setLoadingCart(true);
    setErrorCart(null);
    try {
      const response = await getCart(MOCK_USER_ID);
      console.log("DEBUG (CartContext): getCart API response received:", response);
      
      // Ensure response.cart is an array before setting state
      if (response && Array.isArray(response.cart)) {
        setCartItems(response.cart);
        console.log("DEBUG (CartContext): Cart items successfully set:", response.cart);
      } else {
        console.warn("DEBUG (CartContext): getCart API response did not contain an array for 'cart'. Setting empty array.");
        setCartItems([]); // Fallback to empty array if response.cart is not an array
      }
    } catch (err: any) {
      console.error('DEBUG (CartContext): Error during cart fetch:', err);
      setErrorCart(err.message || 'Failed to load cart.');
      setCartItems([]); // Ensure cart is empty on error
    } finally {
      setLoadingCart(false);
      console.log("DEBUG (CartContext): Cart fetch completed. Loading state set to false.");
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItemToCart = useCallback(async (product: Product, quantity: number = 1) => {
    console.log(`DEBUG (CartContext): Attempting to add ${quantity} of ${product.name} (ID: ${product.slug || product.id}) to cart.`);
    try {
      const productIdToUse = product.slug || product.id;
      if (!productIdToUse) {
        console.error("DEBUG (CartContext): Product has no valid slug or ID for cart operation.", product);
        toast.error(`Cannot add ${product.name} to cart: Missing ID.`);
        return;
      }

      const existingItem = cartItems.find(item => item.product_id === productIdToUse);
      const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;

      // Optimistic update
      setCartItems(prevItems => {
        console.log("DEBUG (CartContext): Optimistic update - prevItems:", prevItems);
        let updatedItems;
        if (existingItem) {
          updatedItems = prevItems.map(item =>
            item.product_id === productIdToUse
              ? { ...item, quantity: newQuantity }
              : item
          );
        } else {
          updatedItems = [
            ...prevItems,
            {
              user_id: MOCK_USER_ID,
              product_id: productIdToUse,
              name: product.name,
              price: product.price,
              quantity: quantity,
              imageUrl: product.imageUrl,
              slug: product.slug,
              sku: product.sku
            }
          ];
        }
        console.log("DEBUG (CartContext): Optimistic update - newItems:", updatedItems);
        return updatedItems;
      });
      toast.success(`${product.name} added to cart!`);

      const apiResponse = await addToCart({
        user_id: MOCK_USER_ID,
        product_id: productIdToUse,
        name: product.name,
        price: product.price,
        quantity: newQuantity,
        imageUrl: product.imageUrl,
        slug: product.slug,
        sku: product.sku
      });
      console.log("DEBUG (CartContext): addToCart API response:", apiResponse);
      // Re-fetch to ensure consistency after API call
      await fetchCart();
      console.log("DEBUG (CartContext): Cart re-fetched after addItemToCart.");
    } catch (error: any) {
      console.error('DEBUG (CartContext): Error adding to cart:', error);
      toast.error(`Failed to add ${product.name} to cart: ${error.message}`);
      await fetchCart(); // Revert optimistic update by re-fetching
      console.log("DEBUG (CartContext): Cart re-fetched to revert after addItemToCart error.");
    }
  }, [cartItems, fetchCart]); // Keep cartItems in dependency array for accurate existingItem check

  const updateItemQuantity = useCallback(async (productId: string, newQuantity: number) => {
    console.log(`DEBUG (CartContext): Attempting to update quantity for ${productId} to ${newQuantity}.`);
    if (newQuantity <= 0) {
      await removeItemFromCart(productId);
      return;
    }

    const existingItem = cartItems.find(item => item.product_id === productId);
    if (!existingItem) {
      toast.error("Item not found in cart to update quantity.");
      console.log(`DEBUG (CartContext): Item ${productId} not found for quantity update.`);
      return;
    }

    // Optimistic update
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item =>
        item.product_id === productId ? { ...item, quantity: newQuantity } : item
      );
      console.log("DEBUG (CartContext): Optimistic update quantity - newItems:", updatedItems);
      return updatedItems;
    });
    toast.success(`Quantity updated for ${existingItem.name}.`);

    try {
      const apiResponse = await addToCart({ // addToCart handles updates
        user_id: MOCK_USER_ID,
        product_id: productId,
        name: existingItem.name,
        price: existingItem.price,
        quantity: newQuantity,
        imageUrl: existingItem.imageUrl,
        slug: existingItem.slug,
        sku: existingItem.sku
      });
      console.log("DEBUG (CartContext): updateItemQuantity API response:", apiResponse);
      await fetchCart(); // Re-fetch to ensure consistency
      console.log("DEBUG (CartContext): Cart re-fetched after updateItemQuantity.");
    } catch (error: any) {
      console.error('DEBUG (CartContext): Error updating cart item quantity:', error);
      toast.error(`Failed to update quantity for ${existingItem.name}: ${error.message}`);
      await fetchCart(); // Revert optimistic update
      console.log("DEBUG (CartContext): Cart re-fetched to revert after updateItemQuantity error.");
    }
  }, [cartItems, fetchCart]);

  const removeItemFromCart = useCallback(async (productId: string) => {
    console.log(`DEBUG (CartContext): Attempting to remove item ${productId} from cart.`);
    const existingItem = cartItems.find(item => item.product_id === productId);
    if (!existingItem) {
      toast.error("Item not found in cart to remove.");
      console.log(`DEBUG (CartContext): Item ${productId} not found for removal.`);
      return;
    }

    // Optimistic update
    setCartItems(prevItems => {
      const updatedItems = prevItems.filter(item => item.product_id !== productId);
      console.log("DEBUG (CartContext): Optimistic remove - newItems:", updatedItems);
      return updatedItems;
    });
    toast.success(`${existingItem.name} removed from cart.`);

    try {
      const apiResponse = await removeFromCart(MOCK_USER_ID, productId);
      console.log("DEBUG (CartContext): removeFromCart API response:", apiResponse);
      await fetchCart(); // Re-fetch to ensure consistency
      console.log("DEBUG (CartContext): Cart re-fetched after removeItemFromCart.");
    } catch (error: any) {
      console.error('DEBUG (CartContext): Error removing cart item:', error);
      toast.error(`Failed to remove ${existingItem.name} from cart: ${error.message}`);
      await fetchCart(); // Revert optimistic update
      console.log("DEBUG (CartContext): Cart re-fetched to revert after removeItemFromCart error.");
    }
  }, [cartItems, fetchCart]);

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
