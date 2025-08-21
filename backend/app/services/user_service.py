from sqlalchemy.orm import Session
from app.db.models.user import User
from app.schemas.user import UserUpdate
import uuid

class UserService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_id(self, user_id: uuid.UUID):
        return self.db.query(User).filter(User.id == user_id).first()

    def update_user(self, user_id: uuid.UUID, user_in: UserUpdate):
        user = self.get_user_by_id(user_id)
        if not user:
            return None

        update_data = user_in.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(user, key, value)

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user