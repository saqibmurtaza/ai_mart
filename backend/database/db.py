import os
from supabase import Client, create_client
from config.settings import settings
# REMOVE import psycopg2 # No longer needed
# MODIFIED: Import AsyncSession and create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import SQLModel, create_engine # Keep create_engine for now, but will transition
from sqlalchemy.ext.asyncio import create_async_engine # <<<<< IMPORTANT: New import
from sqlalchemy.orm import sessionmaker # Needed for async sessionmaker

# Initialize Supabase clients (these are fine as they are meant to be async with httpx)
supabase_public: Client = create_client(settings.NEXT_PUBLIC_SUPABASE_URL, settings.NEXT_PUBLIC_SUPABASE_ANON_KEY)
supabase_admin: Client = create_client(settings.NEXT_PUBLIC_SUPABASE_URL, settings.SUPABASE_SECRET_KEY)


# MODIFIED: Use create_async_engine for asynchronous database operations
connection_string = str(settings.DATABASE_URL.replace('postgresql',
                                                           'postgresql+asyncpg')) # Retain asyncpg

async_engine = create_async_engine(connection_string, echo=True, future=True) # <<<<< IMPORTANT: Use create_async_engine

# MODIFIED: Define an async sessionmaker
AsyncSessionLocal = sessionmaker(
    async_engine, class_=AsyncSession, expire_on_commit=False
)

# MODIFIED: create_db_tables must now be asynchronous and use the async_engine
async def create_db_tables():
    async with async_engine.begin() as conn: # Start an async connection
        await conn.run_sync(SQLModel.metadata.create_all) # Run synchronous metadata creation in async context
    # print("DEBUG: SQLModel.metadata.create_all completed.")

# MODIFIED: get_session must provide an AsyncSession
from typing import AsyncGenerator

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session: # Use the async sessionmaker
        yield session

