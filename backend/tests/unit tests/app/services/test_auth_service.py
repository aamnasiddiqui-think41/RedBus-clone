import uuid
import pytest
from datetime import datetime, timedelta, timezone

from app.services.auth_service import AuthService
from app.schemas.auth import OTPRequest
from app.db.models.otp import OTP
from app.db.models.user import User


class DummySession:
    def __init__(self):
        self.objects = []
        self._committed = False

    def add(self, obj):
        self.objects.append(obj)

    def commit(self):
        self._committed = True

    def refresh(self, obj):
        # Simulate DB assigning an ID
        if getattr(obj, 'id', None) is None:
            obj.id = uuid.uuid4()

    def query(self, model):
        class Query:
            def __init__(self, store):
                self.store = store
                self.model = model

            def filter(self, *args, **kwargs):
                # Very small fake filter for OTP by id and User by phone
                results = []
                for obj in self.store:
                    if not isinstance(obj, self.model):
                        continue
                    results.append(obj)

                class _Q:
                    def __init__(self, res):
                        self.res = res

                    def first(self):
                        return self.res[0] if self.res else None

                    def all(self):
                        return self.res

                return _Q(results)

        return Query(self.objects)


def test_request_otp_validates_phone_and_creates_record():
    db = DummySession()
    svc = AuthService(db)
    req = OTPRequest(country_code="+91", phone="9876543210")
    result = svc.request_otp(req)
    assert 'otp_id' in result
    assert any(isinstance(o, OTP) for o in db.objects)


def test_request_otp_invalid_phone():
    db = DummySession()
    svc = AuthService(db)
    with pytest.raises(ValueError):
        svc.request_otp(OTPRequest(country_code="+91", phone="12345"))


def test_verify_otp_flow_success_creates_user_and_token(monkeypatch):
    db = DummySession()
    svc = AuthService(db)

    otp = OTP(phone="+919876543210", otp_code="123456", expires_at=datetime.now(timezone.utc) + timedelta(minutes=5))
    otp.id = uuid.uuid4()
    db.add(otp)

    # Monkeypatch token creation to a static value (patch where it's used)
    import app.services.auth_service as auth_service_module
    monkeypatch.setattr(auth_service_module, 'create_access_token', lambda data: 'testtoken')

    result = svc.verify_otp(str(otp.id), "123456")
    assert result is not None
    assert result['token'] == 'testtoken'
    assert any(isinstance(o, User) for o in db.objects)


#edge case: expired otp should fail
def test_verify_otp_expired_returns_none():
    db = DummySession()
    svc = AuthService(db)
    otp = OTP(phone="+919876543210", otp_code="123456", expires_at=datetime.now(timezone.utc) - timedelta(minutes=1))
    otp.id = uuid.uuid4()
    db.add(otp)
    assert svc.verify_otp(str(otp.id), "123456") is None


#edge case: non-digit otp rejected
def test_verify_otp_non_digit_rejected():
    db = DummySession()
    svc = AuthService(db)
    otp = OTP(phone="+919876543210", otp_code="123456", expires_at=datetime.now(timezone.utc) + timedelta(minutes=5))
    otp.id = uuid.uuid4()
    db.add(otp)
    assert svc.verify_otp(str(otp.id), "12a456") is None


