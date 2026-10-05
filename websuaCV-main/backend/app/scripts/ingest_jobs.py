#!/usr/bin/env python3
"""
Internal job ingestion script for Techmap API.
This script is designed to be run manually (not automatically) to ingest Vietnam job data.
It makes exactly ONE API request to the Techmap API with countryCode=vn, page=1, format=json, and sort=newest.
"""

import asyncio
import json
import sys
import traceback
from typing import List, Dict, Any, Optional

# Add the parent directory to the path so we can import app modules
sys.path.insert(0, '.')

from app.core.config import settings
from app.db.client import supabase
import httpx


class VietnamJobIngester:
    """Handles ingestion of Vietnam-specific jobs from Techmap API."""

    def __init__(self):
        self.api_key = settings.TECHMAP_API_KEY
        if not self.api_key:
            raise ValueError("TECHMAP_API_KEY is not configured in the backend settings")

        self.base_url = "https://daily-international-job-postings.p.rapidapi.com/api/v2/jobs/search"
        self.max_requests = 1  # Strict limit as per requirements
        self.requests_made = 0

    async def fetch_vietnam_jobs(self) -> List[Dict[str, Any]]:
        """
        Fetch job postings from Vietnam using Techmap API.
        This method makes exactly ONE API request with countryCode=vn, page=1, format=json, and sort=newest.

        Returns:
            List of normalized job dictionaries
        """
        # Enforce the strict request limit
        if self.requests_made >= self.max_requests:
            raise RuntimeError(f"Maximum API requests ({self.max_requests}) exceeded")

        # ALWAYS use these parameters as per requirements - never configurable
        params = {
            "countryCode": "vn",  # Vietnam - ALWAYS use this, never configurable
            "page": "1",          # Page number - ALWAYS use this, never configurable
            "format": "json",     # Response format - ALWAYS use this, never configurable
            "sort": "newest"      # Sort by newest - ALWAYS use this, never configurable
        }

        headers = {
            "x-rapidapi-key": self.api_key,
            "x-rapidapi-host": "daily-international-job-postings.p.rapidapi.com"
        }

        # Make exactly ONE API request
        self.requests_made += 1

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.get(
                    self.base_url,
                    params=params,
                    headers=headers
                )
        except httpx.ConnectTimeout as e:
            print(f"CONNECT TIMEOUT: {type(e).__name__}: {str(e)}")
            print(traceback.format_exc())
            raise
        except httpx.ReadTimeout as e:
            print(f"READ TIMEOUT: {type(e).__name__}: {str(e)}")
            print(traceback.format_exc())
            raise
        except httpx.WriteTimeout as e:
            print(f"WRITE TIMEOUT: {type(e).__name__}: {str(e)}")
            print(traceback.format_exc())
            raise
        except httpx.PoolTimeout as e:
            print(f"POOL TIMEOUT: {type(e).__name__}: {str(e)}")
            print(traceback.format_exc())
            raise
        except httpx.TimeoutException as e:
            print(f"HTTPX TIMEOUT: {type(e).__name__}: {str(e)}")
            print(traceback.format_exc())
            raise
        except Exception as e:
            print(f"INGESTION ERROR: {type(e).__name__}: {str(e)}")
            print(traceback.format_exc())
            raise

        # Check HTTP status code first
        if response.status_code != 200:
            # Safely report error details without exposing secrets
            content_type = response.headers.get("content-type", "unknown")
            # Truncate response body to avoid flooding logs
            response_text = response.text[:1000] + ("..." if len(response.text) > 1000 else "")
            raise RuntimeError(
                f"Techmap API request failed with status {response.status_code}. "
                f"Content-Type: {content_type}. "
                f"Response body (truncated): {response_text}"
            )

        # Check if response is JSON before attempting to parse
        content_type = response.headers.get("content-type", "").lower()
        if "application/json" not in content_type:
            # Safely report error details
            response_text = response.text[:1000] + ("..." if len(response.text) > 1000 else "")
            raise RuntimeError(
                f"Techmap API returned non-JSON response. "
                f"Content-Type: {content_type}. "
                f"Response body (truncated): {response_text}"
            )

        # Safely parse JSON
        try:
            data = response.json()
        except ValueError as e:
            # Safely report JSON parsing error
            response_text = response.text[:1000] + ("..." if len(response.text) > 1000 else "")
            raise RuntimeError(
                f"Failed to parse JSON response from Techmap API. "
                f"Content-Type: {content_type}. "
                f"Response body (truncated): {response_text}"
            ) from e

        # Normalize the job data to match our schema
        normalized_jobs = []
        for job in data.get("jobs", []):
            normalized_job = self._normalize_job(job)
            if normalized_job and self._is_vietnam_job(job, normalized_job):
                normalized_jobs.append(normalized_job)

        return normalized_jobs

    def _normalize_job(self, job: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Normalize a Techmap job posting to match our database schema.
        Only uses fields that exist in the Techmap response.

        Args:
            job: Raw job data from Techmap API

        Returns:
            Normalized job dictionary or None if invalid
        """
        try:
            # Extract basic fields
            title = job.get("title", "").strip()
            if not title:
                return None

            company = job.get("company", {}).get("name", "Unknown Company").strip()
            if not company:
                company = "Unknown Company"

            # Location handling - try to get from Techmap's location structure first
            location_name = ""
            location_data = job.get("location", {})
            if location_data and isinstance(location_data, dict):
                location_name = location_data.get("name", "").strip()

            # If no location from Techmap structure, try city/state/country fields
            if not location_name:
                city = job.get("city", "").strip()
                state = job.get("state", "").strip()
                country = job.get("country", "").strip()

                location_parts = [part for part in [city, state, country] if part]
                location_name = ", ".join(location_parts) if location_parts else "Vietnam"

            # Description and requirements
            description = job.get("description", "").strip()
            if not description:
                description = f"Position: {title} at {company}"

            # Requirements and skills - extract from description or specific fields
            requirements = []
            if job.get("requirements"):
                if isinstance(job["requirements"], str):
                    try:
                        requirements = json.loads(job["requirements"])
                    except json.JSONDecodeError:
                        requirements = [req.strip() for req in job["requirements"].split("\n") if req.strip()]
                elif isinstance(job["requirements"], list):
                    requirements = job["requirements"]

            preferred_skills = []
            if job.get("skills"):
                if isinstance(job["skills"], str):
                    try:
                        preferred_skills = json.loads(job["skills"])
                    except json.JSONDecodeError:
                        preferred_skills = [skill.strip() for skill in job["skills"].split(",") if skill.strip()]
                elif isinstance(job["skills"], list):
                    preferred_skills = job["skills"]

            # Job type
            job_type = job.get("employmentType", "").strip()
            if not job_type:
                job_type = "Full-time"  # Default
            # Normalize common job types
            job_type_lower = job_type.lower()
            if any(term in job_type_lower for term in ["part", "partial"]):
                job_type = "Part-time"
            elif any(term in job_type_lower for term in ["contract", "temporary", "temp"]):
                job_type = "Contract"
            elif any(term in job_type_lower for term in ["intern", "internship"]):
                job_type = "Internship"
            else:
                job_type = "Full-time"

            # Remote work - check multiple fields
            remote = False
            workplace = job.get("workplace", "").lower()
            if any(term in workplace for term in ["remote", "work from home", "wfh"]):
                remote = True
            # Also check in title/description
            if not remote:
                text_to_check = f"{title} {description}".lower()
                remote = any(term in text_to_check for term in ["remote", "work from home", "wfh"])

            # Posted date
            posted_at = job.get("datePosted") or job.get("postedDate") or job.get("createdAt")

            return {
                "source": "techmap",
                "source_job_id": str(job.get("id", "")),
                "title": title[:200],  # Limit length
                "company": company[:100],
                "location": location_name[:100],
                "job_type": job_type[:50],
                "description": description[:2000],  # Reasonable limit
                "requirements": json.dumps(requirements[:20]),  # Limit to 20 items
                "preferred_skills": json.dumps(preferred_skills[:20]),  # Limit to 20 items
                "posted_at": posted_at,
                "remote": remote,
            }
        except Exception as e:
            # Log the error but don't fail the entire process
            # Note: We don't print the actual error to avoid leaking sensitive info
            print(f"Error processing job: {type(e).__name__}")
            return None

    def _is_vietnam_job(self, raw_job: Dict[str, Any], normalized_job: Dict[str, Any]) -> bool:
        """
        Check if a job is genuinely related to Vietnam.
        This is the hard Vietnam safety check as per requirements.

        Args:
            raw_job: The raw job data from Techmap API
            normalized_job: The normalized job data

        Returns:
            True if the job should be included, False otherwise
        """
        # First, check if Techmap provides an explicit country field
        techmap_country = raw_job.get("country")
        if techmap_country and isinstance(techmap_country, str):
            # Normalize the country code/name for comparison
            country_normalized = techmap_country.strip().upper()
            # Accept Vietnam in various forms
            if country_normalized in ["VN", "VIETNAM", "Vietnam"]:
                return True
            # If Techmap explicitly says it's not Vietnam, skip it
            elif country_normalized not in ["VN", "VIETNAM", "Vietnam", ""]:
                return False

        # If Techmap doesn't provide a reliable country field,
        # we rely on the fact that we requested countryCode=vn
        # and do not attempt to invent a country classification from ambiguous text
        # This is a conservative approach - if we can't verify, we still include it
        # since we specifically requested Vietnam jobs

        # Additional check: look for obvious non-Vietnam indicators in location
        # but be careful not to reject legitimate Vietnam jobs
        location = normalized_job.get("location", "").lower()

        # Reject only if location is very clearly NOT Vietnam
        # (e.g., clearly another country name)
        obvious_non_vietnam = [
            "united states", "usa", "us ",
            "united kingdom", "uk ",
            "singapore", "sg ",
            "germany", "de ",
            "france", "fr ",
            "canada", "ca ",
            "australia", "au "
        ]

        for non_vnm in obvious_non_vietnam:
            # Check if the location starts with or is exactly a non-Vietnam country
            if location == non_vnm.strip() or location.startswith(non_vnm.strip() + ", "):
                return False

        # If we made it here, we consider it a Vietnam job
        # This aligns with the requirement: "Do not reject legitimate Vietnam jobs
        # merely because the company is headquartered outside Vietnam"
        return True

    async def ingest_jobs(self) -> Dict[str, int]:
        """
        Main ingestion method that fetches jobs and stores them in the database.

        Returns:
            Dictionary with statistics about the ingestion process
        """
        stats = {
            "fetched": 0,
            "inserted": 0,
            "skipped": 0,
            "errors": 0
        }

        try:
            # Fetch jobs from Techmap (makes exactly ONE API request)
            jobs = await self.fetch_vietnam_jobs()
            stats["fetched"] = len(jobs)

            if jobs:
                # Use upsert to handle duplicates (insert or update if source+source_job_id exists)
                # This preserves existing jobs and doesn't delete anything
                result = supabase.table("jobs").upsert(jobs, on_conflict="source,source_job_id").execute()

                if result.data:
                    stats["inserted"] = len(result.data)
                else:
                    # If upsert doesn't return data, assume all were processed
                    stats["inserted"] = len(jobs)

        except Exception as e:
            stats["errors"] += 1
            # In a real implementation, we might want to log this properly
            # But we must avoid exposing the API key or other sensitive info
            print(f"Ingestion error: {type(e).__name__}: {str(e)}")

        return stats


async def main():
    """Main entry point for the ingestion script."""
    print("Starting Vietnam job ingestion from Techmap API...")

    try:
        ingester = VietnamJobIngester()
        stats = await ingester.ingest_jobs()

        print(f"Ingestion completed:")
        print(f"  Fetched: {stats['fetched']} jobs")
        print(f"  Inserted: {stats['inserted']} jobs")
        print(f"  Skipped: {stats['skipped']} jobs (non-Vietnam or invalid)")
        print(f"  Errors: {stats['errors']}")
        print(f"  API requests made: {ingester.requests_made} (limit: 1)")

        if stats["errors"] > 0:
            sys.exit(1)

    except Exception as e:
        print(f"Failed to initialize ingester: {type(e).__name__}: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())