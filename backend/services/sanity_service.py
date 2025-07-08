import os, httpx, textwrap
from typing import Optional

SANITY_PROJECT_ID = os.getenv("SANITY_PROJECT_ID")
SANITY_DATASET = os.getenv("SANITY_DATASET")
SANITY_API_VERSION = os.getenv("SANITY_API_VERSION", "v2023-05-25")

if not SANITY_PROJECT_ID or not SANITY_DATASET:
    raise ValueError("SANITY_PROJECT_ID and SANITY_DATASET must be set in environment variables.")

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
    
    print(f"DEBUG: Sanity GROQ Query (homepage): {query}")
    print(f"DEBUG: Sanity API Base URL: {sanity_client.base_url}")
    
    try:
        response = await sanity_client.get("/", params=url_params)
        
        print(f"DEBUG: Sanity API Response Status (homepage): {response.status_code}")
        print(f"DEBUG: Sanity API Response Body (homepage): {response.text}")
        
        if response.status_code == 200:
            result = response.json().get("result", None)
            print(f"DEBUG: Sanity API Raw Result (homepage): {result}")
            return result
        else:
            print(f"ERROR: Sanity API request failed (homepage): {response.text}")
            return None
    except httpx.HTTPStatusError as exc:
        print(f"HTTP Error fetching homepage section: {exc.response.status_code} - {exc.response.text}")
        return None
    except httpx.RequestError as exc:
        print(f"Network Error fetching homepage section: {exc.request.url} - {exc}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred while fetching homepage section: {e}")
        return None

async def fetch_content_blocks():
    query = textwrap.dedent(f"""
    *[_type == "contentBlock"] | order(order asc){{
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
    }}
    """)
    url_params = {"query": query}

    print(f"DEBUG: Sanity GROQ Query (content blocks): {query}")

    try:
        response = await sanity_client.get("/", params=url_params)

        print(f"DEBUG: Sanity API Response Status (content blocks): {response.status_code}")
        print(f"DEBUG: Sanity API Response Body (content blocks): {response.text}")

        if response.status_code == 200:
            result = response.json().get("result", [])
            print(f"DEBUG: Sanity API Raw Result (content blocks): {result}")
            return result
        else:
            print(f"ERROR: Sanity API request failed (content blocks): {response.text}")
            return []
    except httpx.HTTPStatusError as exc:
        print(f"HTTP Error fetching content blocks: {exc.response.status_code} - {exc.response.text}")
        return []
    except httpx.RequestError as exc:
        print(f"Network Error fetching content blocks: {exc.request.url} - {exc}")
        return []
    except Exception as e:
        print(f"An unexpected error occurred while fetching content blocks: {e}")
        return []

async def fetch_categories():
    query = textwrap.dedent(f"""
    *[_type == "category"] | order(order asc){{
        _id,
        title,
        "slug": slug.current,
        description,
        "imageUrl": image.asset->url,
        "alt": image.alt,
        order
    }}
    """)
    url_params = {"query": query}

    print(f"DEBUG: Sanity GROQ Query (categories): {query}")

    try:
        response = await sanity_client.get("/", params=url_params)

        print(f"DEBUG: Sanity API Response Status (categories): {response.status_code}")
        print(f"DEBUG: Sanity API Response Body (categories): {response.text}")

        if response.status_code == 200:
            result = response.json().get("result", [])
            print(f"DEBUG: Sanity API Raw Result (categories): {result}")
            return result
        else:
            print(f"ERROR: Sanity API request failed (categories): {response.text}")
            return []
    except httpx.HTTPStatusError as exc:
        print(f"HTTP Error fetching categories: {exc.response.status_code} - {exc.response.text}")
        return []
    except httpx.RequestError as exc:
        print(f"Network Error fetching categories: {exc.request.url} - {exc}")
        return []
    except Exception as e:
        print(f"An unexpected error occurred while fetching categories: {e}")
        return None

async def fetch_featured_products():
    """
    Fetches published 'product' documents marked as 'isFeatured' from Sanity CMS.
    """
    query = textwrap.dedent(f"""
    *[_type == "product" && isFeatured == true] | order(_createdAt desc){{
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
    }}
    """)
    url_params = {"query": query}

    print(f"DEBUG: Sanity GROQ Query (featured products): {query}")

    try:
        response = await sanity_client.get("/", params=url_params)

        print(f"DEBUG: Sanity API Response Status (featured products): {response.status_code}")
        print(f"DEBUG: Sanity API Response Body (featured products): {response.text}")

        if response.status_code == 200:
            result = response.json().get("result", [])
            print(f"DEBUG: Sanity API Raw Result (featured products): {result}")
            return result
        else:
            print(f"ERROR: Sanity API request failed (featured products): {response.text}")
            return []
    except httpx.HTTPStatusError as exc:
        print(f"HTTP Error fetching featured products: {exc.response.status_code} - {exc.response.text}")
        return []
    except httpx.RequestError as exc:
        print(f"Network Error fetching featured products: {exc.request.url} - {exc}")
        return []
    except Exception as e:
        print(f"An unexpected error occurred while fetching featured products: {e}")
        return None

