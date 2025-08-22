from pydantic import BaseModel, Field, field_validator
import uuid

class OTPRequest(BaseModel):
    country_code: str = Field(..., json_schema_extra={"example": "+91"})
    phone: str = Field(..., min_length=10, max_length=10, json_schema_extra={"example": "9876543210"})

    @field_validator('country_code')
    @classmethod
    def validate_country_code(cls, v: str) -> str:
        if not v.startswith('+'):
            raise ValueError("Country code must start with '+'")
        return v

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: str) -> str:
        if not v.isdigit() or len(v) != 10:
            raise ValueError("Phone number must be exactly 10 digits")
        return v

class OTPVerify(BaseModel):
    otp_id: uuid.UUID = Field(..., json_schema_extra={"example": "a_valid_uuid"})
    otp: str = Field(..., min_length=6, max_length=6, json_schema_extra={"example": "123456"})

    @field_validator('otp')
    @classmethod
    def validate_otp(cls, v: str) -> str:
        if not v.isdigit() or len(v) != 6:
            raise ValueError("OTP must be a 6-digit number")
        return v

class Token(BaseModel):
    token: str
    user: dict