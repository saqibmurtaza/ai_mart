import logging
from typing import Dict, Any
from fastapi import HTTPException, Request
from sqlmodel.ext.asyncio.session import AsyncSession
from models.models import CheckoutPayload, Order
from services.session_service import get_cart_session, clear_cart_session
from services.payment_service import process_payment

logger = logging.getLogger("order_service")

async def checkout_service(payload: CheckoutPayload, request: Request, session: AsyncSession) -> Dict[str, Any]:
    try:
        cart = await get_cart_session(request)
        if not cart.get("items"):
            raise HTTPException(status_code=400, detail="Cart is empty")

        # Process payment
        payment_result = await process_payment(payload, cart)

        # Create order (simplified for now)
        order = Order(
            id=payment_result.get("order_id"),
            items=cart["items"],
            total_amount=payment_result.get("amount"),
            status="completed"
        )

        await clear_cart_session(request)
        return {"message": "Checkout successful", "order": order.dict()}
    except Exception as e:
        logger.error(f"Error during checkout: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Checkout failed")

async def get_orders_service(request: Request, session: AsyncSession) -> Dict[str, Any]:
    try:
        # Stub: Replace with DB fetch when real order history is stored
        return {"orders": []}
    except Exception as e:
        logger.error(f"Error fetching orders: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch orders")
