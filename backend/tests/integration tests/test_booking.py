# import pytest
# from fastapi.testclient import TestClient
# from sqlalchemy.orm import sessionmaker
# from sqlalchemy import text
# from uuid import uuid4
# from datetime import date

# from app.main import app
# from app.db.session import engine, get_db
# from app.db.base import Base
# from app.deps import get_current_user
# from app.db.models.user import User


# TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# @pytest.fixture(scope="module")
# def db_session():
#     with engine.connect() as connection:
#         connection.execute(text("DROP SCHEMA public CASCADE;"))
#         connection.execute(text("CREATE SCHEMA public;"))
#         connection.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
#         connection.commit()

#     Base.metadata.create_all(bind=engine)
#     db = TestingSessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


# def override_get_db():
#     db = TestingSessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


# app.dependency_overrides[get_db] = override_get_db
# client = TestClient(app)


# def _auth_user(db_session):
#     u = User(id=uuid4(), phone="+911234567890", country_code="+91")
#     db_session.add(u)
#     db_session.commit()
#     db_session.refresh(u)
#     return u


# def _override_user(u):
#     def _dep():
#         return u
#     app.dependency_overrides[get_current_user] = _dep


# def test_book_success(db_session):
#     from app.db.models.bus import Bus
#     from app.db.models.city import City
#     from app.db.models.seat import Seat
#     # setup with city FKs
#     from_city, to_city = City(id=uuid4(), name="A"), City(id=uuid4(), name="B")
#     db_session.add_all([from_city, to_city])
#     db_session.commit()
#     bus = Bus(id=uuid4(), operator="X", from_city_id=from_city.id, to_city_id=to_city.id, departure_time="10:00", arrival_time="12:00", fare=100)
#     seat = Seat(id=uuid4(), bus_id=bus.id, seat_no='A1', seat_type='Window', price=500.0, is_available=True)
#     db_session.add_all([bus, seat])
#     db_session.commit()

#     user = _auth_user(db_session)
#     _override_user(user)

#     payload = {
#         "bus_id": str(bus.id),
#         "travel_date": str(date(2025, 1, 1)),
#         "seats": ["A1"],
#         "passenger_details": [],
#         "contact": {"phone": "+911234567890", "email": "x@example.com"}
#     }
#     resp = client.post("/api/book", json=payload)
#     assert resp.status_code == 201
#     data = resp.json()
#     assert data["status"] == "CONFIRMED"
#     assert data["seats"] == ["A1"]


# #negative path: booking without auth should be 401
# def test_book_unauthorized(db_session):
#     payload = {
#         "bus_id": str(uuid4()),
#         "travel_date": str(date(2025, 1, 1)),
#         "seats": ["A1"],
#         "passenger_details": [],
#         "contact": {"phone": "+911234567890", "email": "x@example.com"}
#     }
#     # clear override
#     if get_current_user in app.dependency_overrides:
#         del app.dependency_overrides[get_current_user]
#     resp = client.post("/api/book", json=payload)
#     assert resp.status_code == 401


