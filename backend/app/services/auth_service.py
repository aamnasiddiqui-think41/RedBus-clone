from sqlalchemy.orm import Session
from app.db.models.otp import OTP
from app.db.models.user import User
from app.schemas.auth import OTPRequest
from app.core.security import generate_otp, create_access_token
from datetime import datetime, timedelta, timezone
from app.core.logging import logger

class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def request_otp(self, otp_in: OTPRequest):
        # Basic validation: phone must be digits and length 10 for +91
        phone = otp_in.phone.strip()
        if not phone.isdigit() or len(phone) != 10:
            raise ValueError("Phone number must be exactly 10 digits")
        if not otp_in.country_code.startswith('+'):
            raise ValueError("Country code must start with '+'")

        otp_code = generate_otp()
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)

        new_otp = OTP(
            phone=f"{otp_in.country_code}{phone}",
            otp_code=otp_code,
            expires_at=expires_at,
        )
        
        self.db.add(new_otp)
        try:
            self.db.commit()
            self.db.refresh(new_otp)
            logger.info("OTP created otp_id={otp_id}", otp_id=new_otp.id)
        except Exception:
            self.db.rollback()
            logger.exception("Failed to persist OTP")
            raise

        return {"otp_id": new_otp.id}

    def verify_otp(self, otp_id: str, otp_code: str):
        otp_record = self.db.query(OTP).filter(OTP.id == otp_id).first()
        if not otp_record:
            return None
        if otp_record.expires_at < datetime.now(timezone.utc):
            return None
        if len(otp_code.strip()) != 6 or not otp_code.strip().isdigit():
            return None
        if otp_record.otp_code != otp_code:
            return None

        logger.info("OTP matched for phone={phone}", phone=otp_record.phone)
        user = self.db.query(User).filter(User.phone == otp_record.phone).first()
        if not user:
            user = User(phone=otp_record.phone)
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)
            logger.info("New user created user_id={user_id}", user_id=user.id)
        else:
            logger.info("Existing user authenticated user_id={user_id}", user_id=user.id)

        access_token = create_access_token(data={"sub": str(user.id)})
        logger.info("Access token generated for user_id={user_id}", user_id=user.id)
        
        return {"token": access_token, "user": user}