from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.auth import OTPRequest, OTPVerify, Token
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/login", tags=["auth"])

@router.post("/request-otp")
def request_otp(otp_in: OTPRequest, db: Session = Depends(get_db)):
    print("--- 1. /api/login/request-otp endpoint hit ---")
    service = AuthService(db)
    result = service.request_otp(otp_in)
    print("--- 5. Result returned from service ---")
    return {"success": True, "message": f"OTP sent to {otp_in.country_code}{otp_in.phone}", "otp_id": result["otp_id"]}

@router.post("/verify-otp", response_model=Token)
def verify_otp(otp_in: OTPVerify, db: Session = Depends(get_db)):
    service = AuthService(db)
    result = service.verify_otp(otp_id=otp_in.otp_id, otp_code=otp_in.otp)
    if not result:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    # Convert user object to dict for the response
    user_dict = {
        "id": str(result["user"].id),
        "name": result["user"].name,
        "phone": result["user"].phone,
        "email": result["user"].email,
    }
    
    return {"token": result["token"], "user": user_dict}