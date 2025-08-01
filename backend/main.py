# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, Query, Request, Header # Added Request, Header
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
import hmac # New Import
import hashlib # New Import
import os # New Import
from utils import SignatureValidationError, verify_sanity_webhook_signature

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


async def fetch_product_by_supabase_id(product_id: str):
    """Fetches a product from the Supabase 'product' table by its ID."""
    result = supabase_public.table("product").select("*").eq("id", product_id).execute()
    if result.data and len(result.data) > 0:
        return result.data[0]
    return None

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
async def add_to_cart(payload: CartItem):
    logger.info(f"Received add-to-cart payload: {payload.model_dump()}")
    logger.info(f"[ADD TO CART] User: {payload.user_id}, Product: {payload.product_id}")

    try:
        # Changed to use product_id (Supabase ID) for fetching from Supabase product table
        product = await fetch_product_by_supabase_id(payload.product_id)
        if not product:
            logger.error(f"Product not found in Supabase for id: {payload.product_id}")
            raise HTTPException(status_code=404, detail=f"Product with ID {payload.product_id} not found in Supabase")

        existing_item_resp = supabase_public.table("cartitem")\
            .select("quantity")\
            .eq("user_id", payload.user_id)\
            .eq("product_id", payload.product_id)\
            .execute()
        logger.info(f"Existing cartitem query result: {existing_item_resp}")

        existing_item_data = existing_item_resp.data

        if existing_item_data:
            current_quantity = existing_item_data[0]["quantity"]
            new_quantity = current_quantity + payload.quantity

            result = supabase_public.table("cartitem").update({"quantity": new_quantity})\
                .eq("user_id", payload.user_id)\
                .eq("product_id", payload.product_id)\
                .execute()
            logger.info(f"Supabase update result: {result}")
        else:
            result = supabase_public.table("cartitem")\
                .upsert(payload.model_dump(by_alias=True))\
                .execute()
            logger.info(f"Supabase upsert result: {result}")

        if result.data:
            logger.info(f"CartItem upserted/updated successfully: {result.data[0]}")
            return CartItem.model_validate(result.data[0], from_attributes=True)

        logger.error(f"Failed to upsert cart item for user_id={payload.user_id}, product_id={payload.product_id}. Supabase response: {result}")
        raise HTTPException(status_code=500, detail="Cart update failed.")
    except Exception as e:
        logger.exception(f"Exception in add_to_cart: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/cart/{user_id}", response_model=Dict[str, Any])
async def get_cart(user_id: str):
    logger.info(f"Fetching cart for user_id={user_id}")

    result = supabase_public.table("cartitem").select("*").eq("user_id", user_id).execute()
    cart_items_data = result.data or []

    enriched_cart_items = []
    for item in cart_items_data:
        # Changed to use Supabase product table for enrichment, not Sanity
        product = await fetch_product_by_supabase_id(item["product_id"])
        enriched_cart_items.append({
            "user_id": item["user_id"],
            "product_id": item["product_id"],
            "quantity": item["quantity"],
            "name": product.get("name") if product else item.get("name", "Unknown Product"),
            "price": product.get("price") if product else item.get("price", 0.0),
            "imageUrl": product.get("imageUrl") if product else None,
            "slug": product.get("slug") if product else None, # Assuming slug is string in Supabase
            "alt": product.get("alt") if product else None,
            "sku": product.get("sku") if product else item.get("sku")
        })

    return {"message": "Cart retrieved", "cart": enriched_cart_items}


@app.delete("/cart/{user_id}/{product_id}")
async def remove_from_cart(user_id: str, product_id: str):
    logger.info(f"Removing from cart: user_id={user_id}, product_id={product_id}")

    result = supabase_admin.table("cartitem").delete().eq("user_id", user_id).eq("product_id", product_id).execute()
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

        await supabase_public.table("orderitem").insert(final_order_items_for_insert).execute()

        if payload.user_id:
            await supabase_public.table("cartitem").delete().eq("user_id", payload.user_id).execute()

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

