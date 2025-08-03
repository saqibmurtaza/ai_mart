import hmac
import hashlib
import time
import base64
import logging
from typing import Optional
from fastapi import Request, HTTPException
from supabase import create_client, Client
from database.db import supabase_url, supabase_key, supabase_public

logger = logging.getLogger("main")


class SignatureValidationError(Exception):
    """Raised on webhook signature verification failure."""


def verify_sanity_webhook_signature(
    secret: str,
    body: bytes,
    signature_header: Optional[str],
    tolerance_seconds: int = 300,
) -> None:
    """
    Verify Sanity webhook signature with timestamp freshness.

    Raises SignatureValidationError on failure.
    """
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

    # Signed payload is: "<timestamp>.<body>"
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


# Function to get Supabase client with JWT from request

def get_supabase_client(request: Request) -> Client:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        print("DEBUG: No or invalid Authorization header")
        raise HTTPException(status_code=401, detail="Unauthorized")
    jwt = auth_header.split(" ")[1]
    print(f"DEBUG: Extracted JWT: {jwt[:10]}...")  # Don't log full token
    return create_client(supabase_url, supabase_key, headers={"Authorization": f"Bearer {jwt}"})


# Function to fetch product by ID from Supabase

async def fetch_product_by_supabase_id(product_id: str, supabase_client=None):
    """Fetch a product from Supabase by its ID, using the right client."""
    client = supabase_client or supabase_public

    # If your .execute() method is awaitable, use await; else leave as sync.
    # Example for async-supabase client:
    result = await client.table("product").select("*").eq("id", product_id).execute()
    # If your client is not awaitable, just: result = client.table(...).execute()

    if result.data and len(result.data) > 0:
        return result.data[0]
    return None
