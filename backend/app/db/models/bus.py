import uuid
from sqlalchemy import Column, String, Time, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class Bus(Base):
    __tablename__ = "buses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    operator = Column(String(100), nullable=False)

    from_city_id = Column(UUID(as_uuid=True), ForeignKey("cities.id"), nullable=False)
    to_city_id = Column(UUID(as_uuid=True), ForeignKey("cities.id"), nullable=False)

    departure_time = Column(String(10), nullable=False)  # e.g. "21:00"
    arrival_time = Column(String(10), nullable=False)    # e.g. "06:00"
    duration = Column(String(20), nullable=True)         # e.g. "9h"
    fare = Column(Float, nullable=False)
    rating = Column(Float, nullable=True)
