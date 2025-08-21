import uuid
from sqlalchemy import Column, String, Date, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    country_code = Column(String(5), nullable=False, default="+91")
    phone = Column(String(15), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=True)
    name = Column(String(255), nullable=True)
    gender = Column(String(20), nullable=True)
    dob = Column(Date, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
