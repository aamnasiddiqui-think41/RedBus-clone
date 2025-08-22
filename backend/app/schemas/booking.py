from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date

class PassengerDetail(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "John Doe"})
    age: int = Field(..., json_schema_extra={"example": 25})
    gender: str = Field(..., json_schema_extra={"example": "Male"})

class ContactInfo(BaseModel):
    phone: Optional[str] = Field(default="", json_schema_extra={"example": "+919876543210"})
    email: Optional[str] = Field(default="", json_schema_extra={"example": "john@example.com"})

class BookingCreate(BaseModel):
    bus_id: str = Field(..., json_schema_extra={"example": "BUS101"})
    travel_date: date = Field(..., json_schema_extra={"example": "2025-09-01"})
    seats: List[str] = Field(..., json_schema_extra={"example": ["A1", "B1"]})
    passenger_details: Optional[List[PassengerDetail]] = Field(default=[], json_schema_extra={"example": []})
    contact: Optional[ContactInfo] = Field(default=None, json_schema_extra={"example": {"phone": "", "email": ""}})
    payment_mode: Optional[str] = Field(None, json_schema_extra={"example": "CARD"})

class BookingResponse(BaseModel):
    booking_id: str = Field(..., json_schema_extra={"example": "BKG003"})
    status: str = Field(..., json_schema_extra={"example": "CONFIRMED"})
    amount: float = Field(..., json_schema_extra={"example": 1800})
    seats: List[str] = Field(..., json_schema_extra={"example": ["A1", "B1"]})
    bus_id: str = Field(..., json_schema_extra={"example": "BUS101"})
    travel_date: str = Field(..., json_schema_extra={"example": "2025-09-01"})

class BookingListResponse(BaseModel):
    bookings: List[dict] = Field(..., json_schema_extra={
        "example": [
            {
                "booking_id": "BKG001",
                "bus_name": "VRL Travels",
                "from_city": "Bangalore",
                "to_city": "Hyderabad",
                "travel_date": "2025-09-01",
                "seats": ["A1", "A2"],
                "status": "CONFIRMED",
                "amount": 1800
            }
        ]
    })

class CancelBookingResponse(BaseModel):
    message: str = Field(..., json_schema_extra={"example": "Booking cancelled successfully"})
    booking_id: str = Field(..., json_schema_extra={"example": "BKG001"})
    status: str = Field(..., json_schema_extra={"example": "CANCELLED"})
