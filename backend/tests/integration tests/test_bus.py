# import pytest
# from fastapi.testclient import TestClient
# from sqlalchemy.orm import sessionmaker
# from sqlalchemy import text
# from uuid import uuid4
# from datetime import date

# from app.main import app
# from app.db.session import engine, get_db
# from app.db.base import Base


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


# def test_search_buses_empty(db_session):
#     payload = {"from_city_id": str(uuid4()), "to_city_id": str(uuid4())}
#     resp = client.post("/api/search-buses", json=payload)
#     assert resp.status_code == 200
#     data = resp.json()
#     assert data["buses"] == []


# def test_bus_seats_empty_when_no_seats(db_session):
#     from app.db.models.bus import Bus
#     from app.db.models.city import City
#     from_uuid, to_uuid = uuid4(), uuid4()
#     c1, c2 = City(id=from_uuid, name="From"), City(id=to_uuid, name="To")
#     b = Bus(id=uuid4(), operator="X", from_city_id=c1.id, to_city_id=c2.id, departure_time="10:00", arrival_time="12:00", fare=100.0)
#     db_session.add_all([c1, c2])
#     db_session.commit()
#     db_session.add(b)
#     db_session.commit()

#     resp = client.get(f"/api/bus/{b.id}/seats")
#     assert resp.status_code == 200
#     assert resp.json()["seats"] == []


