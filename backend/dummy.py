from app.db.session import SessionLocal
from app.db.models.otp import OTP
from datetime import datetime, timedelta, timezone

def insert_dummy_otp():
    db = SessionLocal()
    try:
        print("--- Inserting dummy OTP ---")
        
        dummy_otp = OTP(
            phone="+910000000000",
            otp_code="123456",
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=10)
        )
        
        db.add(dummy_otp)
        db.commit()
        
        print("✅ Dummy OTP inserted successfully!")
        print(f"   ID: {dummy_otp.id}")
        print(f"   Phone: {dummy_otp.phone}")
        print(f"   Code: {dummy_otp.otp_code}")

    except Exception as e:
        print(f"❌ Failed to insert dummy OTP: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    insert_dummy_otp()