import time
# Allowed timestamp tolerance in seconds to prevent replay attacks (e.g., 5 minutes)
TIMESTAMP_TOLERANCE = 300

@app.post("/webhook/sanity")
async def sanity_webhook(
    request: Request,
    sanity_webhook_signature: Optional[str] = Header(None),
):
    logger.info("Received webhook request.")

    body = await request.body()

        # --- ADD THESE DEBUG LOGS HERE ---
    logger.info(f"SANITY_WEBHOOK_SECRET being used (first 5 chars): {SANITY_WEBHOOK_SECRET[:5]}...")
    logger.info(f"Received signature header: {sanity_webhook_signature}")
    logger.info(f"Raw request body (decoded): {body.decode('utf-8')}") # Log the decoded body for inspection
    logger.info(f"Raw request body length (bytes): {len(body)}")
    

    try:
        verify_sanity_webhook_signature(SANITY_WEBHOOK_SECRET, body, sanity_webhook_signature)
        logger.info("Webhook signature successfully verified.")
    except SignatureValidationError as sve:
        logger.warning(f"Signature validation error: {sve}")
        raise HTTPException(status_code=403, detail=str(sve))

    try:
        headers = dict(request.headers)
        logger.info(f"Received headers: {headers}")
        logger.info(f"Raw request body length: {len(body)} bytes")

        payload_json = json.loads(body)
        logger.info(f"Verified webhook payload: {json.dumps(payload_json, indent=2)}")

        # Handle deleted event - delete products from Supabase
        if payload_json.get("deleted"):
            for deleted_id in payload_json["deleted"]:
                logger.info(f"Deleting product with _id: {deleted_id}")
                # Make sure to await the result and handle exceptions in production
                await supabase_public.table("product").delete().eq("id", deleted_id).execute()
                logger.info(f"Product {deleted_id} deleted from Supabase.")
            return {"message": "Products deleted from Supabase successfully"}

        # Handle created or updated 'product' documents
        elif payload_json.get("result") and payload_json["result"].get("_type") == "product":
            sanity_product_data = SanityProductData(**payload_json["result"])

            product_to_upsert = {
                "id": sanity_product_data._id,
                "name": sanity_product_data.name,
                "slug": sanity_product_data.slug.get("current") if sanity_product_data.slug else None,
                "description": sanity_product_data.description,
                "price": sanity_product_data.price,
                "category": sanity_product_data.category.get("title") if sanity_product_data.category else None,
                "imageUrl": sanity_product_data.imageUrl,
                "alt": sanity_product_data.alt,
                "stock": sanity_product_data.stock,
                "isFeatured": sanity_product_data.isFeatured,
                "sku": sanity_product_data.sku,
            }

            logger.info(f"Upserting product to Supabase: {product_to_upsert}")
            result = await supabase_public.table("product").upsert(product_to_upsert, on_conflict="id").execute()
            logger.info(f"Supabase upsert result data: {result.data}")
            logger.info(f"Supabase upsert result error: {result.error}")

            if result.error:
                logger.error(f"Supabase error occurred: {result.error}")
                raise HTTPException(status_code=500, detail=f"Failed to sync product to Supabase: {result.error}")

            if not result.data:
                logger.error("Supabase upsert returned no data and no error.")
                raise HTTPException(status_code=500, detail="Failed to sync product to Supabase with unknown error")

            logger.info(f"Product {sanity_product_data._id} synced to Supabase successfully.")
            return {"message": "Product synced to Supabase successfully", "product_id": sanity_product_data._id}

        else:
            logger.info("No product-related action taken on webhook payload.")
            return {"message": "Webhook received, but no product sync action taken."}

    except json.JSONDecodeError:
        logger.error("Invalid JSON payload received.")
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    except Exception as e:
        logger.error(f"Error processing webhook: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")



