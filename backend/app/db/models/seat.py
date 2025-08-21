import uuid
from sqlalchemy import Column, String, Float, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class Seat(Base):
    __tablename__ = "seats"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bus_id = Column(UUID(as_uuid=True), ForeignKey("buses.id"), nullable=False)

    seat_no = Column(String(10), nullable=False)
    seat_type = Column(String(50), nullable=False)  # Sleeper / Seater
    price = Column(Float, nullable=False)
    is_available = Column(Boolean, default=True)
