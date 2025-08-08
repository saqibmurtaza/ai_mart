import logging
from typing import Dict, Any
from models.models import CheckoutPayload

logger = logging.getLogger("payment_service")

async def process_payment(payload: CheckoutPayload, cart: Dict[str, Any]) -> Dict[str, Any]:
    try:
        total = sum(item["quantity"] * item.get("price", 0) for item in cart["items"])
        logger.info(f"Processing payment for total: {total}")
        
        # Simulated payment result
        return {
            "order_id": "ORD12345",
            "amount": total,
            "status": "paid"
        }
    except Exception as e:
        logger.error(f"Payment failed: {e}", exc_info=True)
        raise
