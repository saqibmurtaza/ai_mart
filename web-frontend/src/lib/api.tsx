import { NextResponse } from 'next/server';

// --- Environment Variables & Constants ---
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

if (!projectId || !dataset) {
  throw new Error("Missing Sanity environment variables. Check NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET.");
}

const FASTAPI_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

// ----------- TYPES -----------

export interface Category {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export interface ContentBlock {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  subtitle?: string;
  description?: any;
  alt?: string;
  imageLeft?: boolean;
  callToActionText?: string;
  callToActionUrl?: string;
  order?: number;
}


export interface ProductImage {
  url: string;
  description: string;
}

export interface CategoryType {
  slug: string;
  title: string;
}

export interface Product {
  _id: string; // Sanity ID (frontend)
  id: string;  // Supabase ID (backend)
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string | CategoryType; // 👈 Allow both string or object
  images?: ProductImage[];
  stock: number;
  imageUrl?: string;
  sku?: string;
  alt?: string;
}

export interface CartItem {
  user_id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  slug?: string;
  sku?: string;
  alt?: string;
}

export interface Cart {
  cart: CartItem[];
  total_price: number;
}

export interface AddToCartPayload {
  user_id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  slug?: string;
  sku?: string;
  alt?: string;
}

export interface CheckoutPayload {
  user_id?: string | null;
  email?: string;
  shipping_address: string;
  cart_items?: CartItem[];
}

export interface Order {
  id: string;
  user_id: string;
  shipping_address: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  items: CartItem[];
}

// ----------- API FUNCTIONS -----------

// ----- General Navigation -----
export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${FASTAPI_URL}/categories`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function getContentBlocks(): Promise<ContentBlock[]> {
  const res = await fetch(`${FASTAPI_URL}/content-blocks`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch content blocks");
  return res.json();
}

export async function getProducts(
  category?: string,
  sort?: string,
  minPrice?: number,
  maxPrice?: number
): Promise<Product[]> {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (sort) params.set('sort', sort);
  if (minPrice !== undefined && !isNaN(minPrice)) params.set('minPrice', minPrice.toString());
  if (maxPrice !== undefined && !isNaN(maxPrice)) params.set('maxPrice', maxPrice.toString());

  const url = `${FASTAPI_URL}/products?${params.toString()}`;
  
  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Failed to fetch products from backend:", errorText);
    throw new Error("Failed to fetch products");
  }

  return res.json();
}


export async function getProductBySlug(slug: string): Promise<Product> {
  const res = await fetch(`${FASTAPI_URL}/products/${slug}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const res = await fetch(`${FASTAPI_URL}/products/featured`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch featured products");
  return res.json();
}

// ----- Cart Functions -----

// For guests: use localStorage instead
export async function getCart(): Promise<Cart> {
  throw new Error("getCart(userId) is removed; use fetchCartItems(token) for auth cart fetch.");
}

// Fetch the authenticated user's cart with JWT
export async function fetchCartItems(token?: string): Promise<CartItem[]> {
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${FASTAPI_URL}/cart`, { method: 'GET', headers });
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to fetch cart items:', errorText);
    throw new Error(`Failed to fetch cart items: ${res.status}`);
  }
  const data = await res.json();
  if (!data.cart) throw new Error('Cart items missing from response');
  return data.cart as CartItem[];
}

export async function addToCart(payload: AddToCartPayload, token?: string): Promise<CartItem> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${FASTAPI_URL}/cart`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: 'Failed to add to cart' }));
      throw new Error(errData.detail || `HTTP error: ${res.status}`);
    }
    return res.json();
  } catch (err: any) {
    console.error('addToCart error:', err.message, err.stack);
    throw new Error(`Failed to add to cart: ${err.message}`);
  }
}

export async function removeFromCart(productId: string, token?: string): Promise<any> {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${FASTAPI_URL}/cart/${productId}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: 'Failed to remove from cart' }));
      throw new Error(errData.detail || `HTTP error: ${res.status}`);
    }
    return res.json();
  } catch (err: any) {
    console.error('removeFromCart error:', err.message, err.stack);
    throw new Error(`Failed to remove from cart: ${err.message}`);
  }
}

export async function updateCartItemQuantity(productId: string, quantity: number, token?: string): Promise<any> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${FASTAPI_URL}/cart/${productId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ quantity }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: 'Failed to update item quantity' }));
      throw new Error(errData.detail || `HTTP error: ${res.status}`);
    }
    return res.json();
  } catch (err: any) {
    console.error('updateCartItemQuantity error:', err.message, err.stack);
    throw new Error(`Failed to update item quantity: ${err.message}`);
  }
}

// -------- CHECKOUT AND ORDER FUNCTIONS --------

export async function checkout(payload: CheckoutPayload, token?: string): Promise<{ order_id: string }> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${FASTAPI_URL}/checkout`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: 'Checkout failed' }));
      throw new Error(errData.detail || `HTTP error: ${res.status}`);
    }
    return res.json();
  } catch (err: any) {
    console.error('checkout error:', err.message, err.stack);
    throw new Error(`Failed to process checkout: ${err.message}`);
  }
}

export async function getOrders(token?: string): Promise<Order[]> {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${FASTAPI_URL}/orders`, { headers });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: 'Failed to fetch orders' }));
      throw new Error(errData.detail || `HTTP error: ${res.status}`);
    }

    // ✅ Backend returns an array directly, not { orders: [...] }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err: any) {
    console.error('getOrders error:', err.message, err.stack);
    throw new Error(`Failed to fetch orders: ${err.message}`);
  }
}


