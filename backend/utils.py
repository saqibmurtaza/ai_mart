import hmac
import hashlib
import time
import base64
import logging
from typing import Optional, List, Dict, Any
from fastapi import Request, HTTPException
from jose import jwt as jose_jwt, JWTError

# --- Logger ---
logger = logging.getLogger("main")

# --- Signature validation for webhooks ---
class SignatureValidationError(Exception):
    """Raised on webhook signature verification failure."""

def verify_sanity_webhook_signature(
    secret: str,
    body: bytes,
    signature_header: Optional[str],
    tolerance_seconds: int = 300,
) -> None:
    if not signature_header:
        logger.error("Missing signature header")
        raise SignatureValidationError("Signature header is missing")
    logger.info(f"Signature header received: {signature_header}")
    parts = signature_header.split(",")
    sig_dict = {}
    for part in parts:
        if "=" not in part:
            continue
        k, v = part.split("=", 1)
        sig_dict[k.strip()] = v.strip()
    timestamp_str = sig_dict.get("t")
    received_signature = sig_dict.get("v1")
    if not timestamp_str or not received_signature:
        logger.error(f"Invalid signature header format: {signature_header}")
        raise SignatureValidationError("Invalid signature header format")
    timestamp = int(timestamp_str) / 1000  # ms -> s
    now = time.time()
    if abs(now - timestamp) > tolerance_seconds:
        logger.error(
            f"Webhook timestamp outside allowable range: {timestamp} vs {now}"
        )
        raise SignatureValidationError("Webhook timestamp outside allowable range")
    signed_payload = f"{timestamp_str}.".encode("utf-8") + body
    computed_hmac = hmac.new(secret.encode("utf-8"), signed_payload, hashlib.sha256).digest()
    computed_signature = base64.urlsafe_b64encode(computed_hmac).rstrip(b"=").decode("utf-8")
    logger.info(f"Computed signature: {computed_signature}")
    logger.info(f"Provided signature: {received_signature}")
    if not hmac.compare_digest(computed_signature, received_signature):
        raise SignatureValidationError("Signature mismatch")

def normalize_product_id(product_id: str) -> str:
    if product_id.startswith("drafts."):
        return product_id[len("drafts."):]
    return product_id

# --- Clerk JWT decoding and user extraction ---
def get_clerk_sub_from_jwt(token: str) -> str:
    """
    Extract the Clerk 'sub' (user_id) from a JWT.
    For real production you should verify the JWT signature against Clerk's JWKS.
    Here, for dev, we only decode.
    """
    try:
        decoded = jose_jwt.get_unverified_claims(token)
        sub = decoded.get("sub")
        if not sub:
            raise HTTPException(status_code=401, detail="Token missing sub claim")
        return sub
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid auth token")

def get_supabase_client_and_user(request: Request):
    """
    Returns the authenticated user's Clerk ID (from JWT) for DB scoping.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    jwt_token = auth_header.split(" ")[1]
    user_id = get_clerk_sub_from_jwt(jwt_token)
    return user_id

### --- NEW ASYNC DB HELPERS FOR SQLModel ----
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.future import select
from models.models import Product, CartItem, Order, OrderItem

async def fetch_product_by_id_async(product_id: str, session: AsyncSession) -> Optional[dict]:
    result = await session.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    return product.dict() if product else None

async def fetch_products_async(session: AsyncSession) -> List[dict]:
    result = await session.execute(select(Product))
    return [row.dict() for row in result.scalars().all()]

async def fetch_cart_items_async(user_id: str, session: AsyncSession) -> List[dict]:
    result = await session.execute(select(CartItem).where(CartItem.user_id == user_id))
    return [row.dict() for row in result.scalars().all()]

async def fetch_order_by_id_async(order_id: str, session: AsyncSession) -> Optional[dict]:
    result = await session.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    return order.dict() if order else None

async def fetch_orders_for_user_async(user_id: str, session: AsyncSession) -> List[dict]:
    result = await session.execute(select(Order).where(Order.user_id == user_id))
    return [row.dict() for row in result.scalars().all()]
