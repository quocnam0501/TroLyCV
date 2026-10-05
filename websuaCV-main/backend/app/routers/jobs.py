import re
import uuid
from datetime import datetime, timezone
from typing import Any, List

from fastapi import APIRouter, HTTPException
import traceback

from app.core.config import settings
from app.db.client import supabase

router = APIRouter(prefix="/api/jobs", tags=["jobs"])



@router.get("")
async def list_jobs():
    # Fetch all jobs from database only - never calls Techmap
    try:
        result = supabase.table("jobs").select("*").execute()
        # Handle case where result.data might be None
        jobs_data = result.data if result.data is not None else []
        if len(jobs_data) > 0:
            return jobs_data
        # If the table exists but is empty, return empty array
        # Do NOT return synthetic jobs as fallback
        return []
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal server error")




@router.get("/{job_id}")
def get_job(job_id: str):
    result = supabase.table("jobs").select("*").eq("id", job_id).maybe_single().execute()
    # Handle case where result.data might be None
    if result.data is not None:
        return result.data
    # If not found in database, return 404
    # Do NOT fall back to synthetic jobs
    raise HTTPException(status_code=404, detail="Job not found")