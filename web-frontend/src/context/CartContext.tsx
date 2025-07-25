'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { getCart, addToCart, removeFromCart, updateCartItemQuantity, Product, AddToCartPayload } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { createClient } from '@/utils/supabase/client';

// Define the User type based on Supabase's user object
interface User {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    picture?: string;
    [key: string]: any;
  };
}

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  slug?: string;
  sku?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  cartItemCount: number;
  cartTotal: number;
  loadingCart: boolean;
  errorCart: string | null;
  fetchCart: () => void;
  addItemToCart: (product: Product, quantity?: number) => Promise<void>;
  updateItemQuantity: (productId: string, newQuantity: number) => Promise<void>;
  removeItemFromCart: (productId: string) => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [errorCart, setErrorCart] = useState<string | null>(null);

  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  useEffect(() => {
    const supabase = createClient();
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsUserLoading(false);
    };
    fetchUser();
  }, []);

  const fetchCart = useCallback(async () => {
    if (!user?.id) {
      setCartItems([]);
      setLoadingCart(false);
      return;
    }

    setLoadingCart(true);
    setErrorCart(null);
    try {
      const response = await getCart(user.id);
      setCartItems(response.cart || []);
    } catch (err: any) {
      setErrorCart(err.message || 'Failed to load cart.');
      setCartItems([]);
    } finally {
      setLoadingCart(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isUserLoading) {
      fetchCart();
    }
  }, [isUserLoading, fetchCart]);

  const addItemToCart = async (product: Product, quantity: number = 1) => {
    if (!user?.id) {
      toast.error('Please log in to add items to your cart.');
      return;
    }

    const optimisticItem: CartItem = {
      product_id: product.slug,
      name: product.name,
      price: product.price,
      quantity: 0,
      imageUrl: product.imageUrl,
      slug: product.slug,
    };

    const previousCartItems = [...cartItems];
    setCartItems(currentItems => {
      const existingItem = currentItems.find(item => item.product_id === product.slug);
      if (existingItem) {
        return currentItems.map(item =>
          item.product_id === product.slug
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...currentItems, { ...optimisticItem, quantity }];
    });

    toast.success(`${product.name} added to cart!`);

    try {
      const payload: AddToCartPayload = {
        user_id: user.id,
        product_id: product.slug,
        quantity,
        name: product.name,
        price: product.price,
      };
      await addToCart(payload);
      await fetchCart();
    } catch (error: any) {
      toast.error(`Failed to add item: ${error.message}`);
      setCartItems(previousCartItems);
    }
  };

  const updateItemQuantity = async (productId: string, newQuantity: number) => {
    if (!user?.id) return;
    if (newQuantity <= 0) {
      await removeItemFromCart(productId);
      return;
    }
    const previousCartItems = [...cartItems];
    setCartItems(items => items.map(item => item.product_id === productId ? { ...item, quantity: newQuantity } : item));
    try {
      await updateCartItemQuantity(user.id, productId, newQuantity);
    } catch (error: any) {
      toast.error(`Failed to update quantity: ${error.message}`);
      setCartItems(previousCartItems);
    }
  };

  const removeItemFromCart = async (productId: string) => {
    if (!user?.id) return;
    const previousCartItems = [...cartItems];
    setCartItems(items => items.filter(item => item.product_id !== productId));
    toast.success('Item removed from cart.');
    try {
      await removeFromCart(user.id, productId);
    } catch (error: any) {
      toast.error(`Failed to remove item: ${error.message}`);
      setCartItems(previousCartItems);
    }
  };

  const clearCart = () => {
    if (!user?.id) return;
    setCartItems([]);
    console.log('Cart cleared on the frontend.');
  };

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
    clearCart,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
