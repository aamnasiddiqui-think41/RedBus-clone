from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.user import UserUpdate, UserResponse, UserProfileResponse
from app.services.user_service import UserService
from app.db.models.user import User
from app.deps import get_current_user
from app.core.logging import logger

router = APIRouter(prefix="/api/me", tags=["users"])

@router.get("/", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/debug", response_model=dict)
def debug_auth(current_user: User = Depends(get_current_user)):
    """
    Simple debug endpoint to test authentication
    """
    return {
        "message": "Authentication successful",
        "user_id": str(current_user.id),
        "user_phone": current_user.phone,
        "user_name": current_user.name
    }

@router.get("/profile", response_model=UserProfileResponse)
def get_my_enhanced_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Get enhanced profile with wallet, total spent, and personal details status
    """
    try:
        service = UserService(db)
        profile = service.get_user_profile(user_id=current_user.id)
        return profile
    except Exception as e:
        logger.exception("Failed to load enhanced profile: {error}", error=e)
        raise HTTPException(status_code=500, detail="Failed to load profile")

@router.put("/", response_model=UserResponse)
def update_my_profile(user_in: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        service = UserService(db)
        user = service.update_user(user_id=current_user.id, user_in=user_in)
        return user
    except Exception as e:
        logger.exception("Failed to update profile: {error}", error=e)
        raise HTTPException(status_code=400, detail="Invalid input for profile update")