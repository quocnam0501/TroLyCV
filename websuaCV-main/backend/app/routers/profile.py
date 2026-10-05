from fastapi import APIRouter, Depends, HTTPException, status
from app.core.auth import get_current_user
from app.services.profile_service import get_profile, create_profile, update_profile, delete_profile
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileInDB

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("", response_model=ProfileInDB)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """
    Get the current user's profile.

    Returns:
        ProfileInDB: The user's profile

    Raises:
        HTTPException: 404 if profile not found
    """
    user_id = current_user["id"]
    profile = await get_profile(user_id)

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    return profile


@router.post("", response_model=ProfileInDB)
async def create_current_user_profile(
    profile: ProfileCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new profile for the current user.

    Args:
        profile: Profile data to create

    Returns:
        ProfileInDB: The created profile

    Raises:
        HTTPException: 400 if profile already exists
    """
    user_id = current_user["id"]

    # Check if profile already exists
    existing_profile = await get_profile(user_id)
    if existing_profile is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists"
        )

    return await create_profile(user_id, profile)


@router.put("", response_model=ProfileInDB)
async def upsert_current_user_profile(
    profile: ProfileCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create or update the current user's profile.

    Args:
        profile: Profile data to create or update

    Returns:
        ProfileInDB: The created or updated profile
    """
    user_id = current_user["id"]

    # Check if profile already exists
    existing_profile = await get_profile(user_id)
    if existing_profile is not None:
        # Update existing profile
        updated_profile = await update_profile(user_id, profile)
        if updated_profile is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update profile"
            )
        return updated_profile
    else:
        # Create new profile
        return await create_profile(user_id, profile)


@router.patch("", response_model=ProfileInDB)
async def update_current_user_profile(
    profile: ProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update the current user's profile.

    Args:
        profile: Profile data to update

    Returns:
        ProfileInDB: The updated profile

    Raises:
        HTTPException: 404 if profile not found
    """
    user_id = current_user["id"]
    updated_profile = await update_profile(user_id, profile)

    if updated_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    return updated_profile


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete_current_user_profile(current_user: dict = Depends(get_current_user)):
    """
    Delete the current user's profile.

    Returns:
        HTTP 204 No Content on success

    Raises:
        HTTPException: 404 if profile not found
    """
    user_id = current_user["id"]
    deleted = await delete_profile(user_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    return None