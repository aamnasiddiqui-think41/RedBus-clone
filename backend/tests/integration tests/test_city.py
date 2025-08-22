# import pytest
# from fastapi.testclient import TestClient
# from sqlalchemy.orm import sessionmaker
# from sqlalchemy import text

# from app.main import app
# from app.db.session import engine, get_db
# from app.db.base import Base


# # --- DB setup/override ---
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


# def test_get_cities_empty(db_session):
#     resp = client.get("/api/cities")
#     assert resp.status_code == 200
#     assert resp.json() == {"cities": []}


# def test_get_cities_with_data(db_session):
#     # Insert two cities directly
#     from app.db.models.city import City
#     from uuid import uuid4
#     c1, c2 = City(id=uuid4(), name="CityA"), City(id=uuid4(), name="CityB")
#     db_session.add_all([c1, c2])
#     db_session.commit()

#     resp = client.get("/api/cities")
#     assert resp.status_code == 200
#     data = resp.json()
#     names = [c["name"] for c in data["cities"]]
#     assert set(names) == {"CityA", "CityB"}


