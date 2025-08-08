# services/user_service.py
from fastapi import Request, HTTPException, status
from utils import get_supabase_client_and_user

async def get_current_user(request: Request):
    user_id = await get_supabase_client_and_user(request)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing authentication token"
        )
    return user_id
