import logging
from fastapi import Request

logger = logging.getLogger("session_service")

# In-memory store for simplicity (use Redis in production)
_CART_SESSIONS = {}

async def get_cart_session(request: Request):
    session_id = request.client.host
    return _CART_SESSIONS.get(session_id, {"items": []})

async def save_cart_session(request: Request, cart: dict):
    session_id = request.client.host
    _CART_SESSIONS[session_id] = cart
    logger.info(f"Cart saved for {session_id}: {cart}")

async def clear_cart_session(request: Request):
    session_id = request.client.host
    _CART_SESSIONS.pop(session_id, None)
    logger.info(f"Cart cleared for {session_id}")
