import uuid
from sqlalchemy import Column, String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class OTP(Base):
    __tablename__ = "otp_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, doc="Unique OTP session ID")
    phone = Column(String(20), nullable=False, index=True, doc="Phone number the OTP was sent to")
    otp_code = Column(String(6), nullable=False, doc="The 6-digit OTP code")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), doc="Timestamp when the OTP was created")
    expires_at = Column(DateTime(timezone=True), nullable=False, doc="Timestamp when the OTP will expire")