import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import get_db
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker
from app.db.session import engine
from app.db.base import Base

# --- Test Database Setup ---
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def db_session():
    with engine.connect() as connection:
        connection.execute(text("DROP SCHEMA public CASCADE;"))
        connection.execute(text("CREATE SCHEMA public;"))
        connection.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
        connection.commit()

    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- App Dependency Override ---
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

# --- Tests ---

def test_request_otp_success(db_session):
    response = client.post("/api/login/request-otp", json={"country_code": "+91", "phone": "1234567890"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "otp_id" in data

def test_verify_otp_success_and_get_token(db_session):
    # 1. Request OTP
    response = client.post("/api/login/request-otp", json={"country_code": "+91", "phone": "1111111111"})
    assert response.status_code == 200
    otp_id = response.json()["otp_id"]

    # 2. Get the OTP from the DB
    from app.db.models.otp import OTP
    otp_record = db_session.query(OTP).filter(OTP.id == otp_id).first()
    assert otp_record is not None
    otp_code = otp_record.otp_code

    # 3. Verify OTP
    response = client.post("/api/login/verify-otp", json={"otp_id": str(otp_id), "otp": otp_code})
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert "user" in data
    assert data["user"]["phone"] == "+911111111111"

def test_verify_otp_invalid_code(db_session):
    # 1. Request OTP
    response = client.post("/api/login/request-otp", json={"country_code": "+91", "phone": "2222222222"})
    assert response.status_code == 200
    otp_id = response.json()["otp_id"]

    # 2. Verify with wrong OTP
    response = client.post("/api/login/verify-otp", json={"otp_id": str(otp_id), "otp": "000000"})
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid or expired OTP"

def test_verify_otp_expired(db_session):
    # 1. Request OTP
    response = client.post("/api/login/request-otp", json={"country_code": "+91", "phone": "3333333333"})
    assert response.status_code == 200
    otp_id = response.json()["otp_id"]

    # 2. Get the OTP from the DB
    from app.db.models.otp import OTP
    from datetime import datetime, timedelta
    otp_record = db_session.query(OTP).filter(OTP.id == otp_id).first()
    assert otp_record is not None
    otp_code = otp_record.otp_code

    # 3. Expire the OTP
    otp_record.expires_at = datetime.utcnow() - timedelta(minutes=1)
    db_session.commit()

    # 4. Verify OTP
    response = client.post("/api/login/verify-otp", json={"otp_id": str(otp_id), "otp": otp_code})
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid or expired OTP"
