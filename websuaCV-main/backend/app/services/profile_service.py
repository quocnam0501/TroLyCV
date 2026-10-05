from supabase import Client
from app.db.client import supabase_anon
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileInDB
from typing import Optional
import json
from datetime import datetime


async def get_profile(user_id: str) -> Optional[ProfileInDB]:
    """
    Get profile for a specific user.

    Args:
        user_id: The authenticated user's ID

    Returns:
        ProfileInDB object if found, None otherwise
    """
    try:
        response = supabase_anon.table("profiles").select("*").eq("user_id", user_id).execute()

        if response.data and len(response.data) > 0:
            profile_data = response.data[0]
            # Convert JSON string back to object for desired_locations if needed
            if profile_data.get("desired_locations") and isinstance(profile_data["desired_locations"], str):
                try:
                    profile_data["desired_locations"] = json.loads(profile_data["desired_locations"])
                except json.JSONDecodeError:
                    # If it's not valid JSON, keep it as string
                    pass

            return ProfileInDB(**profile_data)
        return None
    except Exception as e:
        print(f"Error getting profile: {e}")
        return None


async def create_profile(user_id: str, profile: ProfileCreate) -> ProfileInDB:
    """
    Create a new profile for a user.

    Args:
        user_id: The authenticated user's ID
        profile: Profile data to create

    Returns:
        Created ProfileInDB object
    """
    try:
        # Prepare profile data for insertion
        profile_dict = profile.dict(exclude_unset=True)
        profile_dict["user_id"] = user_id

        # Convert desired_locations to JSON string if it's a list/dict
        if profile_dict.get("desired_locations") is not None:
            if not isinstance(profile_dict["desired_locations"], str):
                profile_dict["desired_locations"] = json.dumps(profile_dict["desired_locations"])

        response = supabase_anon.table("profiles").insert(profile_dict).execute()

        if response.data and len(response.data) > 0:
            profile_data = response.data[0]
            # Convert JSON string back to object for desired_locations if needed
            if profile_data.get("desired_locations") and isinstance(profile_data["desired_locations"], str):
                try:
                    profile_data["desired_locations"] = json.loads(profile_data["desired_locations"])
                except json.JSONDecodeError:
                    # If it's not valid JSON, keep it as string
                    pass

            return ProfileInDB(**profile_data)
        else:
            raise Exception("Failed to create profile")
    except Exception as e:
        print(f"Error creating profile: {e}")
        raise e


async def update_profile(user_id: str, profile: ProfileUpdate) -> Optional[ProfileInDB]:
    """
    Update profile for a specific user.

    Args:
        user_id: The authenticated user's ID
        profile: Profile data to update

    Returns:
        Updated ProfileInDB object if successful, None otherwise
    """
    try:
        # Get existing profile first
        existing_profile = await get_profile(user_id)
        if not existing_profile:
            return None

        # Prepare profile data for update
        profile_dict = profile.dict(exclude_unset=True)

        # Convert desired_locations to JSON string if it's a list/dict
        if profile_dict.get("desired_locations") is not None:
            if not isinstance(profile_dict["desired_locations"], str):
                profile_dict["desired_locations"] = json.dumps(profile_dict["desired_locations"])

        # Add updated timestamp
        profile_dict["updated_at"] = datetime.utcnow().isoformat()

        response = supabase_anon.table("profiles").update(profile_dict).eq("user_id", user_id).execute()

        if response.data and len(response.data) > 0:
            profile_data = response.data[0]
            # Convert JSON string back to object for desired_locations if needed
            if profile_data.get("desired_locations") and isinstance(profile_data["desired_locations"], str):
                try:
                    profile_data["desired_locations"] = json.loads(profile_data["desired_locations"])
                except json.JSONDecodeError:
                    # If it's not valid JSON, keep it as string
                    pass

            return ProfileInDB(**profile_data)
        return None
    except Exception as e:
        print(f"Error updating profile: {e}")
        return None


async def delete_profile(user_id: str) -> bool:
    """
    Delete profile for a specific user.

    Args:
        user_id: The authenticated user's ID

    Returns:
        True if successful, False otherwise
    """
    try:
        response = supabase_anon.table("profiles").delete().eq("user_id", user_id).execute()
        return len(response.data) > 0 if response.data else False
    except Exception as e:
        print(f"Error deleting profile: {e}")
        return False