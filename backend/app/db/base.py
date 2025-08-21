# app/db/base.py

from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    """SQLAlchemy Declarative Base for all models."""
    pass

# IMPORTANT:
# from app.db.models import user, otp, bus, city, booking , seat, booking_seat # noqa: F401
from app.db.models import user  # noqa
from app.db.models import otp  # noqa
from app.db.models import city  # noqa
from app.db.models import bus  # noqa
from app.db.models import seat  # noqa
from app.db.models import booking  # noqa
from app.db.models import booking_seat  # noqa

print("✅ base.py loaded, models imported:", Base.metadata.tables.keys())
