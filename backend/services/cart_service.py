import logging
from typing import Dict, Any
from fastapi import HTTPException, Request
from sqlmodel.ext.asyncio.session import AsyncSession
from models.models import CartItem
from services.session_service import get_cart_session, save_cart_session

logger = logging.getLogger("cart_service")

async def add_to_cart_service(payload: CartItem, request: Request, session: AsyncSession) -> CartItem:
    try:
        cart = await get_cart_session(request)
        cart_items = cart.get("items", [])
        existing = next((item for item in cart_items if item["product_id"] == payload.product_id), None)

        if existing:
            existing["quantity"] += payload.quantity
        else:
            cart_items.append(payload.dict())

        cart["items"] = cart_items
        await save_cart_session(request, cart)
        return payload
    except Exception as e:
        logger.error(f"Error adding to cart: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to add item to cart")

async def get_cart_service(request: Request, session: AsyncSession) -> Dict[str, Any]:
    try:
        return await get_cart_session(request)
    except Exception as e:
        logger.error(f"Error fetching cart: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch cart")

async def update_cart_item_quantity_service(request: Request, product_id: str, payload: dict, session: AsyncSession) -> CartItem:
    try:
        cart = await get_cart_session(request)
        cart_items = cart.get("items", [])

        for item in cart_items:
            if item["product_id"] == product_id:
                item["quantity"] = payload.get("quantity", item["quantity"])
                await save_cart_session(request, cart)
                return CartItem(**item)

        raise HTTPException(status_code=404, detail="Product not in cart")
    except Exception as e:
        logger.error(f"Error updating cart item {product_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to update cart item")

async def remove_from_cart_service(product_id: str, request: Request, session: AsyncSession) -> Dict[str, Any]:
    try:
        cart = await get_cart_session(request)
        cart["items"] = [item for item in cart.get("items", []) if item["product_id"] != product_id]
        await save_cart_session(request, cart)
        return {"message": f"Product {product_id} removed from cart"}
    except Exception as e:
        logger.error(f"Error removing product {product_id} from cart: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to remove product from cart")
