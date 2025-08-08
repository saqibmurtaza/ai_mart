import logging
from typing import List, Optional
from fastapi import HTTPException, Query
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from models.models import Product, ProductDisplayAPIModel
from services.sanity_service import fetch_featured_products, fetch_product_by_slug

logger = logging.getLogger("product_service")

async def get_products_service(category: Optional[str], sort: str,
                               minPrice: Optional[float], maxPrice: Optional[float],
                               session: AsyncSession) -> List[ProductDisplayAPIModel]:
    logger.info(f"Fetching products: category={category}, sort={sort}, minPrice={minPrice}, maxPrice={maxPrice}")
    stmt = select(Product)
    if category:
        stmt = stmt.where(Product.category_slug == category)
    if minPrice is not None:
        stmt = stmt.where(Product.price >= minPrice)
    if maxPrice is not None:
        stmt = stmt.where(Product.price <= maxPrice)
    # Sorting
    if sort == "price-asc":
        stmt = stmt.order_by(Product.price.asc())
    elif sort == "price-desc":
        stmt = stmt.order_by(Product.price.desc())
    elif sort == "name-asc":
        stmt = stmt.order_by(Product.name.asc())
    elif sort == "name-desc":
        stmt = stmt.order_by(Product.name.desc())
    else:
        stmt = stmt.order_by(Product.id.desc())
    res = await session.exec(stmt)
    raw_products = res.all()
    return [ProductDisplayAPIModel(**p.dict()) for p in raw_products]

async def get_featured_products_service():
    try:
        raw_products = await fetch_featured_products()
        return [ProductDisplayAPIModel(
            id=p.get('_id'),
            slug=p.get('slug', {}).get('current') if isinstance(p.get('slug'), dict) else p.get('slug'),
            name=p.get('name'),
            price=p.get('price'),
            description=p.get('description'),
            category=p.get('category'),
            imageUrl=p.get('imageUrl'),
            alt=p.get('alt'),
            stock=p.get('stock'),
            isFeatured=p.get('isFeatured', False),
            sku=p.get('sku')
        ) for p in raw_products] if raw_products else []
    except Exception as e:
        logger.error(f"Error fetching featured products: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch featured products")

async def get_product_by_slug_service(product_slug: str):
    if not product_slug or product_slug.lower() == "null":
        raise HTTPException(status_code=400, detail="Invalid product slug")
    try:
        raw_product = await fetch_product_by_slug(product_slug)
        if not raw_product:
            raise HTTPException(status_code=404, detail="Product not found")
        return ProductDisplayAPIModel(
            id=raw_product.get('_id'),
            slug=raw_product.get('slug', {}).get('current'),
            name=raw_product.get('name'),
            price=raw_product.get('price'),
            description=raw_product.get('description'),
            category=raw_product.get('category', {}).get('title'),
            imageUrl=raw_product.get('imageUrl'),
            alt=raw_product.get('alt'),
            stock=raw_product.get('stock'),
            isFeatured=raw_product.get('isFeatured', False),
            sku=raw_product.get('sku')
        )
    except Exception as e:
        logger.error(f"Error fetching product {product_slug}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch product")
