import os
import httpx
import textwrap
from typing import Optional

# Environment variables for Sanity project
SANITY_PROJECT_ID = os.getenv("SANITY_PROJECT_ID")
SANITY_DATASET = os.getenv("SANITY_DATASET")
SANITY_API_VERSION = os.getenv("SANITY_API_VERSION", "v2023-05-25")

if not SANITY_PROJECT_ID or not SANITY_DATASET:
    raise ValueError("SANITY_PROJECT_ID and SANITY_DATASET must be set in environment variables.")

# Async HTTP client for Sanity API
sanity_client = httpx.AsyncClient(
    base_url=f"https://{SANITY_PROJECT_ID}.api.sanity.io/{SANITY_API_VERSION}/data/query/{SANITY_DATASET}",
)

async def fetch_homepage_section(slug: str):
    query = textwrap.dedent(f"""
    *[_type == "homepageSection" && slug.current == "{slug}"][0]{{
        title,
        description,
        "imageUrl": image.asset->url,
        "alt": image.alt
    }}
    """)
    url_params = {"query": query}
    try:
        response = await sanity_client.get("/", params=url_params)
        if response.status_code == 200:
            return response.json().get("result", None)
        else:
            print(f"ERROR: Sanity API request failed (homepage): {response.text}")
            return None
    except Exception as e:
        print(f"Error fetching homepage section: {e}")
        return None

async def fetch_content_blocks():
    query = textwrap.dedent("""
    *[_type == "contentBlock"] | order(order asc){
        _id,
        title,
        subtitle,
        description,
        "imageUrl": image.asset->url,
        "alt": image.alt,
        imageLeft,
        callToActionText,
        callToActionUrl,
        order
    }
    """)
    url_params = {"query": query}
    try:
        response = await sanity_client.get("/", params=url_params)
        if response.status_code == 200:
            return response.json().get("result", [])
        else:
            print(f"ERROR: Sanity API request failed (content blocks): {response.text}")
            return []
    except Exception as e:
        print(f"Error fetching content blocks: {e}")
        return []

async def fetch_categories():
    query = textwrap.dedent("""
    *[_type == "category"] | order(order asc){
        _id,
        title,
        "slug": slug.current,
        description,
        "imageUrl": image.asset->url,
        "alt": image.alt,
        order
    }
    """)
    url_params = {"query": query}
    try:
        response = await sanity_client.get("/", params=url_params)
        if response.status_code == 200:
            return response.json().get("result", [])
        else:
            print(f"ERROR: Sanity API request failed (categories): {response.text}")
            return []
    except Exception as e:
        print(f"Error fetching categories: {e}")
        return None

async def fetch_featured_products():
    query = textwrap.dedent("""
    *[_type == "product" && isFeatured == true] | order(_createdAt desc){
        _id,
        name,
        "slug": slug.current,
        price,
        description,
        "categoryTitle": category->title,
        "imageUrl": mainImage.asset->url,
        "alt": mainImage.alt,
        stock,
        isFeatured,
        sku
    }
    """)
    url_params = {"query": query}
    try:
        response = await sanity_client.get("/", params=url_params)
        if response.status_code == 200:
            return response.json().get("result", [])
        else:
            print(f"ERROR: Sanity API request failed (featured products): {response.text}")
            return []
    except Exception as e:
        print(f"Error fetching featured products: {e}")
        return None

async def fetch_all_products(category_slug: Optional[str] = None, sort_order: str = "newest"): # NEW: sort_order parameter added here
    """
    Fetches all products, optionally filtered by category slug and sorted.
    """
    filter_clause = ""
    if category_slug:
        filter_clause = f" && category->slug.current == \"{category_slug}\""

    order_clause = ""
    if sort_order == "newest":
        order_clause = " | order(_createdAt desc)"
    elif sort_order == "price-asc":
        order_clause = " | order(price asc)"
    elif sort_order == "price-desc":
        order_clause = " | order(price desc)"
    elif sort_order == "name-asc":
        order_clause = " | order(name asc)"
    elif sort_order == "name-desc":
        order_clause = " | order(name desc)"
    # Default is no order_clause if 'newest' or unrecognized, but we explicitly set 'newest' above.

    query = textwrap.dedent(f"""
    *[_type == "product"{filter_clause}]{order_clause}{{
        _id,
        name,
        "slug": slug.current,
        price,
        description,
        category->{{_id, title, "slug": slug.current}},
        "imageUrl": mainImage.asset->url,
        "alt": mainImage.alt,
        stock,
        isFeatured,
        sku
    }}
    """)
    url_params = {"query": query}
    try:
        # --- DEBUGGING PRINTS ADDED BELOW ---
        print(f"DEBUG (sanity_service.py): fetch_all_products called. Category slug: '{category_slug}', Sort order: '{sort_order}'")
        print(f"DEBUG (sanity_service.py): GROQ query for all products: {query}")
        response = await sanity_client.get("/", params=url_params)
        print(f"DEBUG (sanity_service.py): Sanity API Response Status (all products): {response.status_code}")
        print(f"DEBUG (sanity_service.py): Sanity API Response Body (all products): {response.text}") # IMPORTANT: Raw response from Sanity
        # --- END DEBUGGING PRINTS ---
        if response.status_code == 200:
            return response.json().get("result", [])
        else:
            print(f"ERROR: Sanity API request failed (all products): {response.text}")
            return []
    except Exception as e:
        print(f"Error fetching all products: {e}")
        return []

async def fetch_product_by_slug(product_slug: str):
    """
    Fetches a single product by its slug.
    """
    query = textwrap.dedent(f"""
    *[_type == "product" && slug.current == "{product_slug}"][0]{{
        _id,
        name,
        "slug": slug.current,
        price,
        description,
        category->{{_id, title, "slug": slug.current}},
        "imageUrl": mainImage.asset->url,
        "alt": mainImage.alt,
        stock,
        isFeatured,
        sku
    }}
    """)
    url_params = {"query": query}
    try:
        print(f"DEBUG (sanity_service.py): fetch_product_by_slug called for slug: '{product_slug}'")
        print(f"DEBUG (sanity_service.py): GROQ query: {query}")
        response = await sanity_client.get("/", params=url_params)
        print(f"DEBUG (sanity_service.py): Sanity API Response Status (single product): {response.status_code}")
        print(f"DEBUG (sanity_service.py): Sanity API Response Body (single product): {response.text}") # IMPORTANT: Raw response from Sanity
        if response.status_code == 200:
            return response.json().get("result", None)
        else:
            print(f"ERROR: Sanity API request failed (single product by slug): {response.text}")
            return None
    except Exception as e:
        print(f"Error fetching product by slug: {e}")
        return None

async def fetch_static_promos():
    query = textwrap.dedent("""
    *[_type == "promo"]{
        title,
        description,
        discount,
        validUntil,
        "imageUrl": image.asset->url
    }
    """)
    url_params = {"query": query}
    try:
        response = await sanity_client.get("/", params=url_params)
        if response.status_code == 200:
            return response.json().get("result", [])
        else:
            print(f"ERROR: Sanity API request failed (promos): {response.text}")
            return []
    except Exception as e:
        print(f"Error fetching promos: {e}")
        return None


