'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getCart, addToCart, removeFromCart, updateCartItemQuantity, Product, CartItem } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { createClient } from '@/utils/supabase/client';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    picture?: string;
    [key: string]: any;
  };
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [errorCart, setErrorCart] = useState<string | null>(null);
  const supabase = createClient();

  const cartItemCount = cartItems.reduce((count: number, item: CartItem) => count + item.quantity, 0);
  const cartTotal = cartItems.reduce((total: number, item: CartItem) => total + item.price * item.quantity, 0);

  useEffect(() => {
    const fetchUserAndCart = async () => {
      // Safely parse guest cart from localStorage
      let guestCart: CartItem[] = [];
      const storedCart = localStorage.getItem('guestCart');
      if (storedCart) {
        try {
          const parsed = JSON.parse(storedCart);
          if (Array.isArray(parsed)) {
            guestCart = parsed;
            setCartItems(guestCart);
          } else {
            console.warn('Invalid guest cart format in localStorage');
            localStorage.removeItem('guestCart');
          }
        } catch (e) {
          console.error('Failed to parse guest cart:', e);
          localStorage.removeItem('guestCart');
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsUserLoading(false);

      if (user) {
        try {
          const response = await getCart(user.id);
          const userCart: CartItem[] = response.cart || [];
          const mergedCart = mergeCarts(guestCart, userCart);
          setCartItems(mergedCart);

          // Sync merged cart to backend
          for (const item of mergedCart) {
            await addToCart({
              user_id: user.id,
              product_id: item.product_id, // Already _id
              quantity: item.quantity,
              name: item.name,
              price: item.price,
              imageUrl: item.imageUrl,
              slug: item.slug,
              sku: item.sku,
            });
          }
          localStorage.removeItem('guestCart');
        } catch (err: any) {
          console.error('Failed to sync cart:', err.message, err.stack);
          setErrorCart('Unable to sync cart. Please try again.');
        }
      }
      setLoadingCart(false);
    };

    fetchUserAndCart().catch((err) => {
      console.error('Unexpected error in fetchUserAndCart:', err);
      setErrorCart('Failed to load cart.');
      setLoadingCart(false);
    });
  }, []);

  const mergeCarts = (guestCart: CartItem[], userCart: CartItem[]): CartItem[] => {
    const merged = [...userCart];
    guestCart.forEach((guestItem: CartItem) => {
      const existing = merged.find((item: CartItem) => item.product_id === guestItem.product_id);
      if (existing) {
        existing.quantity += guestItem.quantity;
      } else {
        merged.push(guestItem);
      }
    });
    return merged;
  };

  const fetchCart = useCallback(async () => {
    if (!user?.id) {
      const storedCart = localStorage.getItem('guestCart');
      let guestCart: CartItem[] = [];
      if (storedCart) {
        try {
          const parsed = JSON.parse(storedCart);
          if (Array.isArray(parsed)) {
            guestCart = parsed;
          } else {
            console.warn('Invalid guest cart format in localStorage');
            localStorage.removeItem('guestCart');
          }
        } catch (e) {
          console.error('Failed to parse guest cart:', e);
          localStorage.removeItem('guestCart');
        }
      }
      setCartItems(guestCart);
      setLoadingCart(false);
      return;
    }

    setLoadingCart(true);
    setErrorCart(null);
    try {
      const response = await getCart(user.id);
      setCartItems(response.cart || []);
    } catch (err: any) {
      console.error('Failed to fetch cart:', err.message, err.stack);
      setErrorCart('Unable to load cart. Please try again.');
      setCartItems([]);
    } finally {
      setLoadingCart(false);
    }
  }, [user]);

  const addItemToCart = async (product: Product, quantity: number = 1) => {
    const cartItem: CartItem = {
      product_id: product.id, // Use Sanity _id
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: product.imageUrl,
      slug: product.slug,
      sku: product.sku,
    };

    const previousCartItems = [...cartItems];
    // Optimistic update
    setCartItems((currentItems: CartItem[]) => {
      const existingItem = currentItems.find((item: CartItem) => item.product_id === product.id);
      if (existingItem) {
        return currentItems.map((item: CartItem) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...currentItems, cartItem];
    });

    if (user?.id) {
      try {
        await addToCart({
          user_id: user.id,
          product_id: product.id, // Use Sanity _id
          quantity,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          slug: product.slug,
          sku: product.sku,
        });
        await fetchCart(); // Refresh cart from backend
        toast.success(`${product.name} added to cart!`);
      } catch (error: any) {
        console.error('Error adding to cart:', error.message, error.stack);
        setCartItems(previousCartItems); // Revert on failure
        toast.error(`Failed to add ${product.name} to cart: ${error.message}`);
        return;
      }
    } else {
      const updatedCart = [...cartItems, cartItem];
      try {
        localStorage.setItem('guestCart', JSON.stringify(updatedCart));
        setCartItems(updatedCart);
        toast.success(`${product.name} added to cart!`);
      } catch (e) {
        console.error('Failed to save guest cart:', e);
        setCartItems(previousCartItems);
        toast.error(`Failed to add ${product.name} to cart.`);
      }
    }
  };

  const updateItemQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItemFromCart(productId);
      return;
    }

    const previousCartItems = [...cartItems];
    setCartItems((items: CartItem[]) =>
      items.map((item: CartItem) =>
        item.product_id === productId ? { ...item, quantity: newQuantity } : item
      )
    );

    if (user?.id) {
      try {
        await updateCartItemQuantity(user.id, productId, newQuantity);
      } catch (error: any) {
        console.error('Error updating quantity:', error.message, error.stack);
        toast.error(`Failed to update quantity: ${error.message}`);
        setCartItems(previousCartItems);
      }
    } else {
      try {
        localStorage.setItem('guestCart', JSON.stringify(cartItems));
      } catch (e) {
        console.error('Failed to save guest cart:', e);
        toast.error(`Failed to update quantity.`);
        setCartItems(previousCartItems);
      }
    }
  };

  const removeItemFromCart = async (productId: string) => {
    const previousCartItems = [...cartItems];
    setCartItems((items: CartItem[]) => items.filter((item: CartItem) => item.product_id !== productId));

    if (user?.id) {
      try {
        await removeFromCart(user.id, productId);
      } catch (error: any) {
        console.error('Error removing item:', error.message, error.stack);
        toast.error(`Failed to remove item: ${error.message}`);
        setCartItems(previousCartItems);
      }
    } else {
      try {
        localStorage.setItem('guestCart', JSON.stringify(cartItems.filter((item: CartItem) => item.product_id !== productId)));
      } catch (e) {
        console.error('Failed to save guest cart:', e);
        toast.error(`Failed to remove item.`);
        setCartItems(previousCartItems);
      }
    }
  };

  const clearCart = async () => {
    const previousCartItems = [...cartItems];
    setCartItems([]);
    if (user?.id) {
      try {
        await supabase
          .from('cartitem')
          .delete()
          .eq('user_id', user.id);
      } catch (error: any) {
        console.error('Error clearing cart:', error.message, error.stack);
        toast.error('Failed to clear cart.');
        setCartItems(previousCartItems);
      }
    } else {
      try {
        localStorage.removeItem('guestCart');
      } catch (e) {
        console.error('Failed to clear guest cart:', e);
        toast.error('Failed to clear cart.');
        setCartItems(previousCartItems);
      }
    }
  };

  return (
    <CartContext.Provider
      value={{
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider.');
  }
  return context;
}