async def fetch_all_products(category_slug: Optional[str] = None):
    """
    Fetches all published 'product' documents from Sanity CMS,
    optionally filtered by category slug.
    """
    # Base query for all products
    query_template = """
    *[_type == "product"]{
        _id,
        name,
        "slug": slug.current,
        price,
        description,
        category->{
            _id,
            title,
            "slug": slug.current
        },
        "imageUrl": mainImage.asset->url,
        "alt": mainImage.alt,
        stock,
        isFeatured,
        sku
    }
    """
    # If a category slug is provided, add a filter
    if category_slug:
        query_template = f"""
        *[_type == "product" && category->slug.current == "{category_slug}"]{{
            _id,
            name,
            "slug": slug.current,
            price,
            description,
            category->{{"_id", title, "slug": slug.current}},
            "imageUrl": mainImage.asset->url,
            "alt": mainImage.alt,
            stock,
            isFeatured,
            sku
        }}
        """
    query = textwrap.dedent(query_template)
    url_params = {"query": query}
    print(f"DEBUG: Sanity GROQ Query (all products/category filtered): {query}")

    try:
        response = await sanity_client.get("/", params=url_params)
        print(f"DEBUG: Sanity API Response Status (all products/category filtered): {response.status_code}")
        print(f"DEBUG: Sanity API Response Body (all products/category filtered): {response.text}")

        if response.status_code == 200:
            result = response.json().get("result", [])
            print(f"DEBUG: Sanity API Raw Result (all products/category filtered): {result}")
            return result
        else:
            print(f"ERROR: Sanity API request failed (all products/category filtered): {response.text}")
            return []
    except httpx.HTTPStatusError as exc:
        print(f"HTTP Error fetching products: {exc.response.status_code} - {exc.response.text}")
        return []
    except httpx.RequestError as exc:
        print(f"Network Error fetching products: {exc.request.url} - {exc}")
        return []
    except Exception as e:
        print(f"An unexpected error occurred while fetching products: {e}")
        return []

async def fetch_product_by_slug(product_slug: str):
    """
    Fetches a single published 'product' document by its slug from Sanity CMS.
    """
    query = textwrap.dedent(f"""
    *[_type == "product" && slug.current == "{product_slug}"][0]{{
        _id,
        name,
        "slug": slug.current,
        price,
        description,
        category->{{"_id", title, "slug": slug.current}},
        "imageUrl": mainImage.asset->url,
        "alt": mainImage.alt,
        stock,
        isFeatured,
        sku
    }}
    """)
    url_params = {"query": query}
    print(f"DEBUG: Sanity GROQ Query (single product by slug): {query}")

    try:
        response = await sanity_client.get("/", params=url_params)
        print(f"DEBUG: Sanity API Response Status (single product by slug): {response.status_code}")
        print(f"DEBUG: Sanity API Response Body (single product by slug): {response.text}")

        if response.status_code == 200:
            result = response.json().get("result", None)
            print(f"DEBUG: Sanity API Raw Result (single product by slug): {result}")
            return result
        else:
            print(f"ERROR: Sanity API request failed (single product by slug): {response.text}")
            return None
    except httpx.HTTPStatusError as exc:
        print(f"HTTP Error fetching single product by slug: {exc.response.status_code} - {exc.response.text}")
        return []
    except httpx.RequestError as exc:
        print(f"Network Error fetching single product by slug: {exc.request.url} - {exc}")
        return []
    except Exception as e:
        print(f"An unexpected error occurred while fetching single product by slug: {e}")
        return None


async def fetch_static_promos():
    query = textwrap.dedent(f"""
    *[_type == "promo"]{{title, description, discount, validUntil, "imageUrl": image.asset->url}}
    """)
    url_params = {"query": query}
    
    print(f"DEBUG: Sanity GROQ Query (promos): {query}")
    
    try:
        response = await sanity_client.get("/", params=url_params)
        
        print(f"DEBUG: Sanity API Response Status (promos): {response.status_code}")
        print(f"DEBUG: Sanity API Response Body (promos): {response.text}")
        
        if response.status_code == 200:
            return response.json().get("result", [])
        else:
            print(f"ERROR: Sanity API request failed (promos): {response.text}")
            return []
    except httpx.HTTPStatusError as exc:
        print(f"HTTP Error fetching static promos: {exc.response.status_code} - {exc.response.text}")
        return []
    except httpx.RequestError as exc:
        print(f"Network Error fetching static promos: {exc.request.url} - {exc}")
        return []
    except Exception as e:
        print(f"An unexpected error occurred while fetching static promos: {e}")
        return []
