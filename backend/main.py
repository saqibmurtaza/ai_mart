# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, Query
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from database.db import create_db_tables, get_session, supabase_admin, supabase_public
from services.sanity_service import (
    fetch_static_promos, 
    fetch_homepage_section, 
    fetch_content_blocks, 
    fetch_categories, 
    fetch_featured_products,
    fetch_all_products, 
    fetch_product_by_slug 
)
from models.models import Product, DynamicPromo, CartItem, CheckoutPayload, Order, OrderItem, SanityProductAPIModel, HomepageSection, ContentBlock, Category, ProductDisplayAPIModel
import logging, json, asyncio
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from gotrue.errors import AuthApiError # Import specific Supabase Auth error if needed
from postgrest.exceptions import APIError # Import specific Supabase Postgrest error

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.info("CREATING DATABASE TABLES...")
    await create_db_tables()
    logging.info("Database tables created successfully.")
    
    yield
    logging.info("Shutting down the application...")


app = FastAPI(
    lifespan=lifespan,
    title='API for E-commerce application',
    version='1.0.0',
    servers=[
        {
            "url": "http://localhost:8000",
            "description": "Local development server localhost:8000",
        }
    ]
)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the E-commerce API!"}

# --- PRODUCT ENDPOINTS ---
@app.get("/products", response_model=List[ProductDisplayAPIModel])
async def get_products(
    category: Optional[str] = Query(None, description="Filter products by category slug"),
    sort: str = Query("newest", description="Sort order: newest, price-asc, price-desc, name-asc, name-desc"),
    minPrice: Optional[float] = Query(None, description="Minimum price for filtering"),
    maxPrice: Optional[float] = Query(None, description="Maximum price for filtering")
):
    """
    Fetches products from Sanity CMS, optionally filtered by category slug, price range, and sorted.
    """
    print(f"DEBUG (main.py /products): Endpoint called. Category: '{category}', Sort: '{sort}', Min Price: {minPrice}, Max Price: {maxPrice}")
    raw_products = await fetch_all_products(
        category_slug=category,
        sort_order=sort,
        min_price=minPrice,
        max_price=maxPrice
    )
    print(f"DEBUG (main.py /products): Raw products from Sanity service: {raw_products}")

    if not raw_products:
        print(f"DEBUG (main.py /products): No raw products found. Returning empty list.")
        return []

    transformed_products = []
    for i, p in enumerate(raw_products):
        print(f"DEBUG (main.py /products): Processing raw product at index {i}: {p}")
        print(f"DEBUG (main.py /products): Type of raw product at index {i}: {type(p)}")

        slug_data = p.get('slug')
        if isinstance(slug_data, dict) and 'current' in slug_data:
            slug_value = slug_data.get('current')
        elif isinstance(slug_data, str):
            slug_value = slug_data
        else:
            slug_value = None
        print(f"DEBUG (main.py /products): Extracted slug_value for product {p.get('name') or p.get('_id')}: {slug_value}")
        
        category_title = p.get('category', {}).get('title') if isinstance(p.get('category'), dict) else None

        transformed_products.append(ProductDisplayAPIModel(
            id=p.get('_id'),
            slug=slug_value,
            name=p.get('name'),
            price=p.get('price'),
            description=p.get('description'),
            category=category_title,
            imageUrl=p.get('imageUrl'),
            alt=p.get('alt'),
            stock=p.get('stock'),
            isFeatured=p.get('isFeatured', False),
            sku=p.get('sku')
        ))
    print(f"DEBUG (main.py /products): Transformed products before returning: {transformed_products}")
    return transformed_products

@app.get("/products/featured", response_model=List[ProductDisplayAPIModel])
async def get_featured_products_endpoint():
    """
    Fetches featured products from Sanity CMS and transforms the data to match the response model.
    """
    raw_products = await fetch_featured_products()

    if not raw_products:
        return []

    transformed_products = []
    for product in raw_products:
        slug_data = product.get('slug')
        if isinstance(slug_data, dict) and 'current' in slug_data:
            slug_value = slug_data.get('current')
        elif isinstance(slug_data, str):
            slug_value = slug_data
        else:
            slug_value = None
        category_title = product.get('category')

        transformed_products.append(ProductDisplayAPIModel(
            id=product.get('_id'),
            slug=slug_value,
            name=product.get('name'),
            price=product.get('price'),
            description=product.get('description'),
            category=category_title,
            imageUrl=product.get('imageUrl'),
            alt=product.get('alt'),
            stock=product.get('stock'),
            isFeatured=product.get('isFeatured', False),
            sku=product.get('sku')
        ))
    return transformed_products

