import logging, json, asyncio, os
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, Depends, HTTPException, Request, Header, Body, Query
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from postgrest.exceptions import APIError
from sqlmodel import select
from datetime import datetime, timezone
from database.db import create_db_tables, get_session, supabase_public, supabase_admin
from sqlmodel.ext.asyncio.session import AsyncSession
from services.sanity_service import (
    fetch_static_promos, fetch_homepage_section, fetch_content_blocks,
    fetch_categories, fetch_featured_products, fetch_all_products, fetch_product_by_id, fetch_product_by_slug
)
from models.models import (
    Product, DynamicPromo, CartItem, CheckoutPayload, Order, OrderItem,
    SanityProductAPIModel, HomepageSection, ContentBlock, Category,
    ProductDisplayAPIModel, SanityProductData
)
from utils import (
    SignatureValidationError, verify_sanity_webhook_signature, normalize_product_id,
    get_clerk_sub_from_jwt, get_supabase_client_and_user,
    fetch_product_by_id_async, fetch_products_async,
    fetch_cart_items_async, fetch_orders_for_user_async,
    
)
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from fastapi import Response
import logging
import pytz

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger("main")

load_dotenv()

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

@app.options("/{rest_of_path:path}")
async def preflight_handler():
    return Response(status_code=200)


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
# --- ADD TO CART (SAFE, ASYNC) ---
@app.post("/cart", response_model=CartItem)
async def add_to_cart(
    payload: CartItem,
    request: Request,
    session: AsyncSession = Depends(get_session)
):
    user_id = get_supabase_client_and_user(request)
    product_id = normalize_product_id(payload.product_id)
    # Check product existence
    product = await fetch_product_by_id_async(product_id, session)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product {product_id} not found")

    # Always set the correct user and product IDs
    payload.user_id = user_id
    payload.product_id = product_id

    statement = select(CartItem).where(
        (CartItem.user_id == user_id) & (CartItem.product_id == product_id)
    )
    result = await session.execute(statement)
    existing_item = result.scalar_one_or_none()
    if existing_item:
        existing_item.quantity += payload.quantity
        await session.commit()
        return existing_item

    session.add(payload)
    await session.commit()
    await session.refresh(payload)
    return payload

# --- VIEW CART ---
@app.get("/cart", response_model=Dict[str, Any])
async def get_cart(request: Request, session: AsyncSession = Depends(get_session)):
    user_id = get_supabase_client_and_user(request)
    items = await fetch_cart_items_async(user_id, session)
    return {"message": "Cart retrieved", "cart": items}

# --- UPDATE CART ITEM QUANTITY ---
@app.put("/cart/{product_id}", response_model=CartItem)
async def update_cart_item_quantity(request: Request, product_id: str, payload: dict = Body(...), session: AsyncSession = Depends(get_session)):
    user_id = get_supabase_client_and_user(request)
    quantity = payload.get("quantity")
    if quantity is None or not isinstance(quantity, int) or quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be a positive integer")
    statement = select(CartItem).where(
        (CartItem.user_id == user_id) & (CartItem.product_id == product_id)
    )
    result = await session.execute(statement)
    cart_item = result.scalar_one_or_none()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    cart_item.quantity = quantity
    await session.commit()
    return cart_item

# --- REMOVE FROM CART ---
@app.delete("/cart/{product_id}")
async def remove_from_cart(product_id: str, request: Request, session: AsyncSession = Depends(get_session)):
    user_id = get_supabase_client_and_user(request)
    statement = select(CartItem).where(
        (CartItem.user_id == user_id) & (CartItem.product_id == product_id)
    )
    result = await session.execute(statement)
    cart_item = result.scalar_one_or_none()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    await session.delete(cart_item)
    await session.commit()
    return {"message": "Item removed from cart"}

# --- CHECKOUT ---
@app.post("/checkout")
async def checkout(payload: CheckoutPayload, request: Request, session: AsyncSession = Depends(get_session)):
    user_id = get_supabase_client_and_user(request)
    cart_items = await fetch_cart_items_async(user_id, session)
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    product_ids = [item["product_id"] for item in cart_items]
    fetch_tasks = [fetch_product_by_id_async(pid, session) for pid in product_ids]
    product_details = await asyncio.gather(*fetch_tasks)
    products_data = {str(p["id"]): p for p in product_details if p and "id" in p}
    total_amount = 0.0
    processed_cart_items = []
    for item in cart_items:
        pid = item["product_id"]
        product = products_data.get(pid)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {pid} not found during checkout")
        current_price = float(product["price"])
        total_amount += current_price * item["quantity"]
        processed_cart_items.append({
            "product_id": pid,
            "quantity": item["quantity"],
            "price": current_price
        })
    
    # Create Order
    order = Order(
        user_id=user_id,
        shipping_address=payload.shipping_address,
        total_amount=total_amount,
        status="pending",
        created_at=datetime.now(timezone.utc)
    )
    session.add(order)
    # await session.commit()
    # await session.refresh(order)
    # Add OrderItems
    for item in processed_cart_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item["product_id"],
            quantity=item["quantity"],
            price=item["price"]
        )
        session.add(order_item)

    logger.info(f"created_at = {order.created_at}, tzinfo = {order.created_at.tzinfo}, is_aware = {order.created_at.tzinfo is not None}")
    await session.commit()
    # Clear user's cart
    stmt = select(CartItem).where(CartItem.user_id == user_id)
    res = await session.exec(stmt)
    for i in res.all():
        await session.delete(i)
    await session.commit()
    await session.refresh(order)
    return {"message": "Order placed successfully", "order_id": order.id}



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

SANITY_WEBHOOK_SECRET = os.getenv("SANITY_WEBHOOK_SECRET")
if not SANITY_WEBHOOK_SECRET:
    logger.error("SANITY_WEBHOOK_SECRET environment variable not set. Webhook verification will be skipped.")
    raise ValueError("SANITY_WEBHOOK_SECRET environment variable not set.")

# --- SANITY WEBHOOK ENDPOINT ---
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

