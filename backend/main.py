import logging, asyncio, json, os
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, Depends, HTTPException, Request, Query, Body, Response, status, Header
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel.ext.asyncio.session import AsyncSession
from dotenv import load_dotenv
from database.db import create_db_tables, get_session, supabase_admin
from models.models import (
    DynamicPromo, HomepageSection,
    ContentBlock, Category, CartItem, CheckoutPayload, ProductDisplayAPIModel
)
from services.promo_service import (
    create_dynamic_promo_service, get_dynamic_promos_service
)
from services.homepage_service import (
    get_homepage_section_service, get_content_blocks_service, get_categories_service
)
from services.cart_service import (
    add_to_cart_service, get_cart_service, update_cart_item_quantity_service, remove_from_cart_service
)
from services.order_service import checkout_service, get_orders_service
from services.product_service import get_products_service, get_featured_products_service, get_product_by_slug_service
from utils import verify_sanity_webhook_signature, SignatureValidationError
from config.settings import settings
# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger("main")

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up application.")
    await create_db_tables()
    logger.info("Database tables created successfully.")
    yield
    logger.info("Shutting down the application...")

app = FastAPI(
    lifespan=lifespan,
    title='API for E-commerce application',
    version='1.0.0',
    servers=[{"url": "http://localhost:8000", "description": "Local development server"}]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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

# --- PRODUCT ROUTES ---
@app.get("/products", response_model=List[ProductDisplayAPIModel])
async def get_products(category: Optional[str] = Query(None), sort: str = Query("newest"),
                       minPrice: Optional[float] = None, maxPrice: Optional[float] = None,
                       session: AsyncSession = Depends(get_session)):
    return await get_products_service(category, sort, minPrice, maxPrice, session)

@app.get("/products/featured", response_model=List[ProductDisplayAPIModel])
async def get_featured_products():
    return await get_featured_products_service()

@app.get("/products/{product_slug}", response_model=ProductDisplayAPIModel)
async def get_product(product_slug: str):
    return await get_product_by_slug_service(product_slug)

# --- PROMO ROUTES ---
@app.post("/promos/dynamic", response_model=DynamicPromo)
async def create_dynamic_promo(payload: DynamicPromo):
    return await create_dynamic_promo_service(payload)

@app.get("/promos/dynamic", response_model=List[DynamicPromo])
async def get_dynamic_promos():
    return await get_dynamic_promos_service()

# --- HOMEPAGE + CONTENT ROUTES ---
@app.get("/homepage/sections/{slug}", response_model=HomepageSection)
async def get_homepage_section(slug: str):
    return await get_homepage_section_service(slug)

@app.get("/content-blocks", response_model=List[ContentBlock])
async def get_content_blocks():
    return await get_content_blocks_service()

@app.get("/categories", response_model=List[Category])
async def get_categories():
    return await get_categories_service()

# --- CART ROUTES ---
@app.post("/cart", response_model=CartItem)
async def add_to_cart(payload: CartItem, request: Request, session: AsyncSession = Depends(get_session)):
    return await add_to_cart_service(payload, request, session)

@app.get("/cart", response_model=Dict[str, Any])
async def get_cart(request: Request, session: AsyncSession = Depends(get_session)):
    return await get_cart_service(request, session)

@app.put("/cart/{product_id}", response_model=CartItem)
async def update_cart_item_quantity(request: Request, product_id: str,
                                    payload: dict = Body(...), session: AsyncSession = Depends(get_session)):
    return await update_cart_item_quantity_service(request, product_id, payload, session)

@app.delete("/cart/{product_id}")
async def remove_from_cart(product_id: str, request: Request, session: AsyncSession = Depends(get_session)):
    return await remove_from_cart_service(product_id, request, session)

# --- ORDER ROUTES ---
@app.post("/checkout")
async def checkout(payload: CheckoutPayload, request: Request, session: AsyncSession = Depends(get_session)):
    return await checkout_service(payload, request, session)

@app.get("/orders", response_model=Dict[str, Any])
async def get_orders(request: Request, session: AsyncSession = Depends(get_session)):
    return await get_orders_service(request, session)



# --- SANITY WEBHOOK ENDPOINT FOR PRODUCT SYNC ---
# --- SANITY WEBHOOK DEBUG ENDPOINT ---
@app.post("/webhook/sanity/debug")
async def sanity_webhook_debug(request: Request):
    headers = dict(request.headers)
    body = await request.body()

    logger.info("--- Incoming Headers ---")
    for k, v in headers.items():
        logger.info(f"{k}: {v}")

    logger.info("--- Incoming Body ---")
    try:
        logger.info(body.decode("utf-8"))
    except Exception:
        logger.info(f"Non-text body of length {len(body)} bytes")

    return {
        "received_headers": headers,
        "body_size": len(body),
        "message": "Logged headers and body for debug"
    }


# --- MAIN SANITY WEBHOOK ENDPOINT ---
@app.post("/webhook/sanity")
async def sanity_webhook(
    request: Request,
    sanity_webhook_signature: Optional[str] = Header(None),
):
    logger.info("Received webhook request.")

    body = await request.body()
    logger.info(f"Raw request body length: {len(body)} bytes")

    # --- Validate signature ---
    if not sanity_webhook_signature:
        raise HTTPException(status_code=400, detail="Missing Sanity webhook signature header")
    try:
        verify_sanity_webhook_signature(os.getenv('SANITY_WEBHOOK_SECRET'), body, sanity_webhook_signature)
        logger.info("Webhook signature successfully verified.")
    except SignatureValidationError as e:
        logger.warning(f"Signature validation error: {e}")
        raise HTTPException(status_code=403, detail="Invalid webhook signature")

    # --- Parse JSON payload ---
    try:
        payload_json = json.loads(body)
        logger.info(f"Verified webhook payload: {json.dumps(payload_json, indent=2)}")
    except json.JSONDecodeError:
        logger.error("Invalid JSON payload")
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    try:
        # --- Handle product deletions ---
        if payload_json.get("deleted"):
            deleted_ids = payload_json["deleted"]
            logger.info(f"Deleting products with IDs: {deleted_ids}")

            for deleted_id in deleted_ids:
                result = supabase_admin.table("product").delete().eq("id", deleted_id).execute()
                if getattr(result, "error", None):
                    logger.error(f"Failed to delete product {deleted_id}: {result.error}")
                    raise HTTPException(status_code=500, detail=f"Failed to delete product {deleted_id}")
                logger.info(f"Deleted product {deleted_id} from Supabase successfully.")

            return {"message": "Products deleted from Supabase successfully"}

        # --- Handle product creation or update ---
        product_data = None
        if payload_json.get("result") and payload_json["result"].get("_type") == "product":
            product_data = payload_json["result"]
        elif payload_json.get("_type") == "product":
            product_data = payload_json

        if not product_data:
            logger.info("No product-related action taken on webhook payload.")
            return {"message": "Webhook received, but no product sync action taken."}

        # --- Normalize product ID (handle drafts) ---
        incoming_id = product_data.get("_id")
        normalized_id = incoming_id[len("drafts."):] if incoming_id and incoming_id.startswith("drafts.") else incoming_id

        # --- Handle category field safely ---
        category_value = product_data.get("category")
        if isinstance(category_value, dict):
            category = category_value.get("title")
        elif isinstance(category_value, str):
            category = category_value
        else:
            category = None

        # --- Build product payload ---
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
        if getattr(result, "error", None):
            logger.error(f"Supabase error while upserting product {normalized_id}: {result.error}")
            raise HTTPException(status_code=500, detail="Supabase product sync failed")

        logger.info(f"Product {product_to_upsert['id']} synced to Supabase successfully.")
        return {"message": "Product synced to Supabase successfully", "product_id": product_to_upsert['id']}

    except Exception as exc:
        logger.error(f"Error processing webhook: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

