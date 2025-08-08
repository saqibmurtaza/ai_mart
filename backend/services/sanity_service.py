import os
import httpx
import textwrap
from typing import Optional, Any, Dict, List

# Environment variables for Sanity project
SANITY_PROJECT_ID = os.getenv("SANITY_PROJECT_ID")
SANITY_DATASET = os.getenv("SANITY_DATASET")
SANITY_API_VERSION = os.getenv("SANITY_API_VERSION", "v2023-05-25")

if not SANITY_PROJECT_ID or not SANITY_DATASET:
    raise ValueError("SANITY_PROJECT_ID and SANITY_DATASET must be set in environment variables.")

BASE_URL = f"https://{SANITY_PROJECT_ID}.api.sanity.io/{SANITY_API_VERSION}/data/query/{SANITY_DATASET}"


async def _fetch_from_sanity(query: str) -> Optional[Any]:
    """Helper function to send GROQ queries to Sanity safely."""
    url_params = {"query": query.strip()}
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(BASE_URL, params=url_params, timeout=15.0)
            if response.status_code != 200:
                print(f"[ERROR] Sanity API request failed with status {response.status_code}: {response.text}")
                return None
            data = response.json()
            if not isinstance(data, dict):
                print(f"[ERROR] Invalid response structure: {data}")
                return None
            return data.get("result")
        except httpx.RequestError as e:
            print(f"[ERROR] Network error while fetching from Sanity: {e}")
            return None
        except ValueError as e:
            print(f"[ERROR] Failed to parse Sanity response as JSON: {e}")
            return None
        except Exception as e:
            print(f"[ERROR] Unexpected error in _fetch_from_sanity: {e}")
            return None


async def fetch_homepage_section(slug: str):
    query = f"""
    *[_type == "homepageSection" && slug.current == "{slug}"][0]{{
        title,
        description,
        "imageUrl": image.asset->url,
        "alt": image.alt
    }}
    """
    return await _fetch_from_sanity(query)


async def fetch_content_blocks():
    query = """
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
    """
    return await _fetch_from_sanity(query) or []


async def fetch_categories():
    query = """
    *[_type == "category"] | order(order asc){
        _id,
        title,
        "slug": slug.current,
        description,
        "imageUrl": image.asset->url,
        "alt": image.alt,
        order
    }
    """
    return await _fetch_from_sanity(query) or []


async def fetch_featured_products():
    query = """
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
    """
    return await _fetch_from_sanity(query) or []


async def fetch_all_products(
    category_slug: Optional[str] = None,
    sort_order: str = "newest",
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    limit: int = 20,
    offset: int = 0,
):
    filters = []
    if category_slug:
        filters.append(f'category->slug.current == "{category_slug}"')
    if min_price is not None:
        filters.append(f"price >= {min_price}")
    if max_price is not None:
        filters.append(f"price <= {max_price}")

    filter_clause = f" && {' && '.join(filters)}" if filters else ""

    sort_map = {
        "newest": "_createdAt desc",
        "price-asc": "price asc",
        "price-desc": "price desc",
        "name-asc": "name asc",
        "name-desc": "name desc",
    }
    order_clause = sort_map.get(sort_order, "_createdAt desc")

    query = f"""
    *[_type == "product"{filter_clause}]
    | order({order_clause})[{offset}...{offset + limit}] {{
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
    """
    return await _fetch_from_sanity(query) or []


async def fetch_product_by_slug(product_slug: str):
    query = f"""
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
    """
    return await _fetch_from_sanity(query)


async def fetch_product_by_id(product_id: str):
    query = f"""
    *[_type == "product" && _id == "{product_id}"][0]{{
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
    """
    return await _fetch_from_sanity(query)


async def fetch_static_promos():
    query = """
    *[_type == "promo"]{
        title,
        description,
        discount,
        validUntil,
        "imageUrl": image.asset->url
    }
    """
    return await _fetch_from_sanity(query) or []
