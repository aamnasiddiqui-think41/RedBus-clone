from sqlalchemy.orm import Session
from app.db.models.user import User
from app.db.models.booking import Booking
from app.schemas.user import UserUpdate
import uuid
from app.core.logging import logger

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
        logger.info("Updating user_id={user_id} fields={fields}", user_id=user_id, fields=list(update_data.keys()))
        for key, value in update_data.items():
            setattr(user, key, value)

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        logger.info("User updated user_id={user_id}", user_id=user_id)
        return user

    def get_user_profile(self, user_id: uuid.UUID):
        """
        Get enhanced user profile with wallet and booking statistics
        """
        user = self.get_user_by_id(user_id)
        if not user:
            return None

        bookings = self.db.query(Booking).filter(Booking.user_id == user_id).all()
        total_bookings = len(bookings)
        total_amount_spent = sum(booking.amount for booking in bookings)
        
        wallet_balance = total_bookings * 75.0
        
        personal_details_added = bool(
            user.name and user.email and user.gender and user.dob
        )

        return {
            "id": user.id,
            "phone": user.phone,
            "country_code": user.country_code,
            "name": user.name,
            "email": user.email,
            "gender": user.gender,
            "dob": user.dob,

            "total_bookings": total_bookings,
            "total_amount_spent": total_amount_spent,
            "wallet_balance": wallet_balance,
            "personal_details_added": personal_details_added
        }