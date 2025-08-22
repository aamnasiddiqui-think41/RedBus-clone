from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.auth import OTPRequest, OTPVerify, Token
from app.services.auth_service import AuthService
from app.core.logging import logger

router = APIRouter(prefix="/api/login", tags=["auth"])

@router.post("/request-otp")
def request_otp(otp_in: OTPRequest, db: Session = Depends(get_db)):
    try:
        service = AuthService(db)
        result = service.request_otp(otp_in)
        logger.info("OTP requested for phone={phone}", phone=f"{otp_in.country_code}{otp_in.phone}")
        return {"success": True, "message": f"OTP sent to {otp_in.country_code}{otp_in.phone}", "otp_id": result["otp_id"]}
    except Exception as e:
        logger.exception("Failed to request OTP: {error}", error=e)
        raise HTTPException(status_code=500, detail="Failed to request OTP")

@router.post("/verify-otp", response_model=Token)
def verify_otp(otp_in: OTPVerify, db: Session = Depends(get_db)):
    service = AuthService(db)
    result = service.verify_otp(otp_id=otp_in.otp_id, otp_code=otp_in.otp)
    if not result:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    user_dict = {
        "id": str(result["user"].id),
        "name": result["user"].name,
        "phone": result["user"].phone,
        "email": result["user"].email,
    }
    logger.info("OTP verified for user_id={user_id}", user_id=user_dict["id"])
    return {"token": result["token"], "user": user_dict}