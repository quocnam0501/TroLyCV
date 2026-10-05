import os
from supabase import create_client, Client
from app.core.config import settings

# Initialize Supabase client with service role key (for admin operations)
def get_supabase_client() -> Client:
    """
    Initialize and return Supabase client with service role key.
    Raises an exception if required configuration is missing.
    """
    supabase_url = settings.SUPABASE_URL
    supabase_key = settings.SUPABASE_SERVICE_ROLE_KEY

    if not supabase_url:
        raise ValueError("SUPABASE_URL environment variable is required")

    if not supabase_key:
        raise ValueError("SUPABASE_SERVICE_ROLE_KEY environment variable is required")

    return create_client(supabase_url, supabase_key)

# Initialize Supabase client with anon key (for user operations respecting RLS)
def get_supabase_anon_client() -> Client:
    """
    Initialize and return Supabase client with anon key.
    Raises an exception if required configuration is missing.
    """
    supabase_url = settings.SUPABASE_URL
    supabase_key = settings.SUPABASE_ANON_KEY

    if not supabase_url:
        raise ValueError("SUPABASE_URL environment variable is required")

    if not supabase_key:
        raise ValueError("SUPABASE_ANON_KEY environment variable is required")

    return create_client(supabase_url, supabase_key)

# Create singleton instances
supabase: Client = get_supabase_client()
supabase_anon: Client = get_supabase_anon_client()