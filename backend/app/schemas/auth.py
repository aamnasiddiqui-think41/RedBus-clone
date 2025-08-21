from pydantic import BaseModel, Field
import uuid

class OTPRequest(BaseModel):
    country_code: str = Field(..., json_schema_extra={"example": "+91"})
    phone: str = Field(..., json_schema_extra={"example": "9876543210"})

class OTPVerify(BaseModel):
    otp_id: uuid.UUID = Field(..., json_schema_extra={"example": "a_valid_uuid"})
    otp: str = Field(..., json_schema_extra={"example": "123456"})

class Token(BaseModel):
    token: str
    user: dict