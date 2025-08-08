import logging
from typing import List
from fastapi import HTTPException, Depends
from sqlmodel import Session, select
from models.models import DynamicPromo
from database.db import get_session  # assumes you have db.py with get_session
from datetime import date

logger = logging.getLogger("promo_service")


async def create_dynamic_promo_service(
    payload: DynamicPromo, session: Session = Depends(get_session)
) -> DynamicPromo:
    try:
        session.add(payload)
        session.commit()
        session.refresh(payload)
        return payload
    except Exception as e:
        logger.error(f"Error creating dynamic promo: {e}", exc_info=True)
        session.rollback()
        raise HTTPException(status_code=500, detail="Failed to create promo")


async def get_dynamic_promos_service(
    session: Session = Depends(get_session)
) -> List[DynamicPromo]:
    try:
        statement = select(DynamicPromo).where(
            DynamicPromo.is_active == True,
            (DynamicPromo.valid_until == None) | (DynamicPromo.valid_until >= date.today())
        )
        results = session.exec(statement).all()
        return results
    except Exception as e:
        logger.error(f"Error fetching dynamic promos: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch promos")
