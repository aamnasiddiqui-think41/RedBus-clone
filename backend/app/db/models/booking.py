import uuid
from sqlalchemy import Column, String, Date, DateTime, Float, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    bus_id = Column(UUID(as_uuid=True), ForeignKey("buses.id"), nullable=False)

    date = Column(Date, nullable=False)
    status = Column(String(20), default="CONFIRMED")  # CONFIRMED, CANCELLED
    amount = Column(Float, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
