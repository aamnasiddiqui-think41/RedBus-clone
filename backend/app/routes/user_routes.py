from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.user import UserUpdate, UserResponse
from app.services.user_service import UserService
from app.db.models.user import User
from app.deps import get_current_user

router = APIRouter(prefix="/api/me", tags=["users"])

@router.get("/", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/", response_model=UserResponse)
def update_my_profile(user_in: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = UserService(db)
    user = service.update_user(user_id=current_user.id, user_in=user_in)
    return user