from sqlmodel import Field, SQLModel
from datetime import date, datetime, timezone
from typing import Optional, Any, List
from generate_id import generate_base64_uuid
from pydantic import BaseModel
from typing import Dict

# Product Class for Supabase
class Product(SQLModel, table=True):
    id: Optional[str] = Field(default_factory=generate_base64_uuid, primary_key=True)
    name: str
    description: Optional[str] = None
    price: float
    stock: int
    category: Optional[str] = None
    imageUrl: Optional[str] = None
    alt: Optional[str] = None                  # corresponds to alt character varying NULL
    isFeatured: Optional[bool] = None          # corresponds to isFeatured boolean NULL
    sku: Optional[str] = None                   # corresponds to sku character varying NULL

class ProductDisplayAPIModel(BaseModel):
    id: str # Use 'id' for the primary identifier (can be Supabase ID or Sanity _id)
    slug: Optional[str] = None # For SEO-friendly URLs (from Sanity, or map Supabase ID)
    name: str
    price: float
    description: Optional[Any] = None # Can be string (Supabase) or Portable Text (Sanity)
    category: Optional[str] = None
    imageUrl: Optional[str] = None # Standardized image URL field
    alt: Optional[str] = None # Alt text for the image
    stock: Optional[int] = None
    isFeatured: Optional[bool] = False # Only for Sanity-sourced featured products
    sku: Optional[str] = None


class SanityProductAPIModel(BaseModel):
    _id: str # Sanity document ID
    name: str
    slug: str
    price: float
    description: Any # Portable Text from Sanity (can be complex JSON)
    category: Optional[str] = None
    imageUrl: Optional[str] = None # `mainImage.asset->url` from Sanity
    alt: Optional[str] = None # `mainImage.alt` from Sanity
    stock: Optional[int] = None # Sanity doesn't inherently manage stock, but if you fetch it
    isFeatured: Optional[bool] = False # From Sanity
    sku: Optional[str] = None # From Sanity


class DynamicPromo(SQLModel, table=True):
    __tablename__ = "dynamic_promo"
    id: Optional[str] = Field(default_factory=generate_base64_uuid, primary_key=True)
    title: str
    description: Optional[str] = None
    discount: Optional[str] = None       
    valid_until: Optional[date] = None
    imageUrl: Optional[str] = None
    is_active: Optional[bool] = True


class CartItem(SQLModel, table=True):
    user_id: str = Field(primary_key=True)
    product_id: str = Field(primary_key=True)
    name: str
    price: float
    quantity: int
    imageUrl: Optional[str] = Field(default=None, alias="imageUrl")
    slug: Optional[str] = Field(default=None, alias="slug")
    sku: Optional[str] = Field(default=None, alias="sku")
    class Config:
        populate_by_name = True  # allows accepting both camelCase and snake_case

class Order(SQLModel, table=True):
    id: Optional[str] = Field(default_factory=generate_base64_uuid, primary_key=True)
    user_id: str
    shipping_address: str
    total_amount: float
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderItem(SQLModel, table=True):
    id: Optional[str] = Field(default_factory=generate_base64_uuid, primary_key=True)
    order_id: str
    product_id: str
    quantity: int
    price: float

class CheckoutPayload(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    shipping_address: str
    cart_items: Optional[List[CartItem]] = None

# Model for content blocks (similar to HomepageSection but without slug/id requirements)
# Homepage specific section (like the benefits section)
class HomepageSection(BaseModel):
    title: str
    description: Any # Portable Text
    imageUrl: Optional[str] = None
    alt: Optional[str] = None


class ContentBlock(BaseModel):
    _id: str
    title: str
    subtitle: Optional[str] = None
    description: Any # Portable Text
    imageUrl: Optional[str] = None
    alt: Optional[str] = None
    imageLeft: bool
    callToActionText: Optional[str] = None
    callToActionUrl: Optional[str] = None
    order: int

# Model for product categories
class Category(BaseModel): # <<<<< MODIFIED: Added _id
    _id: str # Add _id field for consistency with Sanity documents
    title: str
    slug: str
    description: Any # Portable Text
    imageUrl: Optional[str] = None
    alt: Optional[str] = None
    order: int

# --- New Model for Sanity Webhook Payload ---
class SanityProductData(BaseModel):
    _id: str
    _type: str
    name: str
    slug: Dict[str, str]  # Sanity slugs are objects {current: 'slug-value'}
    description: Optional[str] = None
    price: float
    category: Optional[Dict[str, Any]] = None # Sanity category can be a reference or object
    imageUrl: Optional[str] = None
    alt: Optional[str] = None
    stock: Optional[int] = 0
    isFeatured: Optional[bool] = False
    sku: Optional[str] = None

class SanityWebhookPayload(BaseModel):
    _id: str # Sanity document ID
    _type: str
    result: Optional[SanityProductData] = None # Product data after change
    previous: Optional[SanityProductData] = None # Product data before change (for updates/deletes)
    # Add other fields from Sanity webhook payload if needed, e.g., 'deleted', 'created', 'updated'

