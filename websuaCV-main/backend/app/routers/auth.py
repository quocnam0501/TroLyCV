from fastapi import APIRouter, Depends
from app.core.auth import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get the currently authenticated user's information.

    Returns:
        dict: User id and email
    """
    return {
        "id": current_user["id"],
        "email": current_user["email"]
    }