@app.get("/products/{product_slug}", response_model=ProductDisplayAPIModel)
async def get_product(product_slug: str):
    """
    Retrieves a single product by its slug from Sanity CMS.
    """
    print(f"DEBUG (main.py /products/{{slug}}): get_product endpoint received slug: '{product_slug}'")
    if not product_slug or product_slug.lower() == "null":
        print(f"DEBUG (main.py /products/{{slug}}): Invalid or null slug received: '{product_slug}'. Raising 400.")
        raise HTTPException(status_code=400, detail="Invalid product slug")
    
    raw_product = await fetch_product_by_slug(product_slug) 
    print(f"DEBUG (main.py /products/{{slug}}): Raw product from sanity_service.py: {raw_product}")
    
    if not raw_product:
        print(f"DEBUG (main.py /products/{{slug}}): Product not found in Sanity service response for slug: {product_slug}. Raising 404.")
        raise HTTPException(status_code=404, detail="Product not found")

    slug_data = raw_product.get('slug')
    if isinstance(slug_data, dict) and 'current' in slug_data:
        slug_value = slug_data.get('current')
    elif isinstance(slug_data, str):
        slug_value = slug_data
    else:
        slug_value = None
    category_title = raw_product.get('category', {}).get('title') if isinstance(raw_product.get('category'), dict) else None

    transformed_product = ProductDisplayAPIModel(
        id=raw_product.get('_id'),
        slug=slug_value,
        name=raw_product.get('name'),
        price=raw_product.get('price'),
        description=raw_product.get('description'),
        category=category_title,
        imageUrl=raw_product.get('imageUrl'),
        alt=raw_product.get('alt'),
        stock=raw_product.get('stock'),
        isFeatured=raw_product.get('isFeatured', False),
        sku=raw_product.get('sku')
    )
    print(f"DEBUG (main.py /products/{{slug}}): Transformed product before returning: {transformed_product}")
    return transformed_product

# --- PROMO ENDPOINTS (existing) ---
@app.post("/promos/dynamic", response_model=DynamicPromo)
async def create_dynamic_promo(
    payload: DynamicPromo
):
    try:
        result = supabase_public.table('dynamic_promo').insert(payload.model_dump()).execute()
        if result.data:
            return DynamicPromo.model_validate(result.data[0], from_attributes=True)
        raise HTTPException(status_code=500, detail="Failed to insert dynamic promo.")
    except APIError as e: # Catch specific Supabase APIError
        logger.error(f"Supabase API Error creating dynamic promo: {e.message}", exc_info=True)
        raise HTTPException(status_code=e.code if isinstance(e.code, int) else 500, detail=f"Failed to create dynamic promo: {e.message}")
    except Exception as e:
        logger.error(f"Error creating dynamic promo: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/promos/dynamic", response_model=List[DynamicPromo])
async def get_dynamic_promos():
    try: 
        result = supabase_public.table('dynamic_promo').select('*').execute()
        # APIError will be raised if there's an issue, no need for result.error check
        return [DynamicPromo.model_validate(item, from_attributes=True) for item in result.data]
    except APIError as e: # Catch specific Supabase APIError
        logger.error(f"Supabase API Error fetching dynamic promos: {e.message}", exc_info=True)
        raise HTTPException(status_code=e.code if isinstance(e.code, int) else 500, detail=f"Failed to retrieve dynamic promos: {e.message}")
    except Exception as e:
        logger.error(f"Error fetching dynamic promos: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to retrieve dynamic promos: {str(e)}")

# --- SANITY CMS (HOMEPAGE SECTIONS) ENDPOINTS (existing) ---
@app.get("/homepage-sections/{slug}", response_model=HomepageSection)
async def get_homepage_section_by_slug(slug: str):
    data = await fetch_homepage_section(slug)
    if not data:
        raise HTTPException(status_code=404, detail="Homepage section not found")
    return HomepageSection(**data)

