const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

if (!FASTAPI_URL) {
  throw new Error('Missing NEXT_PUBLIC_FASTAPI_URL environment variable. Please set it in .env.local');
}

export interface Product {
  id: string;
  name: string;
  description?: any; // <<<<< CHANGED TO 'any' for PortableText compatibility >>>>>
  price: number;
  stock: number;
  category?: string;
  imageUrl?: string;
  alt?: string; // <<<<< ADDED 'alt' property >>>>>
  slug?: string; // Ensure slug is also here, as it's used for linking
  isFeatured?: boolean; // Ensure this is also here for consistency
  sku?: string; // Ensure this is also here for consistency
}

export interface CartItem {
  user_id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string; // NEW: Added for cart display
  slug?: string;     // NEW: Added for cart display
  sku?: string;      // NEW: Added for cart display
}

export interface HomepageSectionContent {
  title: string;
  description: any; // Portable Text
  imageUrl?: string;
  alt?: string;
}

export interface ContentBlockData {
  _id: string;
  title: string;
  subtitle?: string;
  description: any; // Portable Text
  imageUrl?: string;
  alt?: string;
  imageLeft: boolean; // For alternating layout
  callToActionText?: string;
  callToActionUrl?: string;
  order: number;
}

export interface CategoryData {
  _id: string; // Add _id for consistency with Sanity documents
  title: string;
  slug: string;
  description?: any; // Portable Text (optional)
  imageUrl?: string;
  alt?: string;
  order: number;
}


// --- API Functions ---

export async function getProducts(
  category?: string,
  sortOrder: string = 'newest',
  minPrice?: number,
  maxPrice?: number
): Promise<Product[]> {
  console.log(`Fetching products from FastAPI with category: '${category}', sort: '${sortOrder}', minPrice: '${minPrice}', maxPrice: '${maxPrice}'`);
  try {
    const params = new URLSearchParams();
    if (category) {
      params.append('category', category);
    }
    params.append('sort', sortOrder);

    if (minPrice !== undefined) {
      params.append('minPrice', minPrice.toString());
    }
    if (maxPrice !== undefined) {
      params.append('maxPrice', maxPrice.toString());
    }

    const url = `${FASTAPI_URL}/products?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    const data: Product[] = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching products:', error);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  console.log(`Fetching product ${slug} from FastAPI...`);
  try {
    const response = await fetch(`${FASTAPI_URL}/products/${slug}`);
    if (response.status === 404) {
      return undefined;
    }
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    const data: Product = await response.json();
    return data;
  } catch (error: any) {
    console.error(`Error fetching product ${slug}:`, error);
    throw new Error(`Failed to fetch product: ${error.message}`);
  }
}

export async function getHomepageSection(slug: string): Promise<HomepageSectionContent | undefined> {
  console.log(`Fetching homepage section '${slug}' from FastAPI...`);
  try {
    const response = await fetch(`${FASTAPI_URL}/homepage-sections/${slug}`); 
    
    if (response.status === 404) {
      return undefined;
    }
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    const data: HomepageSectionContent = await response.json();
    return data;
  } catch (error: any) {
    console.error(`Error fetching homepage section ${slug}:`, error);
    throw new Error(`Failed to fetch homepage section: ${error.message}`);
  }
}

export async function getContentBlocks(): Promise<ContentBlockData[]> {
  console.log('Fetching content blocks from FastAPI...');
  try {
    const response = await fetch(`${FASTAPI_URL}/content-blocks`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    const data: ContentBlockData[] = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching content blocks:', error);
    throw new Error(`Failed to fetch content blocks: ${error.message}`);
  }
}

export async function getCategories(): Promise<CategoryData[]> {
  console.log('Fetching categories from FastAPI...');
  try {
    const response = await fetch(`${FASTAPI_URL}/categories`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    const data: CategoryData[] = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  console.log('Fetching featured products from FastAPI...');
  try {
    const response = await fetch(`${FASTAPI_URL}/products/featured`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    const data: Product[] = await response.json();
    console.log("Frontend: Fetched featured products data:", data);
    return data;
  } catch (error: any) {
    console.error('Error fetching featured products:', error);
    throw new Error(`Failed to fetch featured products: ${error.message}`);
  }
}

// --- CART API Functions ---
export async function getCart(userId: string): Promise<{ message: string; cart: CartItem[] }> {
  console.log(`Fetching cart for user: ${userId}`);
  try {
    const response = await fetch(`${FASTAPI_URL}/cart/${userId}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(`Error fetching cart for user ${userId}:`, error);
    throw new Error(`Failed to fetch cart: ${error.message}`);
  }
}

export async function addToCart(item: CartItem): Promise<CartItem> {
  console.log('Adding/updating item in cart:', item);
  try {
    const response = await fetch(`${FASTAPI_URL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    const data: CartItem = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error adding to cart:', error);
    throw new Error(`Failed to add item to cart: ${error.message}`);
  }
}

export async function removeFromCart(userId: string, productId: string): Promise<{ message: string }> {
  console.log(`Removing item ${productId} from cart for user ${userId}`);
  try {
    const response = await fetch(`${FASTAPI_URL}/cart/${userId}/${productId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(`Error removing item ${productId} from cart:`, error);
    throw new Error(`Failed to remove item from cart: ${error.message}`);
  }
}

// ... Add other API functions like for checkout, orders here ...
