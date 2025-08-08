import hmac
import hashlib
import time
import base64
import logging
from typing import Optional, List, Dict, Any

from fastapi import Request, HTTPException
from jose import jwt as jose_jwt, JWTError
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.future import select
from models.models import Product, CartItem, Order, OrderItem

# --- Logger ---
logger = logging.getLogger("main")
# --- Signature validation for Sanity webhook ---
class SignatureValidationError(Exception):
    """Raised on webhook signature verification failure."""

def verify_sanity_webhook_signature(
    secret: str,
    body: bytes,
    signature_header: Optional[str],
    tolerance_seconds: int = 300,
) -> None:
    if not signature_header:
        raise SignatureValidationError("Signature header is missing")

    sig_dict = dict(
        part.split("=", 1) for part in signature_header.split(",") if "=" in part
    )
    timestamp_str = sig_dict.get("t")
    received_signature = sig_dict.get("v1")

    if not timestamp_str or not received_signature:
        raise SignatureValidationError("Invalid signature header format")

    timestamp = int(timestamp_str) / 1000
    if abs(time.time() - timestamp) > tolerance_seconds:
        raise SignatureValidationError("Webhook timestamp outside allowable range")

    signed_payload = f"{timestamp_str}.".encode() + body
    computed_hmac = hmac.new(secret.encode(), signed_payload, hashlib.sha256).digest()
    computed_signature = (
        base64.urlsafe_b64encode(computed_hmac).rstrip(b"=").decode()
    )

    if not hmac.compare_digest(computed_signature, received_signature):
        raise SignatureValidationError("Signature mismatch")


# --- SQLModel helpers (return models, not dicts) ---
async def fetch_product_by_id_async(product_id: str, session: AsyncSession) -> Optional[Product]:
    result = await session.execute(select(Product).where(Product.id == product_id))
    return result.scalar_one_or_none()

async def fetch_products_async(session: AsyncSession) -> List[Product]:
    result = await session.execute(select(Product))
    return result.scalars().all()
