import hmac
import hashlib
import time
import base64
import logging
from typing import Optional
from fastapi import Request, HTTPException
from supabase import create_client, Client
from jose import jwt as jose_jwt, JWTError
from config.settings import settings
from dotenv import load_dotenv
import os

# --- Set your project secrets/config here ---
supabase_url= os.getenv('NEXT_PUBLIC_SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_SECRET_KEY')  
supabase_public = create_client(supabase_url, supabase_key)

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


# --- Clerk JWT decoding ---
def get_clerk_sub_from_jwt(token: str) -> str:
    """
    Extract the Clerk 'sub' (user_id) from a JWT.
    In production you should verify the JWT signature against Clerk's JWKS.
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
    Returns a supabase client (with service role key) and the authenticated user's Clerk ID (from JWT).
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    jwt_token = auth_header.split(" ")[1]
    user_id = get_clerk_sub_from_jwt(jwt_token)
    supabase = create_client(supabase_url, supabase_key)
    return supabase, user_id


def get_supabase_client(request: Request):
    """
    Legacy API: only returns supabase client, not user id (not recommended for per-user logic).
    """
    supabase, _ = get_supabase_client_and_user(request)
    return supabase


def fetch_product_by_supabase_id(product_id: str, supabase_client=None):
    """
    Synchronously fetch a product from Supabase by its ID.
    Do NOT make this async unless you use the async supabase client!
    """
    client = supabase_client or supabase_public
    result = client.table("product").select("*").eq("id", product_id).execute()
    if result.data and len(result.data) > 0:
        return result.data[0]
    return None
