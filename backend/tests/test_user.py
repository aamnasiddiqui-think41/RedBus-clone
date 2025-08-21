import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.deps import get_current_user
from app.db.models.user import User
import uuid
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

# --- Mocking get_current_user ---
def get_mock_user():
    return User(id=uuid.uuid4(), phone="+919999999999", name="Test User", country_code="+91")

def override_get_current_user():
    return get_mock_user()

app.dependency_overrides[get_current_user] = override_get_current_user


# --- Tests ---

def test_get_my_profile():
    response = client.get("/api/me")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test User"
    assert data["phone"] == "+919999999999"
    assert data["country_code"] == "+91"

def test_update_my_profile(db_session): # Add db_session fixture
    # 1. Create a user to be updated
    mock_user = get_mock_user()
    db_session.add(mock_user)
    db_session.commit()
    db_session.refresh(mock_user)

    # 2. Override the dependency to return this specific user
    def override_get_specific_user():
        return mock_user
    app.dependency_overrides[get_current_user] = override_get_specific_user

    # 3. Update the profile
    response = client.put("/api/me", json={"name": "Updated Name", "email": "new@example.com"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["email"] == "new@example.com"

    # 4. Clean up dependency override
    app.dependency_overrides.pop(get_current_user)