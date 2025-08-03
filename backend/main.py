# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, Request, Header, Body, Query
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from httpx import request
from database.db import create_db_tables, supabase_admin, supabase_public
from services.sanity_service import (
    fetch_static_promos,
    fetch_homepage_section,
    fetch_content_blocks,
    fetch_categories,
    fetch_featured_products,
    fetch_all_products,
    fetch_product_by_id,
    fetch_product_by_slug
)
from models.models import (Product, DynamicPromo, CartItem, 
                           CheckoutPayload, Order, OrderItem, 
                           SanityProductAPIModel, 
                           HomepageSection, ContentBlock, Category, 
                           ProductDisplayAPIModel, SanityProductData)
import logging, json, asyncio
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from postgrest.exceptions import APIError
from dotenv import load_dotenv
import hmac, time, base64 # New Import
import hashlib # New Import
import os # New Import
from utils import (
    SignatureValidationError, 
    verify_sanity_webhook_signature, normalize_product_id, 
    get_supabase_client, fetch_product_by_supabase_id,
    get_supabase_client_and_user,
    fetch_product_by_supabase_id,
    normalize_product_id,
    )
from supabase import Client
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load Sanity webhook secret from environment variables
load_dotenv()
# IMPORTANT: Set this environment variable securely in your deployment environment.
SANITY_WEBHOOK_SECRET = os.getenv("SANITY_WEBHOOK_SECRET")
print(f"Loaded SANITY_WEBHOOK_SECRET: {SANITY_WEBHOOK_SECRET}")  # Debugging line, remove in production
if not SANITY_WEBHOOK_SECRET:
    logger.error("SANITY_WEBHOOK_SECRET environment variable not set. Webhook verification will be skipped.")
    # Optionally, you can raise an error or handle it gracefully
    raise ValueError("SANITY_WEBHOOK_SECRET environment variable not set.")   

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks
    logger.info("Starting up application.")

    logger.info("CREATING DATABASE TABLES...")
    await create_db_tables()
    logger.info("Database tables created successfully.")
    yield
    # Shutdown tasks
    logger.info("Shutting down the application...")


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
    "[http://127.0.0.1:3000](http://127.0.0.1:3000)",
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

