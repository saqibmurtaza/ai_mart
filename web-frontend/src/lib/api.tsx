import { createClient } from "next-sanity";

// --- Environment Variables & Constants ---
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

if (!projectId || !dataset) {
  throw new Error(
    "Missing Sanity environment variables. Check NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET."
  );
}

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: "2023-05-03",
  useCdn: process.env.NODE_ENV === "production", // Set false for real-time content
});

const FASTAPI_URL =
  process.env.NEXT_PUBLIC_FASTAPI_URL || "http://127.0.0.1:8000";

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

export interface HomepageSection {
  id: string;
  title: string;
  layout_style: "hero" | "featured_products" | "content_grid";
  content: ContentBlock[];
  products?: Product[];
  imageUrl?: string;
  alt?: string;
  description?: any;
}

export interface ProductImage {
  url: string;
  description: string;
}

export interface Product {
  _id: string; // Sanity ID
  id: string; // Supabase ID
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
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

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  sku?: string;
  slug?: string;
  alt?: string;
}

export interface Order {
  id: string;
  user_id: string;
  shipping_address: string;
  total_amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  created_at: string;
  items: OrderItem[];
}

// ----------- API HELPER -----------
async function safeFetch<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({
        detail: `Request failed (${res.status})`,
      }));
      throw new Error(errData.detail || `HTTP error: ${res.status}`);
    }
    return (await res.json()) as T;
  } catch (err: any) {
    console.error("API fetch error:", err.message);
    throw new Error(err.message || "Unknown error");
  }
}

// ----------- API FUNCTIONS -----------

// ----- General Navigation -----
export const getCategories = () =>
  safeFetch<Category[]>(`${FASTAPI_URL}/categories`);

export const getContentBlocks = () =>
  safeFetch<ContentBlock[]>(`${FASTAPI_URL}/content-blocks`);

export const getHomepageSection = (slug: string) =>
  safeFetch<HomepageSection>(`${FASTAPI_URL}/homepage/sections/${slug}`);

// ----- Product Helpers -----
export const getProducts = () =>
  safeFetch<Product[]>(`${FASTAPI_URL}/products`);

export const getProductBySlug = (slug: string) =>
  safeFetch<Product>(`${FASTAPI_URL}/products/${slug}`);

export const getFeaturedProducts = () =>
  safeFetch<Product[]>(`${FASTAPI_URL}/products/featured`);

// ----- Cart Functions -----

// Explicitly removed to avoid confusion
export function getCart(): never {
  throw new Error(
    "getCart(userId) is removed; use fetchCartItems(token) instead."
  );
}

export const fetchCartItems = (token?: string) =>
  safeFetch<{ cart: CartItem[] }>(`${FASTAPI_URL}/cart`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).then((data) => data.cart);

export const addToCart = (payload: AddToCartPayload, token?: string) =>
  safeFetch<CartItem>(`${FASTAPI_URL}/cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

export const removeFromCart = (productId: string, token?: string) =>
  safeFetch<any>(`${FASTAPI_URL}/cart/${productId}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

export const updateCartItemQuantity = (
  productId: string,
  quantity: number,
  token?: string
) =>
  safeFetch<any>(`${FASTAPI_URL}/cart/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ quantity }),
  });


  // -------- CHECKOUT AND ORDER FUNCTIONS --------

export const checkout = (payload: CheckoutPayload, token?: string) =>
  safeFetch<{ order_id: string }>(`${FASTAPI_URL}/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

// ✅ FIXED: Only requires token, not userId
export const getOrders = (token?: string) =>
  safeFetch<Order[]>(`${FASTAPI_URL}/orders`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
