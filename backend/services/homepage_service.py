import logging
from typing import List
from fastapi import HTTPException
from models.models import HomepageSection, ContentBlock, Category
from services.sanity_service import fetch_homepage_section, fetch_content_blocks, fetch_categories

logger = logging.getLogger("homepage_service")

async def get_homepage_section_service(slug: str) -> HomepageSection:
    try:
        raw_section = await fetch_homepage_section(slug)
        if not raw_section:
            raise HTTPException(status_code=404, detail="Homepage section not found")
        return HomepageSection(**raw_section)
    except Exception as e:
        logger.error(f"Error fetching homepage section {slug}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch homepage section")

async def get_content_blocks_service() -> List[ContentBlock]:
    try:
        raw_blocks = await fetch_content_blocks()
        return [ContentBlock(**b) for b in raw_blocks] if raw_blocks else []
    except Exception as e:
        logger.error(f"Error fetching content blocks: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch content blocks")

async def get_categories_service() -> List[Category]:
    try:
        raw_categories = await fetch_categories()
        return [Category(**c) for c in raw_categories] if raw_categories else []
    except Exception as e:
        logger.error(f"Error fetching categories: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch categories")
