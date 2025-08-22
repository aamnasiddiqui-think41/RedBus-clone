from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from typing import Optional
from datetime import date
import uuid

class UserBase(BaseModel):
    phone: str = Field(..., json_schema_extra={"example": "9876543210"})
    country_code: str = Field("+91", json_schema_extra={"example": "+91"})
    name: Optional[str] = Field(None, max_length=100, json_schema_extra={"example": "John Doe"})
    email: Optional[EmailStr] = Field(None, json_schema_extra={"example": "john.doe@example.com"})
    gender: Optional[str] = Field(None, json_schema_extra={"example": "Male"})
    dob: Optional[date] = Field(None, json_schema_extra={"example": "1994-05-12"})

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100, json_schema_extra={"example": "Johnathan Doe"})
    email: Optional[EmailStr] = Field(None, json_schema_extra={"example": "john.doe@gmail.com"})
    gender: Optional[str] = Field(None, json_schema_extra={"example": "Male"})
    dob: Optional[date] = Field(None, json_schema_extra={"example": "1994-05-12"})

    @field_validator('gender')
    @classmethod
    def validate_gender(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        allowed = {"Male", "Female", "Other"}
        if v not in allowed:
            raise ValueError("Gender must be Male, Female, or Other")
        return v

class UserResponse(UserBase):
    id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)

class UserProfileResponse(BaseModel):
    id: uuid.UUID
    phone: str
    country_code: str
    name: Optional[str] = None
    email: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[date] = None
    total_bookings: int = 0
    total_amount_spent: float = 0.0
    wallet_balance: float = 0.0
    personal_details_added: bool = False
    model_config = ConfigDict(from_attributes=True)