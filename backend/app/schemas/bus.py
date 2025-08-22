from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date as date_type
import uuid

class BusSearchRequest(BaseModel):
    from_city_id: uuid.UUID = Field(..., json_schema_extra={"example": "e5a4480e-dc06-47db-918d-2efc98e17740"})
    to_city_id: uuid.UUID = Field(..., json_schema_extra={"example": "7a8ee8c1-689a-42f3-901c-167723fee657"})
    date: Optional[date_type] = Field(None, json_schema_extra={"example": "2025-09-01"})
    travel_date: Optional[date_type] = Field(None, json_schema_extra={"example": "2025-09-01"})
    
    @property
    def actual_date(self) -> date_type:
        """Get the actual date from either field"""
        return self.travel_date or self.date

class BusResponse(BaseModel):
    id: str = Field(..., json_schema_extra={"example": "2c347a5d-b0ac-4b88-8fe8-5bc79765193d"})
    operator: str = Field(..., json_schema_extra={"example": "VRL Travels"})
    departure_time: str = Field(..., json_schema_extra={"example": "21:00"})
    arrival_time: str = Field(..., json_schema_extra={"example": "06:00"})
    duration: str = Field(..., json_schema_extra={"example": "9h"})
    fare: float = Field(..., json_schema_extra={"example": 900})
    rating: float = Field(..., json_schema_extra={"example": 4.3})

class BusSearchResponse(BaseModel):
    buses: List[BusResponse] = Field(..., json_schema_extra={"example": []})
    message: str = Field(..., json_schema_extra={"example": "Found 2 buses for your journey"})

class SeatResponse(BaseModel):
    id: str = Field(..., json_schema_extra={"example": "uuid-here"})
    seat_no: str = Field(..., json_schema_extra={"example": "A1"})
    seat_type: str = Field(..., json_schema_extra={"example": "Sleeper"})
    price: float = Field(..., json_schema_extra={"example": 900})
    is_available: bool = Field(..., json_schema_extra={"example": True})

class SeatLayoutResponse(BaseModel):
    bus_id: str = Field(..., json_schema_extra={"example": "2c347a5d-b0ac-4b88-8fe8-5bc79765193d"})
    seats: List[SeatResponse] = Field(..., json_schema_extra={"example": []})
