const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://127.0.0.1:8000";

// --- GENERAL & HOMEPAGE TYPES AND FUNCTIONS ---

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
  const response = await fetch(`${FASTAPI_URL}/categories`);
  if (!response.ok) throw new Error("Failed to fetch categories");
  return response.json();
}

export async function getContentBlocks(): Promise<ContentBlock[]> {
  const response = await fetch(`${FASTAPI_URL}/content-blocks`);
  if (!response.ok) throw new Error("Failed to fetch content blocks");
  return response.json();
}

export async function getHomepageSection(slug: string): Promise<HomepageSection> {
  const response = await fetch(`${FASTAPI_URL}/homepage/sections/${slug}`);
  if (!response.ok) throw new Error(`Failed to fetch homepage section: ${slug}`);
  return response.json();
}

// --- PRODUCT TYPES AND FUNCTIONS ---

export interface ProductImage {
  url: string;
  description: string;
}

export interface Product {
  _id: string;
  id: string;
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
  const response = await fetch(`${FASTAPI_URL}/products`);
  if (!response.ok) throw new Error("Failed to fetch products");
  return response.json();
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const response = await fetch(`${FASTAPI_URL}/products/${slug}`);
  if (!response.ok) throw new Error("Failed to fetch product");
  return response.json();
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const response = await fetch(`${FASTAPI_URL}/products/featured`);
  if (!response.ok) throw new Error("Failed to fetch featured products");
  return response.json();
}

// --- CART TYPES AND FUNCTIONS ---

export interface CartItem {
  product_id: string;
  quantity: number;
  name: string;
  price: number;
  imageUrl?: string;
  slug?: string;
  sku?: string;
}

export interface Cart {
  cart: CartItem[];
  total_price: number;
}

export interface AddToCartPayload {
  user_id: string;
  product_id: string;
  quantity: number;
  name: string;
  price: number;
  imageUrl?: string;
  slug?: string;
  sku?: string;
}

export async function getCart(userId: string): Promise<Cart> {
  try {
    const response = await fetch(`${FASTAPI_URL}/cart/${userId}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch cart' }));
      throw new Error(errorData.detail || `HTTP error: ${response.status}`);
    }
    const data = await response.json();
    return { cart: data.cart || [], total_price: data.cart?.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0) || 0 };
  } catch (error: any) {
    console.error('getCart error:', error.message, error.stack);
    throw new Error(`Failed to fetch cart: ${error.message}`);
  }
}

export async function addToCart(payload: AddToCartPayload): Promise<CartItem> {
  try {
    const response = await fetch(`${FASTAPI_URL}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to add to cart' }));
      throw new Error(errorData.detail || `HTTP error: ${response.status}`);
    }
    return response.json();
  } catch (error: any) {
    console.error('addToCart error:', error.message, error.stack);
    throw new Error(`Failed to add to cart: ${error.message}`);
  }
}

export async function removeFromCart(userId: string, productId: string): Promise<any> {
  try {
    const response = await fetch(`${FASTAPI_URL}/cart/${userId}/${productId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to remove from cart' }));
      throw new Error(errorData.detail || `HTTP error: ${response.status}`);
    }
    return response.json();
  } catch (error: any) {
    console.error('removeFromCart error:', error.message, error.stack);
    throw new Error(`Failed to remove from cart: ${error.message}`);
  }
}

export async function updateCartItemQuantity(userId: string, productId: string, quantity: number): Promise<any> {
  try {
    const response = await fetch(`${FASTAPI_URL}/cart/${userId}/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to update item quantity' }));
      throw new Error(errorData.detail || `HTTP error: ${response.status}`);
    }
    return response.json();
  } catch (error: any) {
    console.error('updateCartItemQuantity error:', error.message, error.stack);
    throw new Error(`Failed to update item quantity: ${error.message}`);
  }
}

// --- CHECKOUT AND ORDER FUNCTIONS ---

export interface CheckoutPayload {
  user_id?: string | null | undefined;
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

export async function checkout(payload: CheckoutPayload): Promise<{ order_id: string }> {
  try {
    const response = await fetch(`${FASTAPI_URL}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'An unknown error occurred.' }));
      throw new Error(errorData.detail || `HTTP error: ${response.status}`);
    }
    return response.json();
  } catch (error: any) {
    console.error('checkout error:', error.message, error.stack);
    throw new Error(`Failed to process checkout: ${error.message}`);
  }
}

export async function getOrders(userId: string): Promise<Order[]> {
  try {
    const response = await fetch(`${FASTAPI_URL}/orders/${userId}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch orders' }));
      throw new Error(errorData.detail || `HTTP error: ${response.status}`);
    }
    const data = await response.json();
    return data.orders || [];
  } catch (error: any) {
    console.error('getOrders error:', error.message, error.stack);
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }
}
