import hmac
import hashlib
import time

class SignatureValidationError(Exception):
    """Custom exception for webhook signature verification failures."""
    pass

def verify_sanity_webhook_signature(secret: str, body: bytes, signature_header: str, tolerance_seconds: int = 300) -> None:
    """
    Verify Sanity webhook signature and timestamp freshness.

    Raises:
        SignatureValidationError if validation fails.
    """
    if not signature_header:
        raise SignatureValidationError("Signature header is missing")

    # Parse the signature header in form: "t=timestamp,v1=signature"
    parts = signature_header.split(',')
    sig_dict = {}
    for part in parts:
        if '=' not in part:
            continue
        k, v = part.split('=', 1)
        sig_dict[k.strip()] = v.strip()

    timestamp_str = sig_dict.get('t')
    received_signature = sig_dict.get('v1')

    if not timestamp_str or not received_signature:
        raise SignatureValidationError("Invalid signature header format")

    # Validate timestamp freshness
    timestamp = int(timestamp_str) / 1000  # convert ms to seconds
    now = time.time()
    if abs(now - timestamp) > tolerance_seconds:
        raise SignatureValidationError("Webhook timestamp outside allowable range")

    # Compute HMAC-SHA256(secret, "<timestamp>.<body>")
    signed_payload = f"{timestamp_str}.{body.decode('utf-8')}".encode('utf-8')
    computed_signature = hmac.new(secret.encode('utf-8'), signed_payload, hashlib.sha256).hexdigest()

    # Securely compare signatures
    if not hmac.compare_digest(computed_signature, received_signature):
        raise SignatureValidationError("Signature mismatch")