@app.get("/content-blocks", response_model=List[ContentBlock])
async def get_content_blocks():
    data = await fetch_content_blocks()
    if not data:
        return []
    return [ContentBlock(**item) for item in data]

@app.get("/categories", response_model=List[Category])
async def get_categories_endpoint():
    data = await fetch_categories()
    if not data:
        return []
    return [Category(**item) for item in data]

# --- CART ENDPOINTS (existing) ---
@app.post("/cart", response_model=CartItem)
async def add_to_cart(payload: CartItem):
    try:
        # Use upsert with on_conflict to either insert a new item or update an existing one
        result = supabase_public.table("cartitem").upsert(
            payload.model_dump(), 
            on_conflict="user_id,product_id" 
        ).execute()

        if result.data:
            return CartItem.model_validate(result.data[0], from_attributes=True)
        
        raise HTTPException(status_code=500, detail="Failed to add/update item in cart.")
    except APIError as e: # Catch specific Supabase APIError
        logger.error(f"Supabase API Error adding/updating to cart: {e.message}", exc_info=True)
        raise HTTPException(status_code=e.code if isinstance(e.code, int) else 500, detail=f"Failed to add/update item to cart: {e.message}")
    except Exception as e:
        logger.error(f"Error adding/updating to cart: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=f"Failed to add/update item to cart: {str(e)}")

@app.get("/cart/{user_id}", response_model=Dict[str, Any])
async def get_cart(user_id: str):
    try:
        result = supabase_public.table("cartitem").select("*").eq("user_id", user_id).execute()
        cart_items_data = result.data

        if not cart_items_data:
            return {"message": "No items in cart", "cart": []}

        # Collect all unique product_ids from the cart items
        product_ids_in_cart = [item["product_id"] for item in cart_items_data]
        
        # Concurrently fetch full product details from Sanity for all products in the cart
        fetch_tasks = [fetch_product_by_slug(item["product_id"]) for item in cart_items_data]
        all_product_details = await asyncio.gather(*fetch_tasks) # Use asyncio.gather for efficiency

        enriched_cart_items = []
        for i, item in enumerate(cart_items_data):
            full_product_details = all_product_details[i] # Get the result for this specific item's product
            product_id = item["product_id"] # This is assumed to be the Sanity product slug
            
            if full_product_details:
                enriched_cart_items.append({
                    "user_id": item["user_id"],
                    "product_id": item["product_id"],
                    "quantity": item["quantity"], # Keep quantity from cart table
                    "name": full_product_details.get("name"),
                    "price": full_product_details.get("price"),
                    "imageUrl": full_product_details.get("imageUrl"),
                    "slug": full_product_details.get("slug", {}).get("current") if isinstance(full_product_details.get("slug"), dict) else full_product_details.get("slug"),
                    "alt": full_product_details.get("alt"),
                    "sku": full_product_details.get("sku")
                })
            else:
                logger.warning(f"Product details not found in Sanity for product_id (slug): {product_id} in cart. Item will be shown with limited details.")
                enriched_cart_items.append({
                    "user_id": item["user_id"],
                    "product_id": item["product_id"],
                    "quantity": item["quantity"],
                    "name": item.get("name", "Unknown Product"), 
                    "price": item.get("price", 0.0), 
                    "imageUrl": None, 
                    "slug": item["product_id"], 
                    "alt": None,
                    "sku": None
                })
        
        return {"message": "Cart retrieved", "cart": enriched_cart_items}
    except APIError as e: # Catch specific Supabase APIError
        logger.error(f"Supabase API Error getting cart: {e.message}", exc_info=True)
        raise HTTPException(status_code=e.code if isinstance(e.code, int) else 500, detail=f"Failed to retrieve cart: {e.message}")
    except Exception as e:
        logger.error(f"Error getting cart: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to retrieve cart: {str(e)}")

@app.delete("/cart/{user_id}/{product_id}")
async def remove_from_cart(user_id: str, product_id: str):
    try:
        result = supabase_admin.table("cartitem").delete().eq("user_id", user_id).eq("product_id", product_id).execute()
        # APIError will be raised if there's an issue, no need for result.error check
        return {"message": "Item removed from cart", "data": result.data}
    except APIError as e: # Catch specific Supabase APIError
        logger.error(f"Supabase API Error removing from cart: {e.message}", exc_info=True)
        raise HTTPException(status_code=e.code if isinstance(e.code, int) else 500, detail=f"Failed to remove item: {e.message}")
    except Exception as e:
        logger.error(f"Error removing from cart: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))

# --- CHECKOUT ENDPOINTS (existing) ---
@app.post("/checkout")
async def checkout(payload: CheckoutPayload):
    try:
        cart_resp = supabase_public.table("cartitem").select("product_id, quantity").eq("user_id", payload.user_id).execute()
        cart_items_data = cart_resp.data

        if not cart_items_data:
            raise HTTPException(status_code=400, detail="Cart is empty")

        product_ids_in_cart = [item["product_id"] for item in cart_items_data]

        products_resp = supabase_public.table("product").select("id, price").in_("id", product_ids_in_cart).execute()
        products_data = {p["id"]: p for p in products_resp.data}

        total_amount = 0.0
        processed_cart_items = []
        
        for item in cart_items_data:
            product_id_in_cart = item.get("product_id")
            quantity_in_cart = item.get("quantity")

            product_info = products_data.get(product_id_in_cart)
            if not product_info:
                raise HTTPException(status_code=404, detail=f"Product with ID {product_id_in_cart} not found during checkout.")
            
            product_price = product_info.get("price")
            total_amount += product_price * quantity_in_cart

            processed_cart_items.append({
                "product_id": product_id_in_cart,
                "quantity": quantity_in_cart,
                "price": product_price
            })
            
        order_instance = Order(
            user_id=payload.user_id,
            shipping_address=payload.shipping_address,
            total_amount=total_amount,
            status="pending"
        )
        order_dict_for_insert = order_instance.model_dump()
        order_dict_for_insert["created_at"] = order_instance.created_at.isoformat()

        order_resp = supabase_public.table("order").insert(order_dict_for_insert).execute()
        
        if not order_resp.data:
            raise HTTPException(status_code=500, detail="Failed to create order in Supabase.")
        
        order_id = order_resp.data[0]["id"]

        final_order_items_for_insert = []
        for item_data in processed_cart_items:
            new_order_item_instance = OrderItem(
                order_id=order_id,
                product_id=item_data["product_id"],
                quantity=item_data["quantity"],
                price=item_data["price"]
            )
            final_order_items_for_insert.append(new_order_item_instance.model_dump())

        await supabase_public.table("orderitem").insert(final_order_items_for_insert).execute()

        await supabase_public.table("cartitem").delete().eq("user_id", payload.user_id).execute()
        
        return {"message": "Order placed successfully", "order_id": order_id}

    except APIError as e: # Catch specific Supabase APIError
        logger.error(f"Supabase API Error during checkout: {e.message}", exc_info=True)
        raise HTTPException(status_code=e.code if isinstance(e.code, int) else 500, detail=f"Failed to process checkout: {e.message}")
    except Exception as e:
        logger.error(f"Error during checkout: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to process checkout: {str(e)}")

# ----ORDER ENDPOINTS (existing) ---
@app.get("/orders/{user_id}", response_model=Dict[str, Any])
async def get_orders(user_id: str):
    try:
        result = supabase_public.table("order").select("*, orderitem(*)").eq("user_id", user_id).order("created_at", desc=True).execute()
        orders_data = result.data

        if not orders_data:
            return {"message": "No orders found for this user", "orders": []}

        final_orders = []
        for order in orders_data:
            order_items_list = order.get("orderitem", [])
            order["items"] = json.dumps(order_items_list)
            del order["orderitem"]
            final_orders.append(order)

        return {"message": "Orders retrieved", "orders": final_orders}

    except APIError as e: # Catch specific Supabase APIError
        logger.error(f"Supabase API Error fetching orders: {e.message}", exc_info=True)
        raise HTTPException(status_code=e.code if isinstance(e.code, int) else 500, detail=f"Failed to retrieve orders: {e.message}")
    except Exception as e:
        logger.error(f"ERROR: Failed to fetch orders for user {user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to retrieve orders: {str(e)}")
