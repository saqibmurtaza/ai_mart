# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, Query
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from backend.db import create_db_tables, get_session, supabase_admin, supabase_public
from backend.sanity_client import fetch_static_promos, fetch_homepage_section, fetch_content_blocks, fetch_categories, fetch_featured_products
from backend.supabase_client import fetch_dynamic_promos
from backend.models import Product, DynamicPromo, CartItem, CheckoutPayload, Order, OrderItem, SanityProductAPIModel, HomepageSection, ContentBlock, Category, ProductDisplayAPIModel
import logging, json, asyncio
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

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

# --- PRODUCT ENDPOINTS  ---
@app.post("/products", response_model=Product)
async def create_product(
    payload: Product
):

    result = await asyncio.to_thread(
        # Use model_validate to parse the dictionary from the DB response
        lambda: supabase_public.table('product').insert(payload.model_dump()).execute()
        )
    return Product.model_validate(result.data[0])    
        
@app.get("/products", response_model=List[ProductDisplayAPIModel])
async def get_products(
    category: Optional[str] = Query(None, description="Filter products by category")
):
    sync_call = lambda: supabase_public.table('product').select('*').execute()
     # Run the synchronous call in a background thread
    result = await asyncio.to_thread(sync_call)
    supabase_products = result.data # result.data contains the list of dicts

    # TRANSFORM SUPABASE PRODUCTS TO UNIFIED MODEL
    transformed_products = []
    for p in supabase_products:
        transformed_products.append(ProductDisplayAPIModel(
            id=p.get('id'), # Use .get() for safety
            slug=p.get('id'), # Using Supabase ID as slug for now, can be improved later
            name=p.get('name'),
            price=p.get('price'),
            description=p.get('description'),
            category=p.get('category'),
            imageUrl=p.get('image_url'), # Map image_url to imageUrl
            alt=p.get('name'),
            stock=p.get('stock'),
            isFeatured=False,
            sku=p.get('id')
        ))
    return transformed_products

# <<<<< NEW ENDPOINT FOR FEATURED PRODUCTS >>>>>
# MODIFIED: Use the new SanityProductAPIModel for this endpoint

@app.get("/products/featured", response_model=List[ProductDisplayAPIModel])
async def get_featured_products_endpoint():
    """
    Fetches featured products from Sanity CMS and transforms the data to match the response model.
    """
    # This helper function call is correct from the previous step
    raw_products = await fetch_featured_products()

    if not raw_products:
        return []

    # --- FIX IS HERE ---
    # Sanity returns slug as {"_type": "slug", "current": "the-actual-slug"}.
    # We need to flatten this to just "the-actual-slug" for our Pydantic model.
    # We also handle the case where a product might not have a slug.
    transformed_products = []
    for product in raw_products:
        # Sanity product's slug is an object { current: 'slug-value' }
        slug_value = product.get('slug', {}).get('current') if isinstance(product.get('slug'), dict) else None
        
        transformed_products.append(ProductDisplayAPIModel(
            id=product.get('_id'), # Sanity's _id becomes the unified 'id'
            slug=slug_value,
            name=product.get('name'),
            price=product.get('price'),
            description=product.get('description'), # Portable Text can be 'Any'
            category=product.get('category'),
            imageUrl=product.get('imageUrl'),
            alt=product.get('alt'),
            stock=product.get('stock'),
            isFeatured=product.get('isFeatured', False),
            sku=product.get('sku')
        ))
    return transformed_products

@app.get("/products/{product_id}", response_model=ProductDisplayAPIModel)
async def get_product(product_id: str):
    """
    Retrieves a single product by its ID from the Supabase database.
    """
    # Define the synchronous Supabase call to fetch a single record.
    sync_call = lambda: supabase_public.table('product').select('*').eq('id', product_id).execute()
    
    # Run the blocking DB call in a background thread.
    result = await asyncio.to_thread(sync_call)
    product = result.data[0] # Get the single product data dict

    # TRANSFORM SINGLE SUPABASE PRODUCT TO UNIFIED MODEL
    return ProductDisplayAPIModel(
        id=product.get('id'),
        slug=product.get('id'),
        name=product.get('name'),
        price=product.get('price'),
        description=product.get('description'),
        category=product.get('category'),
        imageUrl=product.get('image_url'),
        alt=product.get('name'),
        stock=product.get('stock'),
        isFeatured=False,
        sku=product.get('id')
    )