# --- PRODUCT ENDPOINTS (No changes needed here for the fix) ---
@app.get("/products", response_model=List[ProductDisplayAPIModel])
async def get_products(
    category: Optional[str] = Query(None, description="Filter products by category slug"),
    sort: str = Query("newest", description="Sort order: newest, price-asc, price-desc, name-asc, name-desc"),
    minPrice: Optional[float] = Query(None, description="Minimum price for filtering"),
    maxPrice: Optional[float] = Query(None, description="Maximum price for filtering")
):
    logger.info(f"Fetching products: category={category}, sort={sort}, minPrice={minPrice}, maxPrice={maxPrice}")
    try:
        raw_products = await fetch_all_products(
            category_slug=category,
            sort_order=sort,
            min_price=minPrice,
            max_price=maxPrice
        )
        if not raw_products:
            return []

        transformed_products = []
        for p in raw_products:
            slug_data = p.get('slug')
            slug_value = slug_data.get('current') if isinstance(slug_data, dict) else slug_data
            category_title = p.get('category', {}).get('title') if isinstance(p.get('category'), dict) else None

            transformed_products.append(ProductDisplayAPIModel(
                id=p.get('_id'), # This is Sanity _id, used for display
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
        return transformed_products
    except Exception as e:
        logger.error(f"Error fetching products: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch products")

@app.get("/products/featured", response_model=List[ProductDisplayAPIModel])
async def get_featured_products_endpoint():
    logger.info("Fetching featured products")
    try:
        raw_products = await fetch_featured_products()
        if not raw_products:
            return []

        transformed_products = []
        for product in raw_products:
            slug_data = product.get('slug')
            slug_value = slug_data.get('current') if isinstance(slug_data, dict) else slug_data
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
    except Exception as e:
        logger.error(f"Error fetching featured products: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch featured products")

@app.get("/products/{product_slug}", response_model=ProductDisplayAPIModel)
async def get_product(product_slug: str):
    logger.info(f"Fetching product by slug: {product_slug}")
    if not product_slug or product_slug.lower() == "null":
        raise HTTPException(status_code=400, detail="Invalid product slug")

    try:
        raw_product = await fetch_product_by_slug(product_slug)
        if not raw_product:
            raise HTTPException(status_code=404, detail="Product not found")

        slug_data = raw_product.get('slug')
        slug_value = slug_data.get('current') if isinstance(slug_data, dict) else slug_data
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
        return transformed_product
    except Exception as e:
        logger.error(f"Error fetching product {product_slug}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch product")

# --- PROMO ENDPOINTS (No changes needed here) ---
@app.post("/promos/dynamic", response_model=DynamicPromo)
async def create_dynamic_promo(payload: DynamicPromo):
    logger.info(f"Creating dynamic promo: {payload.title}")
    try:
        result = supabase_public.table('dynamic_promo').insert(payload.model_dump()).execute()
        if result.data:
            return DynamicPromo.model_validate(result.data[0], from_attributes=True)
        raise HTTPException(status_code=500, detail="Failed to insert dynamic promo")
    except APIError as e:
        logger.error(f"Supabase error creating dynamic promo: {e.message}", exc_info=True)
        raise HTTPException(status_code=e.code if isinstance(e.code, int) else 500, detail=f"Failed to create dynamic promo: {e.message}")
    except Exception as e:
        logger.error(f"Error creating dynamic promo: {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/promos/dynamic", response_model=List[DynamicPromo])
async def get_dynamic_promos():
    logger.info("Fetching dynamic promos")
    try:
        result = supabase_public.table('dynamic_promo').select('*').execute()
        return [DynamicPromo.model_validate(item, from_attributes=True) for item in result.data]
    except APIError as e:
        logger.error(f"Supabase error fetching dynamic promos: {e.message}", exc_info=True)
        raise HTTPException(status_code=e.code if isinstance(e.code, int) else 500, detail=f"Failed to retrieve dynamic promos: {e.message}")
    except Exception as e:
        logger.error(f"Error fetching dynamic promos: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to retrieve dynamic promos: {str(e)}")

# --- SANITY CMS (HOMEPAGE SECTIONS) ENDPOINTS (No changes needed here) ---
@app.get("/homepage/sections/{slug}", response_model=HomepageSection)
async def get_homepage_section_by_slug(slug: str):
    logger.info(f"Fetching homepage section: {slug}")
    try:
        data = await fetch_homepage_section(slug)
        if not data:
            raise HTTPException(status_code=404, detail="Homepage section not found")
        return HomepageSection(**data)
    except Exception as e:
        logger.error(f"Error fetching homepage section {slug}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch homepage section")

@app.get("/content-blocks", response_model=List[ContentBlock])
async def get_content_blocks():
    logger.info("Fetching content blocks")
    try:
        data = await fetch_content_blocks()
        if not data:
            return []
        return [ContentBlock(**item) for item in data]
    except Exception as e:
        logger.error(f"Error fetching content blocks: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch content blocks")

@app.get("/categories", response_model=List[Category])
async def get_categories_endpoint():
    logger.info("Fetching categories")
    try:
        data = await fetch_categories()
        if not data:
            return []
        return [Category(**item) for item in data]
    except Exception as e:
        logger.error(f"Error fetching categories: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch categories")

# --- CART ENDPOINTS (Modified to use Supabase product table) ---

@app.post("/cart", response_model=CartItem)
async def add_to_cart(
    payload: CartItem,
    request: Request
):
    supabase_client, user_id = get_supabase_client_and_user(request)

    logger.info(f"Received add-to-cart payload: {payload.model_dump()}")

    product_id = normalize_product_id(payload.product_id)
    # fetch_product_by_supabase_id should be sync unless you use async supabase
    product = fetch_product_by_supabase_id(product_id, supabase_client)

    if not product:
        logger.error(f"Product not found in Supabase for id: {product_id}")
        raise HTTPException(status_code=404, detail=f"Product with ID {product_id} not found in Supabase")

    # Always override any user_id from client with the authenticated one
    payload_dict = payload.model_dump(by_alias=True)
    payload_dict["user_id"] = user_id
    payload_dict["product_id"] = product_id

    # Check if item exists for this user/product
    existing_item_resp = supabase_client.table("cartitem") \
        .select("quantity") \
        .eq("user_id", user_id) \
        .eq("product_id", product_id) \
        .execute()
    existing_item_data = existing_item_resp.data or []

    if existing_item_data:
        current_quantity = existing_item_data[0]["quantity"]
        new_quantity = current_quantity + payload.quantity
        result = supabase_client.table("cartitem") \
            .update({"quantity": new_quantity}) \
            .eq("user_id", user_id) \
            .eq("product_id", product_id) \
            .execute()
    else:
        result = supabase_client.table("cartitem") \
            .upsert(payload_dict) \
            .execute()

    if result.data:
        return CartItem.model_validate(result.data[0], from_attributes=True)
    raise HTTPException(status_code=500, detail="Cart update failed.")

# ----------------------

@app.get("/cart", response_model=Dict[str, Any])
async def get_cart(
    request: Request,
):
    supabase_client, user_id = get_supabase_client_and_user(request)
    result = supabase_client.table("cartitem").select("*").eq("user_id", user_id).execute()
    cart_items_data = result.data or []

    enriched_cart = []
    for item in cart_items_data:
        product = fetch_product_by_supabase_id(item["product_id"], supabase_client)
        enriched_cart.append({
            "user_id": item["user_id"],
            "product_id": item["product_id"],
            "quantity": item["quantity"],
            "name": product.get("name") if product else item.get("name", "Unknown Product"),
            "price": product.get("price") if product else item.get("price", 0.0),
            "imageUrl": product.get("imageUrl") if product else None,
            "slug": product.get("slug") if product else None,
            "alt": product.get("alt") if product else None,
            "sku": product.get("sku") if product else item.get("sku"),
        })
    return {"message": "Cart retrieved", "cart": enriched_cart}

# ----------------------

@app.put("/cart/{product_id}", response_model=CartItem)
async def update_cart_item_quantity(
    request: Request,
    product_id: str,
    payload: dict = Body(...),
):
    supabase_client, user_id = get_supabase_client_and_user(request)
    quantity = payload.get("quantity")
    if quantity is None or not isinstance(quantity, int) or quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be a positive integer")
    norm_product_id = normalize_product_id(product_id)
    existing_resp = supabase_client.table("cartitem") \
        .select("*") \
        .eq("user_id", user_id) \
        .eq("product_id", norm_product_id) \
        .execute()
    if not existing_resp.data:
        raise HTTPException(status_code=404, detail="Cart item not found")
    result = supabase_client.table("cartitem") \
        .update({"quantity": quantity}) \
        .eq("user_id", user_id) \
        .eq("product_id", norm_product_id) \
        .execute()
    if result.data:
        return CartItem.model_validate(result.data[0], from_attributes=True)
    raise HTTPException(status_code=500, detail="Failed to update cart item quantity")

# ----------------------

@app.delete("/cart/{product_id}")
async def remove_from_cart(
    product_id: str,
    request: Request
):
    supabase_client, user_id = get_supabase_client_and_user(request)
    result = supabase_client.table("cartitem") \
        .delete() \
        .eq("user_id", user_id) \
        .eq("product_id", product_id) \
        .execute()
    return {"message": "Item removed from cart", "data": result.data}



# --- CHECKOUT ENDPOINTS (Modified to use Supabase product table) ---
@app.post("/checkout")
async def checkout(payload: CheckoutPayload):
    logger.info(f"Processing checkout for user_id={payload.user_id}")
    try:
        cart_items = []
        if payload.user_id:
            cart_resp = supabase_public.table("cartitem").select("product_id, quantity, price").eq("user_id", payload.user_id).execute()
            cart_items_data = cart_resp.data
            if not cart_items_data:
                raise HTTPException(status_code=400, detail="Cart is empty")
            cart_items = [
                {
                    "product_id": item["product_id"],
                    "quantity": item["quantity"],
                    "price": item["price"]
                }
                for item in cart_items_data
            ]
        elif payload.cart_items:
            cart_items = [
                {
                    "product_id": item.product_id,
                    "quantity": item.quantity,
                    "price": item.price
                }
                for item in payload.cart_items
            ]
        else:
            raise HTTPException(status_code=400, detail="No cart items provided for guest checkout")

        product_ids = [item["product_id"] for item in cart_items]
        # Changed to fetch from Supabase product table
        product_details_from_supabase = await asyncio.gather(*[fetch_product_by_supabase_id(pid) for pid in product_ids])
        products_data = {p.get('id'): p for p in product_details_from_supabase if p}


        total_amount = 0.0
        processed_cart_items = []

        for item in cart_items:
            product_id = item["product_id"]
            quantity = item["quantity"]
            product = products_data.get(product_id)
            if not product:
                logger.error(f"Product not found during checkout: {product_id}")
                raise HTTPException(status_code=404, detail=f"Product with ID {product_id} not found during checkout")

            product_price = product.get("price")
            if product_price != item["price"]:
                logger.warning(f"Price mismatch for product {product_id}: cart price {item['price']}, Supabase product price {product_price}")
                item["price"] = product_price # Update to current product price from Supabase

            total_amount += product_price * quantity
            processed_cart_items.append({
                "product_id": product_id,
                "quantity": quantity,
                "price": product_price
            })

        order_instance = Order(
            user_id=payload.user_id or "guest",
            shipping_address=payload.shipping_address,
            total_amount=total_amount,
            status="pending"
        )
        order_dict_for_insert = order_instance.model_dump()
        order_dict_for_insert["created_at"] = order_instance.created_at.isoformat()

        order_resp = supabase_public.table("order").insert(order_dict_for_insert).execute()

        if not order_resp.data:
            logger.error("Failed to create order in Supabase")
            raise HTTPException(status_code=500, detail="Failed to create order")

        order_id = order_resp.data[0]["id"]

        final_order_items_for_insert = [
            OrderItem(
                order_id=order_id,
                product_id=item["product_id"],
                quantity=item["quantity"],
                price=item["price"]
            ).model_dump()
            for item in processed_cart_items
        ]

        supabase_public.table("orderitem").insert(final_order_items_for_insert).execute()

        if payload.user_id:
            supabase_public.table("cartitem").delete().eq("user_id", payload.user_id).execute()

        return {"message": "Order placed successfully", "order_id": order_id}

    except APIError as e:
        logger.error(f"Supabase error during checkout: {e.message}", exc_info=True)
        raise HTTPException(status_code=e.code if isinstance(e.code, int) else 500, detail=f"Failed to process checkout: {e.message}")
    except Exception as e:
        logger.error(f"Error during checkout: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to process checkout: {str(e)}")

# ---- ORDER ENDPOINTS (No changes needed here) ---
@app.get("/orders/{user_id}", response_model=Dict[str, Any])
async def get_orders(user_id: str):
    logger.info(f"Fetching orders for user_id={user_id}")
    try:
        result = supabase_public.table("order").select("*, orderitem(*)\
").eq("user_id", user_id).order("created_at", desc=True).execute()
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
    except APIError as e:
        logger.error(f"Supabase error fetching orders: {e.message}", exc_info=True)
        raise HTTPException(status_code=e.code if isinstance(e.code, int) else 500, detail=f"Failed to retrieve orders: {e.message}")
    except Exception as e:
        logger.error(f"Error fetching orders for user_id={user_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to retrieve orders: {str(e)}")

# --- SANITY WEBHOOK ENDPOINT FOR PRODUCT SYNC ---
# --- SANITY WEBHOOK DEBUG ENDPOINT ---
# This endpoint is for debugging purposes only, to log incoming headers and body.
@app.post("/webhook/sanity/debug")
async def sanity_webhook_debug(request: Request):
    headers = dict(request.headers)
    body = await request.body()

    logger.info(f"--- Incoming Headers ---")
    for k, v in headers.items():
        logger.info(f"{k}: {v}")

    logger.info(f"--- Incoming Body ---")
    try:
        logger.info(body.decode("utf-8"))
    except Exception:
        logger.info(f"Non-text body of length {len(body)} bytes")

    # Respond with received headers and body size to Postman or caller
    return {
        "received_headers": {k: v for k, v in headers.items()},
        "body_size": len(body),
        "message": "Logged headers and body for debug"
    }

# --- SANITY WEBHOOK ENDPOINT ---


logger = logging.getLogger("main")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")

# Your webhook secret - load securely in production
SANITY_WEBHOOK_SECRET = "I_am_Saqib"  # Replace with your actual secret securely

if not SANITY_WEBHOOK_SECRET:
    raise RuntimeError("SANITY_WEBHOOK_SECRET must be set for webhook verification.")



@app.post("/webhook/sanity")
async def sanity_webhook(
    request: Request,
    sanity_webhook_signature: Optional[str] = Header(None),
):
    logger.info("Received webhook request.")

    body = await request.body()
    logger.info(f"Raw request body length: {len(body)} bytes")

    # Verify webhook signature
    try:
        verify_sanity_webhook_signature(SANITY_WEBHOOK_SECRET, body, sanity_webhook_signature)
        logger.info("Webhook signature successfully verified.")
    except SignatureValidationError as e:
        logger.warning(f"Signature validation error: {e}")
        raise HTTPException(status_code=403, detail="Invalid webhook signature")

    # Parse JSON payload
    try:
        payload_json = json.loads(body)
        logger.info(f"Verified webhook payload: {json.dumps(payload_json, indent=2)}")
    except json.JSONDecodeError:
        logger.error("Invalid JSON payload")
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    try:
        # --- Handle deleted products ---
        if payload_json.get("deleted"):
            deleted_ids = payload_json["deleted"]
            logger.info(f"Deleting products with IDs: {deleted_ids}")

            for deleted_id in deleted_ids:
                logger.info(f"Deleting product with ID: {deleted_id}")

                result = supabase_admin.table("product").delete().eq("id", deleted_id).execute()
                if result.error:
                    logger.error(f"Failed to delete product {deleted_id}: {result.error}")
                else:
                    logger.info(f"Deleted product {deleted_id} from Supabase successfully.")

            return {"message": "Products deleted from Supabase successfully"}

        # --- Handle product creation or update ---
        product_data = None
        if payload_json.get("result") and payload_json["result"].get("_type") == "product":
            product_data = payload_json["result"]
        elif payload_json.get("_type") == "product":
            product_data = payload_json

        if product_data:
            # Handle category field safely (string or dict)
            category_value = product_data.get("category")
            if isinstance(category_value, dict):
                category = category_value.get("title")
            elif isinstance(category_value, str):
                category = category_value
            else:
                category = None
            
            incoming_id = product_data.get("_id")
            incoming_id = product_data.get("_id")
            if incoming_id and incoming_id.startswith("drafts."):
                normalized_id = incoming_id[len("drafts."):]
            else:
                normalized_id = incoming_id

            product_to_upsert = {
                "id": normalized_id,
                "name": product_data.get("name"),
                "slug": product_data.get("slug", {}).get("current") if product_data.get("slug") else None,
                "description": product_data.get("description"),
                "price": product_data.get("price"),
                "category": category,
                "imageUrl": product_data.get("imageUrl"),
                "alt": product_data.get("alt"),
                "stock": product_data.get("stock"),
                "isFeatured": product_data.get("isFeatured"),
                "sku": product_data.get("sku"),
            }

            logger.info(f"Upserting product to Supabase: {product_to_upsert}")
            result = supabase_admin.table("product").upsert(product_to_upsert, on_conflict="id").execute()
            

            logger.info(f"Product {product_to_upsert['id']} synced to Supabase successfully.")
            return {"message": "Product synced to Supabase successfully", "product_id": product_to_upsert['id']}

        else:
            logger.info("No product-related action taken on webhook payload.")
            return {"message": "Webhook received, but no product sync action taken."}

    except Exception as exc:
        logger.error(f"Error processing webhook: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error.")
