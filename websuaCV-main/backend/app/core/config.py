from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    TECHMAP_API_KEY: Optional[str] = None

    class Config:
        # Load .env from the current working directory (expected to be backend/)
        env_file = ".env"
        env_file_encoding = 'utf-8'
        extra = 'ignore'

settings = Settings()
print(f"SUPABASE_URL configured: {bool(settings.SUPABASE_URL)}")
print(f"SUPABASE_ANON_KEY configured: {bool(settings.SUPABASE_ANON_KEY)}")
print(f"SUPABASE_SERVICE_ROLE_KEY configured: {bool(settings.SUPABASE_SERVICE_ROLE_KEY)}")