# --- PROMO ENDPOINTS (existing) ---
@app.post("/promos/dynamic", response_model=DynamicPromo)
async def create_dynamic_promo(
    payload: DynamicPromo
):
    try:
        response = await supabase_public.table('dynamic_promo').insert(payload.model_dump()).execute()
        if response.data:
            return DynamicPromo.model_validate(response.data[0], from_attributes=True)
        raise HTTPException(status_code=500, detail="Failed to insert dynamic promo.")
    except Exception as e:
        logger.error(f"Error creating dynamic promo: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/promos/dynamic", response_model=List[DynamicPromo])
async def get_dynamic_promos():
    response = await supabase_public.table('dynamic_promo').select('*').execute()
    if response.error:
        logger.error(f"Error fetching dynamic promos: {response.error}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to retrieve dynamic promos: {response.error.message}")
    return [DynamicPromo.model_validate(item, from_attributes=True) for item in response.data]

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
        result = await supabase_public.table("cartitem").upsert(payload.model_dump()).execute()
        if result.data:
            return CartItem.model_validate(result.data[0], from_attributes=True)
        raise HTTPException(status_code=500, detail="Failed to add item to cart.")
    except Exception as e:
        logger.error(f"Error adding to cart: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=f"Failed to add item to cart: {str(e)}")

@app.get("/cart/{user_id}", response_model=Dict[str, Any])
async def get_cart(user_id: str):
    try:
        result = await supabase_public.table("cartitem").select("*").eq("user_id", user_id).execute()
        if result.error:
            logger.error(f"Error fetching cart: {result.error}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Failed to retrieve cart: {result.error.message}")
        
        return {"message": "Cart retrieved", "cart": result.data}
    except Exception as e:
        logger.error(f"Error getting cart: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to retrieve cart: {str(e)}")

@app.delete("/cart/{user_id}/{product_id}")
async def remove_from_cart(user_id: str, product_id: str):
    try:
        result = await supabase_admin.table("cartitem").delete().eq("user_id", user_id).eq("product_id", product_id).execute()
        if result.error:
            logger.error(f"Error removing from cart: {result.error}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Failed to remove item: {result.error.message}")
        return {"message": "Item removed from cart", "data": result.data}
    except Exception as e:
        logger.error(f"Error removing from cart: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))

# --- CHECKOUT ENDPOINTS (existing) ---
@app.post("/checkout")
async def checkout(payload: CheckoutPayload):
    try:
        cart_resp = await supabase_public.table("cartitem").select("product_id, quantity").eq("user_id", payload.user_id).execute()
        cart_items_data = cart_resp.data

        if not cart_items_data:
            raise HTTPException(status_code=400, detail="Cart is empty")

        product_ids_in_cart = [item["product_id"] for item in cart_items_data]

        products_resp = await supabase_public.table("product").select("id, price").in_("id", product_ids_in_cart).execute()
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

        order_resp = await supabase_public.table("order").insert(order_dict_for_insert).execute()
        
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

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error during checkout: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to process checkout: {str(e)}")

# ----ORDER ENDPOINTS (existing) ---
@app.get("/orders/{user_id}", response_model=Dict[str, Any])
async def get_orders(user_id: str):
    try:
        result = await supabase_public.table("order").select("*, orderitem(*)").eq("user_id", user_id).order("created_at", desc=True).execute()
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

    except Exception as e:
        logger.error(f"ERROR: Failed to fetch orders for user {user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to retrieve orders: {str(e)}")
