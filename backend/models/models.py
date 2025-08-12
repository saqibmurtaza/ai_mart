from sqlmodel import Field, SQLModel
from datetime import date, datetime, timezone
from typing import Optional, Any, List
from generate_id import generate_base64_uuid
from pydantic import BaseModel
from typing import Dict
from uuid import UUID, uuid4
from sqlalchemy import Column, TIMESTAMP

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
    sku: Optional[str] = None
    slug: Optional[str] = None                 # corresponds to sku character varying NULL

# class CategoryData(BaseModel):
#     slug: Optional[str]
#     title: Optional[str]

# class ProductDisplayAPIModel(BaseModel):
#     id: str # Use 'id' for the primary identifier (can be Supabase ID or Sanity _id)
#     slug: Optional[str] = None # For SEO-friendly URLs (from Sanity, or map Supabase ID)
#     name: str
#     price: float
#     description: Optional[Any] = None # Can be string (Supabase) or Portable Text (Sanity)
#     category: Optional[CategoryData]
#     imageUrl: Optional[str] = None # Standardized image URL field
#     alt: Optional[str] = None # Alt text for the image
#     stock: Optional[int] = None
#     isFeatured: Optional[bool] = False # Only for Sanity-sourced featured products
#     sku: Optional[str] = None


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
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    payment_order_id: Optional[str] = Field(default=None, index=True)  # NEW: link PayPal & DB
    user_id: str
    shipping_address: str
    total_amount: float
    status: str = Field(default="pending")
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False)
    )

class OrderItem(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    order_id: UUID
    product_id: str
    quantity: int
    price: float

#Pydantic API Response Models
class OrderItemResponse(BaseModel):
    product_id: str
    quantity: int
    price: float
    name: str = "Product Name"  # placeholder, can be fetched from Product table
    imageUrl: Optional[str] = None

class OrderDetailsResponse(BaseModel):
    id: UUID
    payment_order_id: Optional[str] = None
    user_id: str
    shipping_address: str
    total_amount: float
    status: str
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        orm_mode = True


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

# imports at top of file
from typing import Optional, Union, List, Any
from pydantic import BaseModel, field_validator, model_validator

class CategoryData(BaseModel):
    slug: Optional[str] = None
    title: Optional[str] = None

class ProductDisplayAPIModel(BaseModel):
    id: str
    slug: Optional[str] = None
    name: str
    price: float
    description: Optional[Any] = None
    # Accept a dict, a string, or even a list of dicts/strings; we normalize below
    category: Optional[Union[CategoryData, str, List[Union[CategoryData, str]]]] = None
    imageUrl: Optional[str] = None
    alt: Optional[str] = None
    stock: Optional[int] = None
    isFeatured: Optional[bool] = False
    sku: Optional[str] = None

    @model_validator(mode='before')
    def normalize_category(cls, values):
        cat = values.get('category')
        # Already normalized
        if isinstance(cat, CategoryData) or cat is None:
            return values

        # If backend supplied an array of categories, prefer first
        if isinstance(cat, list):
            first = cat[0] if cat else None
            if isinstance(first, dict):
                values['category'] = CategoryData(**{
                    'title': first.get('title'),
                    'slug': (first.get('slug') or (first.get('slug', {}) or {})).get('current') if isinstance(first.get('slug'), dict) else first.get('slug')
                })
                return values
            if isinstance(first, str):
                values['category'] = CategoryData(title=first)
                return values
            values['category'] = None
            return values

        # If backend supplied a dict
        if isinstance(cat, dict):
            values['category'] = CategoryData(**{
                'title': cat.get('title'),
                'slug': (cat.get('slug') or (cat.get('slug', {}) or {})).get('current') if isinstance(cat.get('slug'), dict) else cat.get('slug')
            })
            return values

        # If backend supplied a plain string
        if isinstance(cat, str):
            values['category'] = CategoryData(title=cat)
            return values

        # Unknown shape -> drop it
        values['category'] = None
        return values

class PayPalWebhookRequest(BaseModel):
    id: str
    event_type: str
    resource: dict
