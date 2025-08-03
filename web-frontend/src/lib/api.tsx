// src/lib/api.tsx

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://127.0.0.1:8000";

// -------- GENERAL & HOMEPAGE TYPES AND FUNCTIONS --------

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
  layout_style: 'hero' | 'featured_products' | 'content_grid';
  content: ContentBlock[];
  products?: Product[];
  imageUrl?: string;
  alt?: string;
  description?: any;
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${FASTAPI_URL}/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function getContentBlocks(): Promise<ContentBlock[]> {
  const res = await fetch(`${FASTAPI_URL}/content-blocks`);
  if (!res.ok) throw new Error("Failed to fetch content blocks");
  return res.json();
}

export async function getHomepageSection(slug: string): Promise<HomepageSection> {
  const res = await fetch(`${FASTAPI_URL}/homepage/sections/${slug}`);
  if (!res.ok) throw new Error(`Failed to fetch homepage section: ${slug}`);
  return res.json();
}

// -------- PRODUCT TYPES AND FUNCTIONS --------

export interface ProductImage {
  url: string;
  description: string;
}

export interface Product {
  _id: string; // Sanity ID, used in frontend
  id: string;  // Supabase ID, used in backend
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

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${FASTAPI_URL}/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const res = await fetch(`${FASTAPI_URL}/products/${slug}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const res = await fetch(`${FASTAPI_URL}/products/featured`);
  if (!res.ok) throw new Error("Failed to fetch featured products");
  return res.json();
}

// -------- CART TYPES AND FUNCTIONS --------

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

export async function getCart(userId: string): Promise<Cart> {
  try {
    const res = await fetch(`${FASTAPI_URL}/cart/${userId}`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: 'Failed to fetch cart' }));
      throw new Error(errData.detail || `HTTP error: ${res.status}`);
    }
    const data = await res.json();
    const cart = data.cart || [];
    const total_price = cart.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
    return { cart, total_price };
  } catch (err: any) {
    console.error('getCart error:', err.message, err.stack);
    throw new Error(`Failed to fetch cart: ${err.message}`);
  }
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

export async function removeFromCart(userId: string, productId: string, token?: string): Promise<any> {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${FASTAPI_URL}/cart/${userId}/${productId}`, {
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

export async function updateCartItemQuantity(
  userId: string,
  productId: string,
  quantity: number,
  token?: string
): Promise<any> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${FASTAPI_URL}/cart/${userId}/${productId}`, {
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

export interface CheckoutPayload {
  user_id?: string | null;
  email?: string;
  shipping_address: string;
  cart_items?: CartItem[];
}

export interface Order {
  id: string;
  user_id: string;
  shipping_address: {
    full_name: string;
    address_line1: string;
    city: string;
    state_province: string;
    postal_code: string;
    country: string;
  };
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  items: CartItem[];
}

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

export async function getOrders(userId: string, token?: string): Promise<Order[]> {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${FASTAPI_URL}/orders/${userId}`, { headers });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: 'Failed to fetch orders' }));
      throw new Error(errData.detail || `HTTP error: ${res.status}`);
    }

    const data = await res.json();
    return data.orders || [];
  } catch (err: any) {
    console.error('getOrders error:', err.message, err.stack);
    throw new Error(`Failed to fetch orders: ${err.message}`);
  }
}

// -------- FINAL FIX: fetchCartItems --------
export async function fetchCartItems(userId: string, token?: string): Promise<CartItem[]> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${FASTAPI_URL}/cart/${userId}`, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to fetch cart items:', errorText);
    throw new Error(`Failed to fetch cart items: ${res.status}`);
  }

  const data = await res.json();

  if (!data.cart) {
    console.error('Cart data missing in response:', data);
    throw new Error('Cart items missing from response');
  }

  return data.cart as CartItem[];
}
