from pydantic_settings import BaseSettings, SettingsConfigDict # Import SettingsConfigDict
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # This tells Pydantic to look for environment variables.
    # It also allows for .env file loading implicitly if not already done.
    # However, explicitly calling load_dotenv() as above is good practice.
    model_config = SettingsConfigDict(env_file='.env', extra='ignore') # Ensure it looks for .env

    # Supabase Credentials
    NEXT_PUBLIC_SUPABASE_URL: str
    NEXT_PUBLIC_SUPABASE_ANON_KEY: str
    SUPABASE_SECRET_KEY: str # This is crucial for server-side
    DATABASE_URL: str

    # Sanity.io CMS Credentials
    SANITY_PROJECT_ID: str
    SANITY_DATASET: str = "production" # Default value if not found in .env
    SANITY_API_TOKEN: str # This might be optional if your backend only reads public Sanity data

# Create an instance of the Settings class.
# Pydantic-settings will automatically read from environment variables (including those loaded by dotenv).
settings = Settings()

# Optional: Add a quick check to see if critical variables are loaded
if not settings.DATABASE_URL:
    print("ERROR: DATABASE_URL is not set! Check your .env file.")
    # Consider raising an error to stop the application if critical settings are missing
    raise ValueError("DATABASE_URL is not configured.")

if not settings.SUPABASE_SECRET_KEY:
    print("ERROR: SUPABASE_SECRET_KEY is not set! Check your .env file.")
    raise ValueError("SUPABASE_SECRET_KEY is not configured.")


