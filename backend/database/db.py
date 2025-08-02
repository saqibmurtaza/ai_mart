import os
from supabase import Client, create_client
from config.settings import settings
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from typing import AsyncGenerator

# Initialize Supabase clients
supabase_public: Client = create_client(settings.NEXT_PUBLIC_SUPABASE_URL, settings.NEXT_PUBLIC_SUPABASE_ANON_KEY)
supabase_admin: Client = create_client(settings.NEXT_PUBLIC_SUPABASE_URL, settings.SUPABASE_SECRET_KEY)

# Use create_async_engine for asynchronous database operations
# Replace 'postgresql' with 'postgresql+asyncpg' to use asyncpg driver
connection_string = str(settings.DIRECT_URL.replace('postgresql', 'postgresql+asyncpg'))

# Best Practice: Configure asyncpg to disable statement caching and manage connection pooling
async_engine = create_async_engine(
    connection_string,
    echo=True, # Set to False in production for less verbose logs
    future=True,
    # Crucial for PgBouncer/Supavisor transaction mode: disable prepared statement cache
    connect_args={"statement_cache_size": 0},
    # Recommended for pooled connections:
    pool_pre_ping=True, # Pings connections before use to ensure they are alive
    pool_recycle=3600 # Recycles connections after 1 hour (3600 seconds) to prevent stale connections
)

# Define an async sessionmaker
AsyncSessionLocal = sessionmaker(
    async_engine, class_=AsyncSession, expire_on_commit=False
)

# Function to create database tables
async def create_db_tables():
    # DDL operations (like create_all) should use the engine's connection directly
    async with async_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    # print("DEBUG: SQLModel.metadata.create_all completed.")

# Dependency to get an async session
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session

