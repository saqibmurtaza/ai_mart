
// src/lib/api.ts

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

if (!FASTAPI_URL) {
  throw new Error('Missing NEXT_PUBLIC_FASTAPI_URL environment variable. Please set it in .env.local');
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  imageUrl?: string;
}

export interface CartItem {
  user_id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface HomepageSectionContent {
  title: string;
  description: any;
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

// <<<<< ADD THIS NEW INTERFACE >>>>>
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

export async function getProducts(category?: string): Promise<Product[]> {
  console.log('Fetching products from FastAPI...');
  try {
    const url = category ? `${FASTAPI_URL}/products?category=${category}` : `${FASTAPI_URL}/products`;
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

export async function getProduct(id: string): Promise<Product | undefined> {
  console.log(`Fetching product ${id} from FastAPI...`);
  try {
    const response = await fetch(`${FASTAPI_URL}/products/${id}`);
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
    console.error(`Error fetching product ${id}:`, error);
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

// <<<<< ADD THIS NEW FUNCTION >>>>>
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

// ... Add other API functions like for cart, checkout, orders here ...
