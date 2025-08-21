from sqlalchemy.orm import Session
from app.db.models.otp import OTP
from app.db.models.user import User
from app.schemas.auth import OTPRequest
from app.core.security import generate_otp, create_access_token
from datetime import datetime, timedelta, timezone

class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def request_otp(self, otp_in: OTPRequest):
        print("--- 2. AuthService.request_otp called ---")
        # 1. Generate OTP
        otp_code = generate_otp()
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)

        # 2. Store OTP in DB
        new_otp = OTP(
            phone=f"{otp_in.country_code}{otp_in.phone}",
            otp_code=otp_code,
            expires_at=expires_at,
        )
        
        print("--- 3. OTP object created, adding to session ---")
        self.db.add(new_otp)
        
        try:
            print("--- 4. Committing to database ---")
            self.db.commit()
            self.db.refresh(new_otp)
            print("--- 4a. Commit successful ---")
        except Exception as e:
            print(f"--- 4b. COMMIT FAILED: {e} ---")
            self.db.rollback()
            raise

        # In a real app, you would send the OTP via SMS here.
        # For this demo, we'll just return the ID.
        return {"otp_id": new_otp.id}

    def verify_otp(self, otp_id: str, otp_code: str):
        # 1. Find OTP in DB
        otp_record = self.db.query(OTP).filter(OTP.id == otp_id).first()

        if not otp_record:
            return None # Invalid OTP ID

        # 2. Check if expired or already used
        if otp_record.expires_at < datetime.now(timezone.utc):
            return None # Expired

        # 3. Verify code
        if otp_record.otp_code != otp_code:
            return None # Invalid code

        # 4. Find or create user
        print(f"--- 4. Looking for user with phone: {otp_record.phone} ---")
        user = self.db.query(User).filter(User.phone == otp_record.phone).first()
        
        if not user:
            print(f"--- 4a. User not found, CREATING NEW USER ---")
            user = User(phone=otp_record.phone)
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)
            print(f"--- 4b. New user created with ID: {user.id} ---")
        else:
            print(f"--- 4a. EXISTING USER FOUND with ID: {user.id} ---")
            print(f"--- 4b. User name: {user.name}, email: {user.email} ---")

        # 5. Generate JWT token
        access_token = create_access_token(data={"sub": str(user.id)})
        print(f"--- 5. JWT token generated for user ID: {user.id} ---")

        # 6. Clean up OTP (mark as used or delete) - DISABLED FOR DEBUGGING
        # self.db.delete(otp_record)
        # self.db.commit()

        print(f"--- 6. Returning token and user data ---")
        print(f"--- 6a. User ID: {user.id} ---")
        print(f"--- 6b. User phone: {user.phone} ---")
        print(f"--- 6c. Token generated: {access_token[:20]}... ---")
        
        return {"token": access_token, "user": user}