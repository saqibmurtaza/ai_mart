# import uuid

# def generate_id():
#     """
#     Generate a unique identifier using UUID4.
    
#     Returns:
#         str: A string representation of the generated UUID.
#     """
#     return str(uuid.uuid4())

import uuid
import base64
# Encode a UUID in Base64 to shorten it from 36 to about 22 characters
# Shorter, URL-safe

def generate_base64_uuid() -> str:
    u = uuid.uuid4()
    b64 = base64.urlsafe_b64encode(u.bytes).rstrip(b'=').decode('ascii')
    return b64

print(generate_base64_uuid())  # e.g., "e6vK1nGqR7qQ9XJv0a5X4Q"
