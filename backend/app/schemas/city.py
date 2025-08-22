from pydantic import BaseModel, Field
from typing import List
import uuid

class CityResponse(BaseModel):
    id: str = Field(..., json_schema_extra={"example": "e5a4480e-dc06-47db-918d-2efc98e17740"})
    name: str = Field(..., json_schema_extra={"example": "Bangalore"})

class CityListResponse(BaseModel):
    cities: List[CityResponse] = Field(..., json_schema_extra={"example": []})
