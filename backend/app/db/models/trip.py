import uuid
from sqlalchemy import Column, Date, String, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class Trip(Base):
    __tablename__ = "trips"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bus_id = Column(UUID(as_uuid=True), ForeignKey("buses.id", ondelete="CASCADE"), nullable=False)
    service_date = Column(Date, nullable=False)
    departure_time = Column(String(10), nullable=True)  # Override bus default if needed
    arrival_time = Column(String(10), nullable=True)    # Override bus default if needed
    status = Column(String(20), nullable=False, default="ACTIVE")

    __table_args__ = (
        UniqueConstraint("bus_id", "service_date", name="uq_trips_bus_date"),
    )
