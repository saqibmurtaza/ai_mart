import hmac
import hashlib
import base64
import time
import requests

secret = b"I_am_Saqib"  # Your webhook secret as bytes
payload = b'{"_id":"drafts.test","_type":"product","name":"Test Product"}'
timestamp = str(int(time.time() * 1000))  # Current time in ms

signed_payload = f"{timestamp}.".encode() + payload

signature = base64.urlsafe_b64encode(hmac.new(secret, signed_payload, hashlib.sha256).digest()).rstrip(b"=").decode()

signature_header = f"t={timestamp},v1={signature}"

response = requests.post(
    "https://a7ac2b9d2ba8.ngrok-free.app/webhook/sanity",
    data=payload,
    headers={"sanity-webhook-signature": signature_header, "Content-Type": "application/json"}
)

print(f"Response Code: {response.status_code}")
print(f"Response Body: {response.text}")
